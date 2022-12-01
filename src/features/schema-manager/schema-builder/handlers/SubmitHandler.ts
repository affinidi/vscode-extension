import type { BuilderSchema, SchemaBuilderWebview } from '../SchemaBuilderWebview'
import { window, l10n, ProgressLocation } from 'vscode'
import { ext } from '../../../../extensionVariables'
import { schemasState } from '../../../../states/schemasState'
import { showSchemaDetails } from '../../schema-details/showSchemaDetails'
import { BuilderSchemaPublisher } from '../BuilderSchemaPublisher'
import { isValidSchemaType, isValidAttributeName } from '../helpers/validation'

export class SubmitHandler {
  constructor(private builderSchemaPublisher: BuilderSchemaPublisher) {}

  async handle(webview: SchemaBuilderWebview, data: { schema: BuilderSchema }) {
    try {
      if (!isValidSchemaType(data.schema.type)) {
        window.showErrorMessage(
          l10n.t(
            'Invalid schema type. Use PascalCase and alphanumeric symbols (for example, "MySchema")',
          ),
        )
        return
      }

      if (data.schema.attributes.length === 0) {
        window.showErrorMessage(l10n.t('Your schema is empty. Try adding an attribute.'))
        return
      }

      for (const attribute of data.schema.attributes) {
        if (!attribute.name) {
          window.showErrorMessage(
            l10n.t(
              'Empty attribute name. Use camelCase and alphanumeric symbols (for example, "firstName")',
            ),
          )
          return
        }

        if (!isValidAttributeName(attribute.name)) {
          window.showErrorMessage(
            l10n.t(
              `Invalid attribute name: "${attribute.name}". Use camelCase and alphanumeric symbols (for example, "firstName")`,
            ),
          )
          return
        }

        if (
          data.schema.attributes.some(
            (a) =>
              a.id !== attribute.id &&
              a.parentId === attribute.parentId &&
              a.name === attribute.name,
          )
        ) {
          window.showErrorMessage(l10n.t(`Duplicate attribute name: "${attribute.name}"`))
          return
        }
      }

      const createdSchema = await window.withProgress(
        { location: ProgressLocation.Notification, title: l10n.t('Publishing the schema...') },
        () => this.builderSchemaPublisher.publish(data.schema, webview.projectId),
      )

      window.showInformationMessage(l10n.t('Schema has been successfully created'))
      showSchemaDetails(createdSchema)
      schemasState.clear()
      ext.explorerTree.refresh()
      webview.dispose()
    } finally {
      if (!webview.isDisposed()) {
        webview.sendMessage({ command: 'enableSubmit' })
      }
    }
  }
}
