import { ext } from './extensionVariables'

export const state = {
  async clear() {
    await Promise.all(
      ext.context.globalState.keys().map(async (key) => {
        await ext.context.globalState.update(key, undefined)
      }),
    )
  },
  async clearByPrefix(prefix: string = '') {
    await Promise.all(
      ext.context.globalState.keys().map(async (key) => {
        if (key.startsWith(prefix)) {
          await ext.context.globalState.update(key, undefined)
        }
      }),
    )
  }
}
