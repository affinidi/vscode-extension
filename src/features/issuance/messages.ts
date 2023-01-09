export const issuanceMessage = {
  fetchingIssuances: 'Fetching project issuances...',
  selectIssuance: 'Select an Issuance',
  noIssuances: "You don't have any issuances to choose from",
  failedToCreateIssuance: 'Failed to create issuance',
}

export const snippetMessage = {
  selectLanguage: 'Select a language',
  selectImplementation: 'Select an implementation',
  snippetImplementationSdk: 'Use Affinidi Client SDK',
  snippetImplementationFetch: 'Use Fetch API',
  snippetGenerationFailed: 'Failed to generate a snippet',
  unsupportedSnippetGeneration:
    'Could not generate a snippet: unsupported language or implementation',
  credentialSubjectGeneration: 'Could not generate credential subject sample',
  snippetDoesNotSupportImplementationForLangauge:
    'Snippet does not support {0} implementation for {1} language',
}

export const csvMessage = {
  generatingCredentialSubjectSample: 'Generating sample credential subject...',
  downloadingCsvTemplate: 'Downloading CSV template...',
  uploadingCsvFile: 'Uploading CSV file...',
  openCsvTemplate: 'Open a CSV template',
  uploadCsvFile: 'Upload a CSV file',
  commaSeparatorMessage: 'Make sure to use comma (,) as separator. ',
  csvValidationError: 'Could not create issuance due to validation errors in the CSV.',
  issuanceCreationMessage: 'Issuance has been created and the offers were sent.',
  invalidCsvFile: 'Invalid CSV file',
  invalidDataInRow: 'Invalid data in row #',
  couldNotFindAllColumns: 'Could not find all required columns',
  unableToBuildCSVTemplate: 'Unable to build CSV template',
  field: 'Field',
  row: 'Row',
  requiredColumns: 'Required columns',
}
