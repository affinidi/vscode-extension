export const schemaMessage = {
  loadingSchemaContent: 'Fetching schema content...',
  fetchingSchemas: 'Fetching available schemas...',
  selectSchema: 'Select a VC Schema',
  exampleSchema: 'Use an example Schema',
  openSchemaDetails: 'Open schema details',
  invalidSchemaType:
    'Invalid schema type. Use PascalCase and alphanumeric symbols (for example, "MySchema")',
  emptySchema: 'Your schema is empty. Try adding an attribute.',
  emptySchemaAttribute:
    'Empty attribute name. Use camelCase and alphanumeric symbols (for example, "firstName")',
  duplicateAttributeName: 'Duplicate attribute name: "',
  publishingSchema: 'Publishing the schema...',
  schemaCreated: 'Schema has been successfully created',
  couldNotCreateSchemaBuilder: 'Could not get or create Schema Builder',
  selectProjectToCreateSchema: 'You must select a project to create a schema',
  unableToOpenSchemaBuilder: 'Unable to open schema builder',
  invalidAttributeName: 'Invalid attribute name',
  invalidAttributeNameSuggestion:
    'Use camelCase and alphanumeric symbols (for example, "firstName")',
  attributeName: 'Attribute name',
  type: 'Type',
  required: 'Required',
  yes: 'Yes',
  no: 'No',
}

export const errorMessage = {
  webPanelNotOpen: 'Webview panel is not opened',
}

export const labels = {
  schema: 'Schema',
  schemaBuilder: 'Schema Builder',
  schemaBuilderFork: (type: string) => `Fork "${type}" schema`,
  initiateIssuanceCsvFlow: 'Initiate CSV Issuance',
  public: 'Public',
  unlisted: 'Unlisted',
}