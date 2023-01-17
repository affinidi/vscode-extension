import { Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { credentialsVault } from '../../config/credentialsVault'

export class DevelopmentStatusBar implements Disposable {
  private readonly item: StatusBarItem

  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  }

  async update() {
    this.item.text = `env: ${credentialsVault.getEnvironment()}`
    this.item.command = 'affinidi.changeEnvironment'
    this.item.show()
  }

  dispose() {
    this.item.dispose()
  }
}
