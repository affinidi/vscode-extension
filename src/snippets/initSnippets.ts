import { commands } from "vscode";
import { ext } from "../extensionVariables";
import {
  EventNames,
  sendEventToAnalytics,
} from "../services/analyticsStreamApiService";
import { AffResourceTreeItem } from "../treeView/treeItem";
import { insertGetIssuanceOffersSnippet } from "./get-issuance-offers/snippet";
import { insertSendVcOfferToEmailSnippet } from "./send-vc-offer-to-email/snippet";
import { insertSignVcWithCloudWalletSnippet } from "./sign-vc-with-cloud-wallet/snippet";

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.sendVcOfferToEmail",
      async (element?: AffResourceTreeItem) => {
        await insertSendVcOfferToEmailSnippet(
          element
            ? {
                projectId: element.metadata.projectId,
                schema: element.metadata,
              }
            : {}
        );

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "vcOffer",
          metadata: {
            commandId: "affinidi.codegen.sendVcOfferToEmail",
          },
        });
      }
    )
  );

  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.getIssuanceOffers",
      async (element?: AffResourceTreeItem) => {
        await insertGetIssuanceOffersSnippet(
          element
            ? {
                projectId: element.metadata.projectId,
                issuanceId: element.metadata.id,
              }
            : {}
        );

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "vcOffer",
          metadata: {
            commandId: "affinidi.codegen.getIssuanceOffers",
          },
        });
      }
    )
  );

  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.signVcWithCloudWallet",
      async () => {
        await insertSignVcWithCloudWalletSnippet();

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "vc",
          metadata: {
            commandId: "affinidi.codegen.signVcWithCloudWallet",
          },
        });
      }
    )
  );
};
