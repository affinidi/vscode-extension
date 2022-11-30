import { ProgressLocation, window, commands, Uri } from 'vscode'
import * as fs from 'fs'
import * as execa from 'execa'
import { ext } from '../extensionVariables'
import { cliMessage, generatorMessage } from '../messages/messages'

interface ExecInterface {
  command: (command: string) => Promise<{ stdout: string }>
}

export const buildAppGenerateCommand = (path: string) =>
  `affinidi generate-application --use-case certification-and-verification --name ${path.replaceAll(
    ' ',
    '\\ ',
  )}`

export class CliHelper {
  constructor(private readonly exec: ExecInterface) {}

  async isCliInstalled(): Promise<boolean> {
    const { stdout } = await this.exec.command('npm list -g')
    return stdout.includes('@affinidi/cli')
  }

  async assertCliIsInstalled(): Promise<void> {
    if (!(await this.isCliInstalled())) {
      throw new Error(cliMessage.cliNeedsToBeInstalledForAction)
    }
  }

  async isCliInstalledOrWarn(options?: { type: 'warning' | 'error' }): Promise<boolean> {
    const isInstalled = await this.isCliInstalled()

    if (!isInstalled) {
      if (options?.type === 'warning') {
        window.showWarningMessage(cliMessage.cliNeedsToBeInstalledForExtension)
        ext.outputChannel.appendLine(cliMessage.cliNeedsToBeInstalledForExtension)
      } else {
        window.showErrorMessage(cliMessage.cliNeedsToBeInstalledForAction)
        ext.outputChannel.appendLine(cliMessage.cliNeedsToBeInstalledForAction)
      }
    }

    return isInstalled
  }

  async setActiveProject(projectId: string) {
    await this.exec.command(`affinidi use project ${projectId}`)
  }

  async generateApp({ path }: { path: string }): Promise<void> {
    if (fs.existsSync(path)) {
      window.showErrorMessage(generatorMessage.directoryNameDuplication)
      return
    }

    const command = buildAppGenerateCommand(path)
    ext.outputChannel.appendLine(command)

    try {
      const { stdout } = await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: `${cliMessage.appIsGenerating}`,
        },
        async () => {
          return this.exec.command(command)
        },
      )

      ext.outputChannel.append(stdout)

      window.showInformationMessage(cliMessage.appGenerated)

      const uri = Uri.file(path)
      await commands.executeCommand('vscode.openFolder', uri, {
        forceNewWindow: true,
      })
    } catch (error) {
      ext.outputChannel.append(`${error}`)
    }
  }
}

export const cliHelper = new CliHelper(execa)
