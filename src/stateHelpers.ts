import { Disposable, EventEmitter } from 'vscode'
import { ext } from './extensionVariables'

const onDidClearEmitter = new EventEmitter<string | undefined>()

export const stateHelpers = {
  clear() {
    this.clearByPrefix()
  },
  clearByPrefix(prefix?: string) {
    for (const key of ext.context.globalState.keys()) {
      if (!prefix || key.startsWith(prefix)) {
        ext.context.globalState.update(key, undefined)
      }
    }

    onDidClearEmitter.fire(prefix)
  },
  get<T>(key: string) {
    return ext.context.globalState.get<T>(key)
  },
  update(key: string, value: any): void {
    ext.context.globalState.update(key, value)
  },
  onDidClear(listener: (prefix: string | undefined) => unknown): Disposable {
    return onDidClearEmitter.event(listener)
  }
}
