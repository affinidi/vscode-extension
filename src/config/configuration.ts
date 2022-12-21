import deepEqual from 'fast-deep-equal'
import { Disposable } from 'vscode'
import { iamState } from '../features/iam/iamState'
import { notifyError } from '../utils/notifyError'
import { ConfigConfVault } from './configVault'
import { CredentialsConfVault, Session } from './credentialsVault'

export class Configuration implements Disposable {
  private _isValidating = false

  private readonly _disposables: Disposable[] = []

  constructor(
    private readonly configVault: ConfigConfVault,
    private readonly credentialsVault: CredentialsConfVault,
  ) {
    this._disposables.push(
      credentialsVault.onDidAnyChange(() => this.validate()),
      configVault.onDidAnyChange(() => this.validate()),
    )
  }

  init() {
    this.validate()
  }

  dispose() {
    Disposable.from(...this._disposables).dispose()
  }

  private validate() {
    if (this._isValidating) return
    this._isValidating = true

    const configValidation = this.configVault.validate()
    const credentialsValidation = this.credentialsVault.validate()

    if (!configValidation.isValid) {
      notifyError(
        configValidation.error,
        'Invalid user configuration, clearing the configuration file',
      )
      this.configVault.clear()
    }

    if (!credentialsValidation.isValid) {
      notifyError(credentialsValidation.error, 'Invalid session, clearing the credentials file')
      this.credentialsVault.clear()
    }

    this._isValidating = false
  }

  getCurrentUserId(): string | undefined {
    return this.credentialsVault.getSession()?.account.userId
  }

  setActiveProjectId(activeProjectId: string) {
    const currentUserId = this.getCurrentUserId()
    if (currentUserId) {
      this.configVault.amendUserConfig(currentUserId, { activeProjectId })
    }
  }

  async getActiveProjectId(): Promise<string | undefined> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      return undefined
    }

    const userConfig = this.configVault.getUserConfig(currentUserId)
    if (userConfig?.activeProjectId) {
      return userConfig.activeProjectId
    }

    const projects = await iamState.listProjects()
    if (projects.length === 0) {
      this.configVault.amendUserConfig(currentUserId, { activeProjectId: undefined })
      return undefined
    }

    const activeProjectId = projects[0].projectId
    this.configVault.amendUserConfig(currentUserId, { activeProjectId })

    return activeProjectId
  }

  getSession(): Session | undefined {
    return this.credentialsVault.getSession()
  }

  setSession(session: Session): void {
    this.credentialsVault.setSession(session)
  }

  deleteSession() {
    this.credentialsVault.clear()
  }

  isAuthenticated(): boolean {
    return this.getSession() !== undefined
  }

  onDidSessionChange(
    listener: (newValue: Session | undefined, oldValue: Session | undefined) => unknown,
  ): Disposable {
    return this.credentialsVault.onDidAnyChange((newCredentials, oldCredentials) => {
      const oldValue = oldCredentials?.session
      const newValue = newCredentials?.session

      if (!deepEqual(newValue, oldValue)) {
        listener(newValue, oldValue)
      }
    })
  }

  onDidActiveProjectIdChange(
    listener: (newValue: string | undefined, oldValue: string | undefined) => unknown,
  ): Disposable {
    return this.configVault.onDidAnyChange((newConfig, oldConfig) => {
      const currentUserId = this.getCurrentUserId()
      if (!currentUserId) return

      const oldValue = oldConfig?.configs?.[currentUserId]?.activeProjectId
      const newValue = newConfig?.configs?.[currentUserId]?.activeProjectId

      if (newValue !== oldValue) {
        listener(newValue, oldValue)
      }
    })
  }
}
