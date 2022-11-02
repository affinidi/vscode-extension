import { commands } from "vscode";
import { ext } from "../extensionVariables";
import {
  EventNames,
  sendEventToAnalytics,
} from "../services/analyticsStreamApiService";
import { AffResourceTreeItem } from "../treeView/treeItem";
import { insertGetIssuanceOffersSnippet } from "./get-issuance-offers/snippet";
import { insertSendVcOfferToEmailSnippet } from "./send-vc-offer-to-email/snippet";

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidi.codegen.sendVcOfferToEmail",
      async () => {
        await insertSendVcOfferToEmailSnippet();

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

  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidiExplorer.codegen.getIssuanceOffers",
      async (element: AffResourceTreeItem) => {
        await insertGetIssuanceOffersSnippet({
          projectId: element.metadata.projectId,
          issuanceId: element.metadata.id,
        });

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "vcOffer",
          metadata: {
            commandId: "affinidiExplorer.codegen.getIssuanceOffers",
          },
        });
      }
    )
  );

  ext.context.subscriptions.push(
    commands.registerCommand(
      "affinidiExplorer.codegen.sendVcOfferToEmail",
      async (element: AffResourceTreeItem) => {
        await insertSendVcOfferToEmailSnippet({
          projectId: element.metadata.projectId,
          schema: element.metadata,
        });

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "vcOffer",
          metadata: {
            commandId: "affinidiExplorer.codegen.sendVcOfferToEmail",
          },
        });
      }
    )
  );
};
