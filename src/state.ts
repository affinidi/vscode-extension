import { ext } from './extensionVariables'

export const state = {
  async clear(prefix: string = '') {
    await Promise.all(
      ext.context.globalState.keys().map(async (key) => {
        if (key.startsWith(prefix)) {
          await ext.context.globalState.update(key, undefined)
        }
      }),
    )
  }
}
