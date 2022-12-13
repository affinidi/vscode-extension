import { SchemaDto } from '@affinidi/client-schema-manager'
import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { issuanceState } from '../features/issuance/issuanceState'
import { IssuanceTreeItem } from '../features/issuance/tree/treeItems'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { SchemaTreeItem } from '../features/schema-manager/tree/treeItems'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { insertGetIssuanceOffersSnippet } from './get-issuance-offers/snippet'
import { insertSendVcOfferToEmailSnippet } from './send-vc-offer-to-email/snippet'
import { insertSignVcWithCloudWalletSnippet } from './sign-vc-with-cloud-wallet/snippet'

export const initSnippets = () => {
  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.sendVcOfferToEmail',
      async (element?: SchemaTreeItem) => {
        telemetryHelpers.trackCommand('affinidi.codegen.sendVcOfferToEmail', {
          projectId: element?.projectId,
          schemaId: element?.schemaId,
        })

        let schema: SchemaDto | undefined
        if (element?.schemaId) {
          schema = await schemaManagerState.getAuthoredSchemaById({
            projectId: element.projectId,
            schemaId: element.schemaId,
          })
        }

        await insertSendVcOfferToEmailSnippet({
          projectId: element?.projectId,
          schema,
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand(
      'affinidi.codegen.getIssuanceOffers',
      async (element?: IssuanceTreeItem) => {
        telemetryHelpers.trackCommand('affinidi.codegen.getIssuanceOffers', {
          projectId: element?.projectId,
          issuanceId: element?.issuanceId,
        })

        if (!element) await issuanceState.clear()

        await insertGetIssuanceOffersSnippet({
          projectId: element?.projectId,
          issuanceId: element?.issuanceId,
        })
      },
    ),
  )

  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.signVcWithCloudWallet', async () => {
      telemetryHelpers.trackCommand('affinidi.codegen.signVcWithCloudWallet')

      await insertSignVcWithCloudWalletSnippet()
    }),
  )
}
