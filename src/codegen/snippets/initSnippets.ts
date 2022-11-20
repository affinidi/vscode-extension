import { commands } from 'vscode'
import { ext } from '../../extensionVariables'
import {
  EventNames,
  EventSubCategory,
  telemetryClient,
} from '../../features/telemetry/telemetryClient'
import { AffResourceTreeItem } from '../../treeView/treeItem'
import { insertGetIssuanceOffersSnippet } from './get-issuance-offers/snippet'
import { insertSendVcOfferToEmailSnippet } from './send-vc-offer-to-email/snippet'
import { insertSignVcWithCloudWalletSnippet } from './sign-vc-with-cloud-wallet/snippet'

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.sendVcOfferToEmail',
      async (element?: AffResourceTreeItem) => {
        await insertSendVcOfferToEmailSnippet({
          projectId: element?.projectId,
          schema: element?.metadata,
        })

        telemetryClient.sendEvent({
          name: EventNames.commandExecuted,
          subCategory: EventSubCategory.command,
          metadata: {
            commandId: 'affinidi.codegen.sendVcOfferToEmail',
            projectId: element?.projectId,
            schemaId: element?.metadata.id,
          },
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.getIssuanceOffers',
      async (element?: AffResourceTreeItem) => {
        await insertGetIssuanceOffersSnippet({
          projectId: element?.projectId,
          issuanceId: element?.metadata.id,
        })

        telemetryClient.sendEvent({
          name: EventNames.commandExecuted,
          subCategory: EventSubCategory.command,
          metadata: {
            commandId: 'affinidi.codegen.getIssuanceOffers',
            projectId: element?.projectId,
            issuanceId: element?.metadata.id,
          },
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.signVcWithCloudWallet', async () => {
      await insertSignVcWithCloudWalletSnippet()

      telemetryClient.sendEvent({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.codegen.signVcWithCloudWallet',
        },
      })
    }),
  )
}
