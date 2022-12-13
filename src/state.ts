import { Disposable, EventEmitter } from 'vscode'
import { ext } from './extensionVariables'

const onDidClearEmitter = new EventEmitter<string | undefined>()

export const state = {
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
  onDidClear(listener: (prefix: string | undefined) => unknown): Disposable {
    return onDidClearEmitter.event(listener)
  }
}
