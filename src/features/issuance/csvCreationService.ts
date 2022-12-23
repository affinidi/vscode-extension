import fs from 'fs'
import { OpenDialogOptions, ProgressLocation, window, workspace } from 'vscode'
import { Schema } from '../../utils/types'
import { showQuickPick } from '../../utils/showQuickPick'
import { parseUploadError } from './csvUploadError'
import { issuanceClient } from './issuanceClient'
import { ext } from '../../extensionVariables'
import { csvMessage, snippetMessage, labels, issuanceMessage } from '../../messages/messages'
import { schemaManagerHelpers } from '../schema-manager/schemaManagerHelpers'
import { iamState } from '../iam/iamState'
import { configVault } from '../../config/configVault'
import { iamHelpers } from '../iam/iamHelpers'
import { notifyError } from '../../utils/notifyError'

export enum CSVImplementation {
  openCsvTemplate,
  uploadCsvFile,
}

export const implementationLabels = {
  [CSVImplementation.openCsvTemplate]: csvMessage.openCsvTemplate,
  [CSVImplementation.uploadCsvFile]: csvMessage.uploadCsvFile,
}

const openCsvTemplate = async (input: { schema: Schema; projectId: string }) => {
  const projectSummary = await iamState.getProjectSummary(input.projectId)
  if (!projectSummary) return
  const {
    apiKey: { apiKeyHash },
  } = projectSummary

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

  const projectSummary = await iamState.getProjectSummary(input.projectId)
  if (!projectSummary) return
  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = projectSummary

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
      ext.outputChannel.appendLine(`${labels.issuanceID}: ${issuance.id}`)
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    const parsedCsvUploadError = parseUploadError(error)

    if (parsedCsvUploadError) {
      notifyError(error, csvMessage.csvValidationError)
      ext.outputChannel.appendLine(JSON.stringify(parsedCsvUploadError, null, 2))
    } else {
      notifyError(error, issuanceMessage.failedToCreateIssuance)
    }
  }
}

const initiateIssuanceCsvFlow = async (input: {
  schema?: Schema
  projectId?: string
  walletUrl?: string
}): Promise<void> => {
  const projectId = input.projectId ?? (await configVault.getActiveProjectId())
  if (!projectId) {
    return
  }

  const supported = [CSVImplementation.openCsvTemplate, CSVImplementation.uploadCsvFile]

  const selectedValue = await showQuickPick(
    supported.map((implementation) => [implementationLabels[implementation], implementation]),
    { title: snippetMessage.selectImplementation },
  )

  const schema = input.schema ?? (await schemaManagerHelpers.askForAuthoredSchema({ projectId }))
  if (!schema) return

  switch (selectedValue) {
    case CSVImplementation.openCsvTemplate:
      await csvCreationService.openCsvTemplate({ projectId, schema })
      break
    case CSVImplementation.uploadCsvFile:
      {
        const walletUrl = input.walletUrl ?? (await iamHelpers.askForWalletUrl())
        if (!walletUrl) return
        await csvCreationService.uploadCsvFile({ projectId, schema, walletUrl })
      }
      break
    default:
  }
}

export const csvCreationService = {
  openCsvTemplate,
  uploadCsvFile,
  initiateIssuanceCsvFlow,
}
