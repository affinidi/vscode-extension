# Contributing to Affinidi VS Code Extension

## Getting started

Clone the repository and run `npm install` command.

Some useful commands:
- Run `npm test` to run integrated tests
   > You can find them in the `src/test/suite` directory.  
   > `npm run coverage` can be used to calculate per-file test coverage
- Use `npm run compile` or `npm run dev` to build the extension
   > You don't need to run these to test the extension.  
   > These are useful when you want to check for compile errors.
- `npm run lint` can be used to check for linting errors
- Run `npm run esbuild` to compile a single-file output to `out/main.js`, which represents the final build that will be published to VS Code extension marketplace
- Use `npm run generate-translation` to update translation files using `@vscode/l10n-dev` tool
- `npm run update-toolkit` can be used to update the WebView UI toolkit to the latest version in the `media/vendor` directory – this is used in web views to render VS Code UI components

To debug the extension, just open the repository in your VS Code application and press `F5` (or `Run Extension` in the `Run in Debug` sidebar view).  
This will open a new "Extension Host" VS Code window with the extension loaded in it.

> Check out the in-depth instructions in the [vsc-extension-quickstart.md](vsc-extension-quickstart.md) file for running, debugging and testing the extension.

## Implementing a new feature

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
## Creating a custom tree view for the feature

In case if it's absolutely necessary, you may add a new tree view to the sidebar.

To do that, implement a `TreeDataProvider` interface (provided by the `vscode` package) in the `src/tree` directory:
```ts
import { TreeDataProvider } from 'vscode'
import { BasicTreeItem } from './basicTreeItem'

export class CustomTree implements TreeDataProvider<BasicTreeItem> {
  getTreeItem = (element: BasicTreeItem) => element

  async getChildren(): Promise<BasicTreeItem[]> {
    // ...
  }
}
```

> Note: Use `BasicTreeItem` or `BasicTreeItemWithProject` as a base for your tree items instead of `TreeItem` provided by the `vscode` package.

Then add the tree to `src/extensionVariables.ts`:
```ts
export namespace ext {
  // ...
  export let customTree: CustomTree
}
```

Finally, instantiate your tree in the `extension.ts` file and create a tree view for it:
```ts
ext.customTree = new CustomTree()

window.createTreeView('affinidiCustom', {
  treeDataProvider: ext.customTree,
  canSelectMany: false,
  showCollapseAll: true,
})
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

Don't forget to add your new command to the `activationEvents` section in `package.json` file.

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

## State management

In some cases, you might want to save the loaded data into the local storage to avoid fetching it every time.

This is mostly useful for the items, that are shown in the sidebar tree view: projects, issuances, schemas, etc.

> Note: Do NOT use state management to store frequently updated data or user input-dependent data (like search results, for example).

To do that, implement a `src/features/wallet/walletState.ts` file:
```ts
import { WalletDto } from '@affinidi/client-wallet'
import { state } from '../../state'
import { walletClient } from './walletClient'

const PREFIX = 'wallet:'
const storageKey = (input: string) => PREFIX + input

export class WalletState {
  async listWallets(): Promise<WalletDto[]> {
    return this.fetchWallets()
  }

  async getWalletById(walletId: string): Promise<WalletDto | undefined> {
    return (await this.fetchWallets()).find((p) => p.walletId === walletId)
  }

  async clear() {
    await state.clearByPrefix(PREFIX)
  }

  private async fetchWallets(): Promise<WalletDto[]> {
    const key = storageKey('list')
    const stored = ext.context.globalState.get<WalletDto[]>(key)
    if (stored) return stored

    const { wallets } = await walletClient.listWallets()
    await ext.context.globalState.update(key, wallets)

    return wallets
  }
}

export const walletState = new WalletState()
```

Now you can access wallet list like this:
```ts
import { walletState } from './features/wallet/walletState.ts'

const wallet = await walletState.getWalletById('wallet-id')
```

If you know that the cached data is no longer valid, call `walletState.clear()` method! For example, when new wallet has been added or existing one has been edited, etc.

Clearing the state is also necessary when user manually clicks on 'Refresh' button in the sidebar tree view. Otherwise, you don't need to update the cached data.

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

We store all of our messages (errors, labels, etc.) in `src/messages/messages.ts` file. Additionally all of the user facing texts used in the `package.json` are stored in `package.nls.json`.

## Configuration & credentials

Configurations of the extension and CLI are stored in the `~/.affinidi/config.json` file.  
This file persists even after user log out.

Credentials and other sensitive data are stored in the `~/.affinidi/credentials.json` file.  
This file is removed after user log out.

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
