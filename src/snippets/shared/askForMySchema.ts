import { window, ProgressLocation } from 'vscode';
import { getMySchemas } from '../../services/schemaManagerService';
import { Schema } from '../../shared/types';
import { showQuickPick } from '../../utils/showQuickPick';

export const EXAMPLE_SCHEMA: Schema = {
  type: "MySchema",
  jsonLdContextUrl: "https://schema.affinidi.com/MySchemaV1-0.jsonld",
  jsonSchemaUrl: "https://schema.affinidi.com/MySchemaV1-0.json",
};

export async function askForMySchema(input: { did: string, apiKeyHash: string }): Promise<Schema | undefined> {
  const { schemas } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching available schemas...",
    },
    () => getMySchemas(input)
  );

  return showQuickPick(
    [
      ["Use an example schema", EXAMPLE_SCHEMA],
      ...schemas.map<[string, Schema]>((schema) => [schema.id, schema]),
    ],
    { title: "Select a VC Schema" }
  );
}
