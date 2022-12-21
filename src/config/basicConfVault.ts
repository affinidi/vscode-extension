import { z } from 'zod'
import Conf from 'conf'
import { Disposable } from 'vscode'

export type BasicConfigType = {
  version: number
}

export class BasicConfVault<ConfigType extends BasicConfigType> {
  constructor(
    protected readonly version: number,
    protected readonly schema: z.SomeZodObject,
    protected readonly conf: Conf<ConfigType>,
    protected readonly defaults: ConfigType,
  ) {}

  clear(): void {
    this.conf.store = JSON.parse(JSON.stringify(this.defaults))
  }

  validate(): { isValid: boolean; error?: Error } {
    const { version } = this.conf.store
    if (version !== this.version) {
      return {
        isValid: false,
        error: new Error(`Invalid config version "${version}", expected "${this.version}"`),
      }
    }

    const result = this.schema.safeParse(this.conf.store)
    return {
      isValid: result.success,
      error: result.success ? undefined : result.error,
    }
  }

  onDidAnyChange(
    listener: (
      newConfig: Readonly<ConfigType> | undefined,
      oldConfig: Readonly<ConfigType> | undefined,
    ) => unknown,
  ): Disposable {
    return {
      dispose: this.conf.onDidAnyChange(listener),
    }
  }
}
