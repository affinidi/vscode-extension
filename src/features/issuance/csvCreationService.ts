import * as fs from 'fs'
import { l10n, OpenDialogOptions, ProgressLocation, window, workspace } from 'vscode'
import { Schema } from '../../utils/types'
import { iamHelpers } from '../iam/iamHelpers'
import { showQuickPick } from '../../utils/showQuickPick'
import { parseUploadError } from './csvUploadError'
import { issuanceClient } from './issuanceClient'
import { ext } from '../../extensionVariables'
import { csvMessage, snippetMessage, labels } from '../../messages/messages'
import { schemaManagerHelpers } from '../schema-manager/schemaManagerHelpers'
import { iamState } from '../iam/iamState'

export enum CSVImplementation {
  openCsvTemplate,
  uploadCsvFile,
}

export const implementationLabels = {
  [CSVImplementation.openCsvTemplate]: csvMessage.openCsvTemplate,
  [CSVImplementation.uploadCsvFile]: csvMessage.uploadCsvFile,
}

const openCsvTemplate = async (input: { schema: Schema; projectId: string }) => {
  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(input.projectId)

  const template = await window.withProgress(
    { location: ProgressLocation.Notification, title: csvMessage.downloadingCsvTemplate },
    () =>
      issuanceClient.getCsvTemplate(
        {
          jsonSchemaUrl: input.schema.jsonSchemaUrl,
          verificationMethod: 'email',
        },
        { apiKeyHash },
      ),
  )

  await window.showTextDocument(
    await workspace.openTextDocument({
      language: 'plaintext',
      content: template,
    }),
  )
}

const uploadCsvFile = async (input: { schema: Schema; projectId: string; walletUrl: string }) => {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: labels.select,
    canSelectFiles: true,
    canSelectFolders: false,
  }

  const selectedFiles = await window.showOpenDialog(options)
  const selectedFilePath = selectedFiles?.[0]?.fsPath

  if (!selectedFilePath) {
    return
  }

  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = await iamState.requireProjectSummary(input.projectId)

  const schema =
    input.schema ??
    (await schemaManagerHelpers.askForAuthoredSchema({
      projectId: input.projectId,
      includeExample: true,
    }))
  if (!schema) return

  try {
    const { issuance } = await window.withProgress(
      { location: ProgressLocation.Notification, title: csvMessage.uploadingCsvFile },
      () =>
        issuanceClient.createFromCsv(
          {
            projectId: input.projectId,
            template: {
              walletUrl: input.walletUrl,
              issuerDid: did,
              schema,
              verification: {
                method: 'email',
              },
            },
          },
          fs.createReadStream(selectedFilePath),
          { apiKeyHash },
        ),
    )

    if (issuance) {
      window.showInformationMessage(csvMessage.issuanceCreationMessage)
      ext.outputChannel.appendLine(csvMessage.issuanceCreationMessage)
      ext.outputChannel.appendLine(l10n.t(`Issuance ID: {0}`, issuance.id))
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    const parsedCsvUploadError = parseUploadError(error)

    if (parsedCsvUploadError) {
      window.showErrorMessage(`${csvMessage.csvValidationError} ${csvMessage.checkOutputChannel}`)
      ext.outputChannel.appendLine(csvMessage.csvValidationError)
      ext.outputChannel.appendLine(JSON.stringify(parsedCsvUploadError, null, 2))
      ext.outputChannel.show()
    }
  }
}

const initiateIssuanceCsvFlow = async (input: {
  schema: Schema
  projectId?: string
  walletUrl?: string
}): Promise<void> => {
  const projectId = input.projectId ?? (await iamHelpers.askForProjectId())
  if (!projectId) return

  const walletUrl = input.walletUrl ?? (await iamHelpers.askForWalletUrl())
  if (!walletUrl) return

  const supported = [CSVImplementation.openCsvTemplate, CSVImplementation.uploadCsvFile]

  const selectedValue = await showQuickPick(
    supported.map((implementation) => [implementationLabels[implementation], implementation]),
    { title: snippetMessage.selectImplementation },
  )

  switch (selectedValue) {
    case CSVImplementation.openCsvTemplate:
      await csvCreationService.openCsvTemplate({ projectId, schema: input.schema })
      break
    case CSVImplementation.uploadCsvFile:
      await csvCreationService.uploadCsvFile({ projectId, schema: input.schema, walletUrl })
      break
    default:
  }
}

export const csvCreationService = {
  openCsvTemplate,
  uploadCsvFile,
  initiateIssuanceCsvFlow,
}
