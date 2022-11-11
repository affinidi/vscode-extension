# VSCode Extension for Affinidi
## Translation

For the translation purpose we are using VSCode `l10n` [API](https://code.visualstudio.com/api/references/vscode-api#l10n). To generate translation into English run:
1. Add translation wrapper:
```ts
import { l10n } from "vscode";

...

l10n.t("Example text");
```
2. Next run command:
```sh
npm run generate-translation
```
