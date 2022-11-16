import { l10n, OpenDialogOptions, ProgressLocation, window, workspace } from 'vscode'
import { Schema } from '../shared/types'
import { askForProjectId } from '../snippets/shared/askForProjectId'
import { showQuickPick } from '../utils/showQuickPick'
import { iamService } from './iamService'
import { createIssuanceFromCsv, getCsvTemplate } from './issuancesService'
import { parseUploadError } from './csvUploadError'
import { ExplorerResourceTypes } from '../treeView/treeTypes'
import { askForMySchema } from '../snippets/shared/askForMySchema'

export interface TemplateInput {
  projectId: string
  schema: Schema
}

export enum CSVImplementation {
  downloadCsvTemplate,
  uploadCsvFile,
}

const implementationLabels = {
  [CSVImplementation.downloadCsvTemplate]: l10n.t('Download a CSV template'),
  [CSVImplementation.uploadCsvFile]: l10n.t('Upload a CSV file'),
}

const getEditorValue = async (jsonSchemaUrl: string, apiKeyHash: string) => {
  const getExampleTemplate = await getCsvTemplate(
    {
      jsonSchemaUrl,
      apiKeyHash,
    },
    'email',
  )

  return window.showTextDocument(
    await workspace.openTextDocument({
      language: 'csv',
      content: `${getExampleTemplate}`,
    }),
  )
}

export const downloadCsvTemplate = async (
  input: TemplateInput,
  resourceType: ExplorerResourceTypes,
  editor = window.activeTextEditor,
) => {
  const verificationMethod = 'email'
  const projectId = input?.projectId ?? (await askForProjectId())
  if (!projectId) {
    return
  }
  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching template information...'),
    },
    () => iamService.getProjectSummary(projectId),
  )

  switch (resourceType) {
    case ExplorerResourceTypes[ExplorerResourceTypes.schema]:
      getEditorValue(input.schema?.jsonSchemaUrl, apiKeyHash)
      
      break

    case ExplorerResourceTypes[ExplorerResourceTypes.issuance]: {
      const schema = await askForMySchema({ did, apiKeyHash })

      if (!schema) {
        return
      }

      getEditorValue(schema.jsonSchemaUrl, apiKeyHash)
      break

      default:
        throw new Error(`${l10n.t("unknown resourceType:")} ${resourceType}`)
    }
  }


  export const uploadCsvFile = async (input: TemplateInput) => {
    const options: OpenDialogOptions = {
      canSelectMany: false,
      openLabel: l10n.t('Select'),
      canSelectFiles: true,
      canSelectFolders: false,
    }

    const selectedFile = await window.showOpenDialog(options).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        return fileUri[0].fsPath
      }
    })

    if (!selectedFile) {
      return
    }

    const projectSummary = await iamService.getProjectSummary(input.projectId)

    const issuanceCreationData = await createIssuanceFromCsv(selectedFile, {
      apiKeyHash: projectSummary.apiKey.apiKeyHash,
      issuerDid: projectSummary.wallet.did,
      projectId: projectSummary.project.projectId,
      schema: input.schema,
    })

    if (!issuanceCreationData) {
      throw new Error(l10n.t('Unable to upload Issuance'))
    }

    if (issuanceCreationData) {
      const outputChannel = window.createOutputChannel(l10n.t('Show CSV Output'))
      outputChannel.append(JSON.stringify(issuanceCreationData, null, '\t'))
      outputChannel.show()
    }

    if (issuanceCreationData.code) {
      const parsedCsvUploadError = parseUploadError(issuanceCreationData)
      if (parsedCsvUploadError) {
        const outputChannel = window.createOutputChannel(l10n.t('Show CSV Output'))
        outputChannel.append(JSON.stringify(parsedCsvUploadError, null, '\t'))
        outputChannel.show()
      }
    }
  }

  export const initiateIssuanceCsvFlow = async (
    input: TemplateInput,
    resourceType: ExplorerResourceTypes,
  ): Promise<TemplateInput | any> => {
    const supported = [CSVImplementation.downloadCsvTemplate, CSVImplementation.uploadCsvFile]

    const selectedValue = await showQuickPick(
      supported.map((implementation) => [implementationLabels[implementation], implementation]),
      { title: l10n.t('Select an implementation') },
    )

    switch (selectedValue) {
      case CSVImplementation.downloadCsvTemplate:
        await downloadCsvTemplate(input, resourceType)

        break

      case CSVImplementation.uploadCsvFile:
        await uploadCsvFile(input)
        break

      default:
        throw new Error(`${l10n.t("unknown value:")} ${selectedValue}`)
    }
  }
}
