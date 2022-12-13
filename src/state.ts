import { ext } from './extensionVariables'

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
  },
}
