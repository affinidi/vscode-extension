import { DocumentDropEditProvider, TextDocument, Position, DataTransfer, CancellationToken, DocumentDropEdit, SnippetString } from 'vscode';

export class VcSchemaDropProvider implements DocumentDropEditProvider {
	async provideDocumentDropEdits(
		_document: TextDocument,
		position: Position,
		dataTransfer: DataTransfer,
		token: CancellationToken
	): Promise<DocumentDropEdit | undefined> {
		console.log('provideDocumentDropEdits()');

		const schemaId = await dataTransfer.get('text/treeitems')?.asString();
		console.log('schemaId:', schemaId)

		if (!schemaId) {
			return;
		}

		// TODO: generate snippet

		return { insertText: new SnippetString(`Hello world, schema: ${schemaId}!`) };
	}
}
