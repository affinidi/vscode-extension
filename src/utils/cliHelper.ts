import { ProgressLocation, window, commands, Uri } from 'vscode'
import fs from 'fs'
import execa from 'execa'
import { generateApplication } from '@affinidi/cli'
import { ext } from '../extensionVariables'
import { cliMessage, generatorMessage } from './messages'
import { notifyError } from './notifyError'
import { configVault } from '../config/configVault'
import { iamState } from '../features/iam/iamState'
import { UseCasesAppTypes } from './types'

interface ExecInterface {
  command: (command: string) => Promise<{ stdout: string }>
}

export class CliHelper {
  constructor(private readonly exec: ExecInterface) {}

  async isCliInstalled(): Promise<boolean> {
    const { stdout } = await this.exec.command('npm list -g')
    return stdout.includes('@affinidi/cli')
  }

  async suggestInstallingCLI(): Promise<boolean> {
    const isInstalled = await this.isCliInstalled()

    if (!isInstalled) {
      window.showInformationMessage(cliMessage.tryCli)
      ext.outputChannel.appendLine(cliMessage.tryCli)
    }

    return isInstalled
  }

  async generateApp({ path, useCase }: { path: string; useCase: UseCasesAppTypes }): Promise<void> {
    if (fs.existsSync(path)) {
      window.showErrorMessage(generatorMessage.directoryNameDuplication)
      return
    }

    ext.outputChannel.appendLine(cliMessage.appIsGenerating)

    const activeProjectId = await configVault.getActiveProjectId()
    const {
      apiKey: { apiKeyHash },
      project: { projectId },
      wallet: { did },
    } = await iamState.requireProjectSummary(activeProjectId ?? '')

    try {
      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: cliMessage.appIsGenerating,
        },
        () =>
          generateApplication({
            use_case: useCase,
            name: path,
            output: 'plaintext',
            apiKey: apiKeyHash,
            projectDid: did,
            projectId,
          }),
      )

      window.showInformationMessage(cliMessage.appGenerated)

      const uri = Uri.file(path)
      await commands.executeCommand('vscode.openFolder', uri, {
        forceNewWindow: true,
      })
    } catch (error) {
      notifyError(error, cliMessage.unableToGenerateApp)
    }
  }
}

export const cliHelper = new CliHelper(execa)
