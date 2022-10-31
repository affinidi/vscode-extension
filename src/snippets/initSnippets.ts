import { commands } from "vscode";
import { ext } from "../extensionVariables";
import { insertGetIssuanceOffersSnippet } from "./get-issuance-offers/snippet";
import { insertSendVcOfferToEmailSnippet } from "./send-vc-offer-to-email/snippet";

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.sendVcOfferToEmail",
      insertSendVcOfferToEmailSnippet
    )
  );

  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.getIssuanceOffers",
      insertGetIssuanceOffersSnippet
    )
  );
};
