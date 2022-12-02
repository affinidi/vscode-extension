import * as fs from 'fs'
import { l10n, OpenDialogOptions, window, workspace } from 'vscode'
import { Schema } from '../../utils/types'
import { iamHelpers } from '../iam/iamHelpers'
import { showQuickPick } from '../../utils/showQuickPick'
import { parseUploadError } from './csvUploadError'
import { issuanceClient } from './issuanceClient'
import { ext } from '../../extensionVariables'
import { csvMessage, errorMessage, snippetMessage, labels } from '../../messages/messages'
import { schemaManagerHelpers } from '../schema-manager/schemaManagerHelpers'

interface TemplateInput {
  projectId: string
  schema: Schema
}

export enum CSVImplementation {
  openCsvTemplate,
  uploadCsvFile,
}

export const implementationLabels = {
  [CSVImplementation.openCsvTemplate]: csvMessage.openCsvTemplate,
  [CSVImplementation.uploadCsvFile]: csvMessage.uploadCsvFile,
}

const openCsvTemplate = async (input: TemplateInput) => {
  const projectId = input?.projectId ?? (await iamHelpers.askForProjectId())
  if (!projectId) {
    return
  }

  const {
    apiKey: { apiKeyHash },
  } = iamHelpers.requireProjectSummary(projectId)

  const template = await issuanceClient.getCsvTemplate(
    {
      jsonSchemaUrl: input.schema.jsonSchemaUrl,
      verificationMethod: 'email',
    },
    { apiKeyHash },
  )

  await window.showTextDocument(
    await workspace.openTextDocument({
      language: 'plaintext',
      content: template,
    }),
  )
}

const uploadCsvFile = async (input: TemplateInput) => {
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
  } = iamHelpers.requireProjectSummary(input.projectId)
  const schema =
    input.schema ??
    (await schemaManagerHelpers.askForMySchema({ includeExample: true, did }, { apiKeyHash }))
  if (!schema) return

  try {
    const { issuance } = await issuanceClient.createFromCsv(
      {
        projectId: input.projectId,
        template: {
          issuerDid: did,
          schema,
          verification: {
            method: 'email',
          },
        },
      },
      fs.createReadStream(selectedFilePath),
      { apiKeyHash },
    )

    if (issuance) {
      ext.outputChannel.appendLine(l10n.t(`${csvMessage.issaunceCreationMessage} {0}`, issuance.id))
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    const parsedCsvUploadError = parseUploadError(error)

    if (parsedCsvUploadError) {
      ext.outputChannel.appendLine(
        l10n.t(
          `${csvMessage.csvValidationError} {0} ${JSON.stringify(parsedCsvUploadError, null, 2)}`,
        ),
      )
      ext.outputChannel.show()
    }
  }
}

const initiateIssuanceCsvFlow = async (input: TemplateInput): Promise<void> => {
  const supported = [CSVImplementation.openCsvTemplate, CSVImplementation.uploadCsvFile]

  const selectedValue = await showQuickPick(
    supported.map((implementation) => [implementationLabels[implementation], implementation]),
    { title: snippetMessage.selectImplementation },
  )

  switch (selectedValue) {
    case CSVImplementation.openCsvTemplate:
      await openCsvTemplate(input)
      break
    case CSVImplementation.uploadCsvFile:
      await uploadCsvFile(input)
      break
    default:
      throw new Error(`${errorMessage.unknownValue} ${selectedValue}`)
  }
}

export const csvCreationService = {
  openCsvTemplate,
  uploadCsvFile,
  initiateIssuanceCsvFlow,
}
