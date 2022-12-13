import type { BuilderSchema, SchemaBuilderWebview } from '../SchemaBuilderWebview'
import { window, ProgressLocation } from 'vscode'
import { ext } from '../../../../extensionVariables'
import { showSchemaDetails } from '../../schema-details/showSchemaDetails'
import { BuilderSchemaPublisher } from '../BuilderSchemaPublisher'
import { isValidSchemaType, isValidAttributeName } from '../helpers/validation'
import { schemaMessage } from '../../../../messages/messages'
import { schemaManagerState } from '../../schemaManagerState'

export class SubmitHandler {
  constructor(private builderSchemaPublisher: BuilderSchemaPublisher) {}

  async handle(webview: SchemaBuilderWebview, data: { schema: BuilderSchema }) {
    try {
      if (!isValidSchemaType(data.schema.type)) {
        window.showErrorMessage(schemaMessage.invalidSchemaType)
        return
      }

      if (data.schema.attributes.length === 0) {
        window.showErrorMessage(schemaMessage.emptySchema)
        return
      }

      for (const attribute of data.schema.attributes) {
        if (!attribute.name) {
          window.showErrorMessage(schemaMessage.emptySchemaAttribute)
          return
        }

        if (!isValidAttributeName(attribute.name)) {
          window.showErrorMessage(
            `${schemaMessage.invalidAttributeName}: "${attribute.name}". ${schemaMessage.invalidAttributeNameSuggestion}`,
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
          window.showErrorMessage(`${schemaMessage.duplicateAttributeName} ${attribute.name}"`)
          return
        }
      }

      const createdSchema = await window.withProgress(
        { location: ProgressLocation.Notification, title: schemaMessage.publishingSchema },
        () => this.builderSchemaPublisher.publish(data.schema, webview.projectId),
      )

      window.showInformationMessage(schemaMessage.schemaCreated)
      showSchemaDetails({ schema: createdSchema, projectId: webview.projectId })
      schemaManagerState.clear()
      ext.explorerTree.refresh()
      webview.dispose()
    } finally {
      if (!webview.isDisposed()) {
        webview.sendMessage({ command: 'enableSubmit' })
      }
    }
  }
}
