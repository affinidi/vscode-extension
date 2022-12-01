import { SchemaDto } from '@affinidi/client-schema-manager'
import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import {
  EventNames,
  EventSubCategory,
  sendEventToAnalytics,
} from '../services/analyticsStreamApiService'
import { ExplorerTreeItem } from '../tree/explorerTreeItem'
import { insertGetIssuanceOffersSnippet } from './get-issuance-offers/snippet'
import { insertSendVcOfferToEmailSnippet } from './send-vc-offer-to-email/snippet'
import { insertSignVcWithCloudWalletSnippet } from './sign-vc-with-cloud-wallet/snippet'

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.sendVcOfferToEmail',
      async (element?: ExplorerTreeItem) => {
        let schema: SchemaDto | undefined
        if (element?.schemaId) {
          schema = await schemaManagerState.getAuthoredSchemaById({
            projectId: element.projectId!,
            schemaId: element.schemaId,
          })
        }

        await insertSendVcOfferToEmailSnippet({
          projectId: element?.projectId,
          schema,
        })

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: EventSubCategory.command,
          metadata: {
            commandId: 'affinidi.codegen.sendVcOfferToEmail',
            projectId: element?.projectId,
            schemaId: element?.schemaId,
          },
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.getIssuanceOffers',
      async (element?: ExplorerTreeItem) => {
        await insertGetIssuanceOffersSnippet({
          projectId: element?.projectId,
          issuanceId: element?.issuanceId,
        })

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: EventSubCategory.command,
          metadata: {
            commandId: 'affinidi.codegen.getIssuanceOffers',
            projectId: element?.projectId,
            issuanceId: element?.issuanceId,
          },
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.signVcWithCloudWallet', async () => {
      await insertSignVcWithCloudWalletSnippet()

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.codegen.signVcWithCloudWallet',
        },
      })
    }),
  )
}
