import { commands } from "vscode";
import { ext } from "../extensionVariables";
import {
  EventNames,
  sendEventToAnalytics,
} from "../services/analyticsStreamApiService";
import { insertGetIssuanceOffersSnippet } from "./get-issuance-offers/snippet";
import { insertSendVcOfferToEmailSnippet } from "./send-vc-offer-to-email/snippet";

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.codegen.sendVcOfferToEmail", async () => {
      await insertSendVcOfferToEmailSnippet();
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "vcOffer",
        metadata: {
          commandId: "affinidi.codegen.sendVcOfferToEmail",
        },
      });
    })
  );

  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.codegen.getIssuanceOffers", async () => {
      await insertGetIssuanceOffersSnippet();
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "vcOffer",
        metadata: {
          commandId: "affinidi.codegen.getIssuanceOffers",
        },
      });
    })
  );
};
