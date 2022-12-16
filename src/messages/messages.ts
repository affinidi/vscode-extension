export const labels = {
  login: 'Log in to Affinidi',
  createAnAccountWithAffinidi: 'Create an Account with Affinidi',
  createProject: 'Create Project',
  issuanceID: 'Issuance ID',
  issuances: 'Issuances',
  schema: 'Schema',
  schemas: 'VC Schemas',
  schemaBuilder: 'Schema Builder',
  schemaBuilderFork: (type: string) => `Fork "${type}" schema`,
  initiateIssuanceCsvFlow: 'Initiate CSV Issuance',
  digitalIdentities: 'Digital Identities',
  select: 'Select',
  empty: '(empty)',
  public: 'Public',
  unlisted: 'Unlisted',
  viewAvailableSnippets: 'View Available Snippets',
  appGenerators: 'App Generators',
  scriptGenerators: 'Script Generators',
  intelliSenseSnippets: 'IntelliSense Snippets',
  helperTools: 'Helper Tools',
  sendVCOfferToEmail: 'Send a VC Offer to an email',
  getIssuanceOffers: 'Get Issuance Offers',
  signCloudWalletVc: 'Sign a VC with Cloud Wallet',
  certificationAndVerification: 'Certification & Verification',
  reviewIssues: 'Review Issues',
  reportIssue: 'Report Issue',
  openWalkthrough: 'Extension Walkthrough',
  openAPIDocs: 'API Documentation',
  openDiscord: 'Discord Server',
  exampleWallet: 'Use Example Wallet',
  selectWallet: 'Enter A Wallet',
  activeProject: 'Active',
  inactiveProjects: 'Inactive Projects',
}

export const errorMessage = {
  internalErrorNullOrUndefined: 'Internal error: Expected value to be neither null nor undefined',
  invalidJsonSchemaUrl: 'Could not parse schema URL, please provide a valid schema URl',
  unknownSelection: 'unknown selection',
  unknownValue: 'unknown value',
  unknownCodeGen: 'unknown codeGenType: ',
  unknownConsentType: 'unknown consent type: ',
  unexpectedResourceType: 'Unexpected resource type:',
  webPanelNotOpen: 'Webview panel is not opened',
  unexpectedError: 'Unexpected error',
  walletNotFound: 'Wallet Not Found',
}

export const authMessage = {
  chooseAuthenticationMethod: 'Authenticate in to Affinidi',
  loggedIn: 'Logged in to Affinidi',
  loggedOut: 'Logged out of Affinidi',
  signedUp: 'Signed up to Affinidi',
  loggingIn: 'Logging in to Affinidi',
  accept: 'Accept',
  reject: 'Reject',
  enterEmail: 'Enter Email',
  enterEmailOfAffinidiAccount: 'Enter the email of your Affinidi account',
  pasteEmailAddress: 'Paste the code sent to your email',
  invalidEmailAddress: 'Invalid email address entered',
  emailNotFound:
    "Please enter the email address you signed-up with or sign-up if you don't have an account",
  confirmationCode: 'Confirmation Code',
  sendingConfirmationCode: 'Sending confirmation code',
  confirmationCodeSent: 'Confirmation code sent to',
  confirmationCodeShouldBeSixDigits: 'Confirmation code should be 6 digits',
  confirmationCodeRequired: 'Confirmation code is required',
  createAnAccount: 'Create an Account',
  unableToCreateSession: 'Failed to create a session',
  noValidSessionFound: 'Valid Affinidi authentication session not found',
  somethingWentWrong: 'Something went wrong. Please try again later.',
  notLoggedIn: 'You are already logged out',
  acceptedTermsAndConditions: 'You accepted terms and conditions',
  rejectedTermsAndConditions: 'You rejected terms and conditions',
  termsAndConditions:
    'Please read and accept the [Terms of Use](https://build.affinidi.com/dev-tools/terms-of-use.pdf) and [Privacy Policy](https://build.affinidi.com/dev-tools/privacy-policy.pdf)',
  fetchingAccountDetails: 'Fetching account details...',
}

export const projectMessage = {
  projectName: 'Project Name',
  enterProjectName: 'Enter Project Name',
  creatingProject: 'Creating Project...',
  selectProject: 'Select a project',
  fetchingProjects: 'Fetching project list...',
  fetchingProjectSummary: 'Fetching project details...',
  successfulProjectCreation: 'Project created successfully',
  projectRequired: 'You need to have a project to perform this operation',
  projectNameRequired: 'Project name is required',
  projectNotCreated: 'Project could not be created.',
  noProjectSummary: 'Could not find project summary: {0}',
  missingProjectID: 'Project ID is not provided',
  projectDoesNotExist: 'Project does not exist.',
  projectNotFound: (projectId: string) => `Project not found: ${projectId}`,
  errorFetchingActiveProject: 'Error while fetching the active project.',
  errorFetchingActiveProjectId: 'Error while fetching the active project id.',
  selectActiveProject: 'Select a new active project',
  activatedProject: (projectName: string) => `Successfully activated the project "${projectName}"`,
  creatingDefaultProject: 'Creating default project...',
  failedToFetchProjects: 'Failed to fetch projects',
  failedToUpdateIamStatusBar: 'Could not update IAM status bar item',
}

export const issuanceMessage = {
  fetchingIssuances: 'Fetching project issuances...',
  selectIssuance: 'Select an Issuance',
  noIssuances: "You don't have any issuances to choose from",
  failedToCreateIssuance: 'Failed to create issuance',
}

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

export const generatorMessage = {
  failedToGenerateApp: 'Failed to generate app',
  directoryNameDuplication: 'Directory with this name already exist',
  noDirectorySelected: "Installation folder wasn't selected",
  appNameNotSelected: "App name wasn't specified",
  checkCliInstall: 'Checking CLI installation...',
  enterAppName: 'Enter an app name',
}

export const cliMessage = {
  cliNeedsToBeInstalledForExtension:
    'Affinidi CLI needs to be installed for some actions in the extension: npm i -g @affinidi/cli',
  cliNeedsToBeInstalledForAction:
    'Affinidi CLI needs to be installed to proceed with this action: npm i -g @affinidi/cli',
  appIsGenerating: 'App is generating...',
  appGenerated: 'App successfully generated',
  unableToGenerateApp: 'Unable to generate app.',
}

export const telemetryMessage = {
  accept: 'Accept',
  deny: 'Deny',
  sendUsageData: 'Help us make Affinidi better! Do you accept to send anonymous usage data?',
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
  field: 'Field',
  row: 'Row',
  requiredColumns: 'Required columns',
}

export const genericMessage = {
  checkOutputChannel: 'Check Affinidi Output for details.',
}
