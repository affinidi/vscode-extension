import { commands } from 'vscode'
import { configVault } from '../../config/configVault'
import { credentialsVault } from '../../config/credentialsVault'
import { ext } from '../../extensionVariables'
import { showQuickPick } from '../../utils/showQuickPick'
import { Environment } from '../../utils/types'
import { DevelopmentStatusBar } from './DevelopmentStatusBar'

async function changeEnvironment() {
  const environment: Environment | undefined = await showQuickPick(
    [
      ['Production', 'prod'],
      ['Staging', 'staging'],
      ['Development', 'dev'],
    ],
    { title: 'Select environment' },
  )

  if (!environment || environment === credentialsVault.getEnvironment()) return

  configVault.clear()
  credentialsVault.clear()
  credentialsVault.setEnvironment(environment)

  commands.executeCommand('workbench.action.reloadWindow')
}

export async function initDevelopment() {
  const developmentStatusBar = new DevelopmentStatusBar()
  developmentStatusBar.update()

  ext.context.subscriptions.push(developmentStatusBar)
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.changeEnvironment', changeEnvironment)
  )
}
