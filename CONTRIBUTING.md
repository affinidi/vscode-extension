# Contributing to Affinidi VS Code Extension

## Getting started

If you want to implement a new feature, create a corresponding folder in the `src/features/` directory.

As an example, let's say you want to implement a `wallet` feature: 
1. Create `src/features/wallet/` directory
2. Add your feature to `src/features/feature.ts` enum:
  ```ts
  export enum Feature {
    // ...
    WALLET = 'wallet'
  }
  ```
3. If you wish to add an About page for your feature, make sure to update the `src/features/getFeatureMarkdownUri.ts` file
4. To add `View Properties` command to your feature items, just update the `src/features/showElementProperties.ts` file

## Adding a feature to the tree view

To add custom tree items to the Explorer View, you need to implement `ExplorerProvider` interface:
1. Create `src/features/wallet/tree/walletExplorerProvider.ts` class:
  ```ts
  import { ExplorerProvider } from '../../tree/explorerTree'

  export class WalletExplorerProvider implements ExplorerProvider {
    public async getChildren(
      parent: BasicTreeItem | undefined,
    ): Promise<BasicTreeItem[] | undefined> {
      // ...
    }
  }
  ```
2. Add this provider to the `ExplorerTree` constructor in `extension.ts` file:
  ```ts
  ext.explorerTree = new ExplorerTree([
    // ...
    new WalletExplorerProvider(),
  ])
  ```


## Implementing a custom command

For example, we want to implement a `createWallet` command.  

To do that, just create a command handler in `src/features/wallet/` directory and, ideally, a `src/features/wallet/initWallet.ts` file, where you register the command:
```ts
import { commands } from 'vscode'
import { createWallet } from './createWallet'

export function initWallet() {
  commands.registerCommand('affinidi.createWallet', createWallet)
}
```

```ts
enum WalletType {
  PERSONAL,
  WORK
}

export function createWallet() {
  const type = await showQuickPick([
    ['Personal', WalletType.PERSONAL],
    ['Work', WalletType.WORK],
  ])

  const name = await window.showInputBox({ prompt: 'Enter wallet name' })

  await walletClient.createWallet({ type, name })
}
```

> We have a lot of useful tools that you can use:
> - `src/utils/logger.ts` for logging
> - `src/utils/notifyError.ts` for error notifications
> - `src/utils/openReadOnlyContent.ts` for opening immutable editors
> - `src/utils/showQuickPick.ts` – an improved alternative to `window.showQuickPick()`

## Creating snippets & scripts

### VS Code snippets

Creating a VS Code snippet is easy – you just need to add it to the `snippets/<language>.json` file. Use existing snippets as an example.

> For instructions on how to use snippets please refer to [Visual Studio Code snippets documentation](https://code.visualstudio.com/docs/editor/userdefinedsnippets).

### Script generators

Script generator is a command that allows you to generate ready-to-use snippets and files (with boilerplates). With these generators you can insert predefined values into the snippet – such as Project ID, API Key Hash, etc.

Script generators are located in `src/snippets/` directory.  
Boilerplates for the files are located in the `src/snippets/boilerplates/` directory.

In order to create a snippet, you need to use `createSnippetCommand()` utility to create a `src/snippets/get-wallet-details/snippet.ts` file:
```ts
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'

// used as an input to the insertGetWalletDetailsSnippet() command
export interface CommandInput { walletId?: string }

// used as an input to the snippet implementation in <language>.ts file
export interface SnippetInput { walletId: string }

// snippet implementations for different languages
export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
}

export const insertGetWalletDetailsSnippet = createSnippetCommand<SnippetInput, CommandInput>(
  'getWalletDetails',
  implementations,
  async (input) => {
    const walletId = input?.walletId ?? await askForWalletId()

    // here we prepare the data that is needed to generate a snippet

    return { walletId }
  },
)
```

Example of a snippet implementation (`javascript.ts` file):
```ts
import type { SnippetInput } from './snippet'

export function fetch(input: SnippetInput) {
  return `\
const walletId = '${input.walletId}';
const response = await fetch('https://wallet.affinidi.com/' + walletId);

console.log('Wallet details:', await response.json());`
}
```

Supported snippet implementations:
- `fetch` (using Fetch API)
- `sdk` (using Affinidi Client SDK)

In most of our snippets, we only support JavaScript and TypeScript, but you're free to add as many languages as you need.

When the snippet command is implemented, don't forget to add it to the `src/snippets/initSnippets.ts` file:
```ts
import { insertGetWalletDetailsSnippet } from './get-wallet-details/snippet'

export const initSnippets = () => {
  // ...

  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.getWalletDetails', async () => {
      await insertGetWalletDetailsSnippet()

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.codegen.getWalletDetails',
        },
      })
    }),
  )
}
```

## Analytics & telemetry

In order to send an analytics event, use `sendEventToAnalytics()` method:
```ts
import { sendEventToAnalytics, EventNames, EventSubCategory } from './services/analyticsStreamApiService'

// ...

sendEventToAnalytics({
  name: EventNames.someEventName,
  subCategory: EventSubCategory.someEventSubCategory,
  metadata: { /* arbitrary event metadata if necessary */ },
})
```

## Messages

We store all of our messages (errors, labels, etc.) in `src/messages/messages.ts` file.

## Configuration & credentials

Configuration of the extension and CLI is stored in the `~/.affinidi/config.json` file.  
Credentials and other sensitive data is stored in the `~/.affinidi/credentials.json` file.

You can access the data in these files by using `src/config/configVault.ts` and `src/config/credentialsVault.ts`:

```ts
import { configVault } from './config/configVault'

// ...

const activeProjectId = await configVault.requireActiveProjectId()
console.log(activeProjectId)
```

## Github repository & pull requests

Please follow semantic release conventions for your commits and pull request names.  
Read about it here: https://github.com/semantic-release/semantic-release

For example, a correct commit name or pull request name is: `fix: add test` or `feat: implement a tree view`

Don't forget to write a meaningful description to your pull request.  
If necessary, attach a screenshot of UI changes.
