import { commands } from 'vscode';
import { ext } from '../extensionVariables';
import { insertSendVcOfferToEmailSnippet } from './send-vc-offer-to-email/snippet';

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.sendVcOfferToEmail',
      insertSendVcOfferToEmailSnippet
    )
  );
};
