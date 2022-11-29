import { ProgressLocation, window, commands, Uri, l10n } from 'vscode'
import * as fs from 'fs'
import * as execa from 'execa'
import { ext } from '../extensionVariables'
import { setActiveProject } from '../features/iam/setActiveProject'

export const WARNING_MESSAGE = l10n.t(
  'Affinidi CLI needs to be installed for some actions in the extension: npm i -g @affinidi/cli',
)
export const ERROR_MESSAGE = l10n.t(
  'Affinidi CLI needs to be installed to proceed with this action: npm i -g @affinidi/cli',
)
export const DIRECTORY_NAME_DUPLICATION_ERROR_MESSAGE = l10n.t(
  'Directory with this name already exist.',
)
export const APP_SUCCESSFULLY_CREATED_MESSAGE = l10n.t('App successfully generated.')
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
      throw new Error(ERROR_MESSAGE)
    }
  }

  async isCliInstalledOrWarn(options?: { type: 'warning' | 'error' }): Promise<boolean> {
    const isInstalled = await this.isCliInstalled()

    if (!isInstalled) {
      if (options?.type === 'warning') {
        window.showWarningMessage(WARNING_MESSAGE)
        ext.outputChannel.appendLine(WARNING_MESSAGE)
      } else {
        window.showErrorMessage(ERROR_MESSAGE)
        ext.outputChannel.appendLine(ERROR_MESSAGE)
      }
    }

    return isInstalled
  }

  async setActiveProject(projectId: string) {
    await this.exec.command(`affinidi use project ${projectId}`)
    setActiveProject(projectId)
  }

  async generateApp({ path }: { path: string }): Promise<void> {
    if (fs.existsSync(path)) {
      window.showErrorMessage(DIRECTORY_NAME_DUPLICATION_ERROR_MESSAGE)
      return
    }

    const command = buildAppGenerateCommand(path)
    ext.outputChannel.appendLine(command)

    try {
      const { stdout } = await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: l10n.t('App is generating...'),
        },
        async () => {
          return this.exec.command(command)
        },
      )

      ext.outputChannel.append(stdout)

      window.showInformationMessage(APP_SUCCESSFULLY_CREATED_MESSAGE)

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
