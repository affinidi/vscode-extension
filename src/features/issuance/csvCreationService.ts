import * as fs from 'fs'
import { OpenDialogOptions, window, workspace } from 'vscode'
import { Schema } from '../../shared/types'
import { iamHelpers } from '../iam/iamHelpers'
import { showQuickPick } from '../../utils/showQuickPick'
import { parseUploadError } from './csvUploadError'
import { issuanceClient } from './issuanceClient'
import { ext } from '../../extensionVariables'
import { csvMessage, errorMessage, snippetMessage, labels } from '../../messages/messages'

export interface TemplateInput {
  projectId: string
  schema: Schema
}

export enum CSVImplementation {
  openCsvTemplate,
  uploadCsvFile,
}

const implementationLabels = {
  [CSVImplementation.openCsvTemplate]: csvMessage.openCsvTemplate,
  [CSVImplementation.uploadCsvFile]: csvMessage.uploadCsvFile,
}

export const openCsvTemplate = async (input: TemplateInput) => {
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

export const uploadCsvFile = async (input: TemplateInput) => {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: `${labels.select}`,
    canSelectFiles: true,
    canSelectFolders: false,
  }

  const selectedFiles = await window.showOpenDialog(options)
  const selectedFilePath = selectedFiles?.[0]?.fsPath
  if (!selectedFilePath) {
    return
  }

  const projectSummary = iamHelpers.requireProjectSummary(input.projectId)

  try {
    const { issuance } = await issuanceClient.createFromCsv(
      {
        projectId: projectSummary.project.projectId,
        template: {
          issuerDid: projectSummary.wallet.did,
          schema: input.schema,
          verification: {
            method: 'email',
          },
        },
      },
      fs.createReadStream(selectedFilePath),
      { apiKeyHash: projectSummary.apiKey.apiKeyHash },
    )

    if (issuance) {
      ext.outputChannel.appendLine(`${csvMessage.IssaunceCreationMessage}, ${issuance.id}`)
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    const parsedCsvUploadError = parseUploadError(error)
    if (parsedCsvUploadError) {
      ext.outputChannel.appendLine(
        `${csvMessage.csvValidationError},
        ${JSON.stringify(parsedCsvUploadError, null, 2)}`,
      )
      ext.outputChannel.show()
    }
  }
}

export const initiateIssuanceCsvFlow = async (input: TemplateInput): Promise<void> => {
  const supported = [CSVImplementation.openCsvTemplate, CSVImplementation.uploadCsvFile]

  const selectedValue = await showQuickPick(
    supported.map((implementation) => [implementationLabels[implementation], implementation]),
    { title: `${snippetMessage.selectImplementation}` },
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
