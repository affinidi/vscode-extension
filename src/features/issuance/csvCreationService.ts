import * as fs from 'fs'
import { l10n, OpenDialogOptions, window, workspace } from 'vscode'
import { Schema } from '../../shared/types'
import { iamHelpers } from '../iam/iamHelpers'
import { showQuickPick } from '../../utils/showQuickPick'
import { parseUploadError } from './csvUploadError'
import { issuanceClient } from './issuanceClient'
import { ext } from '../../extensionVariables'
import { schemaManagerHelpers } from '../schema-manager/schemaManagerHelpers'
import { iamState } from '../iam/iamState'

export interface TemplateInput {
  projectId: string
  schema: Schema
}

export enum CSVImplementation {
  openCsvTemplate,
  uploadCsvFile,
}

const implementationLabels = {
  [CSVImplementation.openCsvTemplate]: l10n.t('Open a CSV template'),
  [CSVImplementation.uploadCsvFile]: l10n.t('Upload a CSV file'),
}

export const openCsvTemplate = async (input: TemplateInput) => {
  const projectId = input?.projectId ?? (await iamHelpers.askForProjectId())
  if (!projectId) {
    return
  }

  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(projectId)

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
    openLabel: l10n.t('Select'),
    canSelectFiles: true,
    canSelectFolders: false,
  }

  const selectedFiles = await window.showOpenDialog(options)
  const selectedFilePath = selectedFiles?.[0]?.fsPath
  if (!selectedFilePath) {
    return
  }

  const { apiKey: { apiKeyHash }, wallet: { did } } = await iamState.requireProjectSummary(input.projectId)
  const schema = input.schema ?? await schemaManagerHelpers.askForMySchema({ includeExample: true, did }, { apiKeyHash })
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
      ext.outputChannel.appendLine(
        l10n.t('Issuance has been created and the offers were sent. Issuance ID: {0}', issuance.id),
      )
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    const parsedCsvUploadError = parseUploadError(error)
    if (parsedCsvUploadError) {
      ext.outputChannel.appendLine(
        l10n.t(
          'Could not create issuance due to validation errors in the CSV file: {0}',
          JSON.stringify(parsedCsvUploadError, null, 2),
        ),
      )
      ext.outputChannel.show()
    }
  }
}

export const initiateIssuanceCsvFlow = async (input: TemplateInput): Promise<void> => {
  const supported = [CSVImplementation.openCsvTemplate, CSVImplementation.uploadCsvFile]

  const selectedValue = await showQuickPick(
    supported.map((implementation) => [implementationLabels[implementation], implementation]),
    { title: l10n.t('Select an implementation') },
  )

  switch (selectedValue) {
    case CSVImplementation.openCsvTemplate:
      await openCsvTemplate(input)
      break
    case CSVImplementation.uploadCsvFile:
      await uploadCsvFile(input)
      break
    default:
      throw new Error(`${l10n.t('unknown value:')} ${selectedValue}`)
  }
}
