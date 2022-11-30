import { l10n } from 'vscode'

export const labels = {
  signIn: l10n.t('Signed In to Affinidi'),
  signOut: l10n.t('Signed Out of Affinidi'),
  createAnAccountWithAffinidi: l10n.t('Create an Account with Affinidi'),
  createProject: l10n.t('Create Proejct'),
  issuanes: l10n.t('Issuances'),
  vcSchemas: l10n.t('VC Schemas'),
  digitalIdenties: l10n.t('Digital Identities'),
  select: l10n.t('Select'),
  empty: l10n.t('(empty)'),
  public: l10n.t('Public'),
  unlisted: l10n.t('Unlisted'),
  viewAvailableSnippets: l10n.t('View Available Snippets'),
  appGenerators: l10n.t('App Generators'),
  scriptGenerators: l10n.t('Script Generators'),
  intelliSenseSnippets: l10n.t('IntelliSense Snippets'),
  sendVCOfferToEmail: l10n.t('Send a VC Offer to an email'),
  getIssuanceOffers: l10n.t('Get Issuance Offers'),
  signCloudWalletVc: l10n.t('Sign a VC with Cloud Wallet'),
  certificationAndVerification: l10n.t('Certification & Verification'),
  giveFeedback: l10n.t('Give Feedback'),
}

export const errorMessage = {
  internalErrorNullOrUnderined: l10n.t(
    'Internal error: Expected value to be neither null nor undefined',
  ),
  internalErrorNullOrUnderinedOrEmpty: l10n.t(
    'Internal error: Expected value to be neither null, undefined, nor empty',
  ),
  invalidJsonSchemaUrl: l10n.t('Invalid JSON schema URL'),
  unknownSelection: l10n.t('unknown selection'),
  unknownValue: l10n.t('unknown value'),
  unknownCodeGen: l10n.t('unknown codeGenType: '),
  unknownConsentType: l10n.t('unknown consent type: '),
  unexpectedResourceType: l10n.t('Unexpected resource type:'),
}

export const authMessage = {
  enterEmail: l10n.t('Enter Email'),
  enterEmailOfAffindiAccount: l10n.t('Enter the email of your Affinidi account'),
  pasteEmailAddress: l10n.t('Paste the code sent to your email'),
  vaidEmailAddress: l10n.t('Enter a valid email address'),
  emaillNotFound: l10n.t(
    "Please enter the email address you signed-up with or sign-up if you don't have an account.",
  ),
  confirmationCode: l10n.t('Confirmation Code'),
  sendingConfirmationCode: l10n.t('Sending confirmation code'),
  confirmationCodeSent: l10n.t('Confirmation code sent to'),
  confirmationCodeShouldBeSixDigits: l10n.t('Confirmation code should be 6 digits'),
  confirmationCodeRequired: l10n.t('Confirmation code is required'),
  createAnAccount: l10n.t('Create an Account'),
  unableToCreateSession: l10n.t('Failed to create a session'),
  noValidSessionFound: l10n.t('Valid Affinidi authentication session not found'),
  somethingWentWrong: l10n.t('Something went wrong. Please try again later.'),
  notLoggedIn: l10n.t('Not logged in to Affinidi'),
  acceptedTermsAndConditions: l10n.t('You accepted terms and conditions'),
  rejectedTermsAndConditons: l10n.t('You rejected terms and conditions'),
  termsAndConditions: l10n.t(
    'Please read and accept the [Terms of Use](https://build.affinidi.com/dev-tools/terms-of-use.pdf) and [Privacy Policy](https://build.affinidi.com/dev-tools/privacy-policy.pdf)',
  ),
}

export const projectMessage = {
  projectName: l10n.t('Project Name'),
  enterProjectName: l10n.t('Enter Project Name'),
  creatingProject: l10n.t('Creating Project...'),
  selectProject: l10n.t('Select a project'),
  fetchProject: l10n.t('Fetching project information...'),
  successfulProjectCreation: l10n.t('Project created successfully'),
  projectRequired: l10n.t('You need to have a project to perform this operation'),
  projectNameRequired: l10n.t('project name is required'),
  projectNotCreated: l10n.t('Project could not be created'),
  noProjectSummary: l10n.t('Could not find project summary: {0}'),
  projectDoesNotExist: l10n.t('Project does not exist.'),
  missingProjectID: l10n.t('Project ID is not provided'),
  pleaseTryAgain: l10n.t('Please try again later.'),
}

export const issuanceMessage = {
  fetchIssuances: l10n.t('Fetching available issuances...'),
  selectIssuance: l10n.t('Select an Issuance'),
  noIssauces: l10n.t("You don't have any issuances to choose from"),
}

export const schemaMessage = {
  fetchSchemas: l10n.t('Fetching available schemas...'),
  selectSchema: l10n.t('Select a VC Schema'),
  exampleSchema: l10n.t('Use an example Schema'),
  openSchemaDetails: l10n.t('Open schema details'),
}

export const snippetMessage = {
  selectLanguage: l10n.t('Select a language'),
  selectImplementation: l10n.t('Select an implementation'),
  snippetImplementationSdk: l10n.t('Use Affinidi Client SDK'),
  snippetImplementationFetch: l10n.t('Use Fetch API'),
  snippetGenerationFailed: l10n.t('Failed to generate a snippet'),
  unsupportedSnippetGeneration: l10n.t(
    'Could not generate a snippet: unsupported language or implementation',
  ),
  credentialSubjectGeneration: l10n.t('Could not generate credential subject sample'),
  snippetDoesNotSupportImplementationForLangauge: l10n.t(
    'Snippet does not support {0} implementation for {1} language',
  ),
}

export const generatorMessage = {
  failedToGenerateApp: l10n.t('Failed to generate app'),
  directoryNameDuplication: l10n.t('Directory with this name already exist.'),
  noDirectorySelected: l10n.t("Installation folder wasn't selected."),
  appNameNotySelected: l10n.t("App name wasn't specified."),
  checkCliInstall: l10n.t('Checking CLI installation...'),
  enterAppName: l10n.t('Enter an app name'),
}

export const cliMessage = {
  cliNeedsToBeInstalledForExtension: l10n.t(
    'Affinidi CLI needs to be installed for some actions in the extension: npm i -g @affinidi/cli',
  ),
  cliNeedsToBeInstalledForAction: l10n.t(
    'Affinidi CLI needs to be installed to proceed with this action: npm i -g @affinidi/cli',
  ),
  appIsGenerating: l10n.t('App is generating...'),
  appGenerated: l10n.t('App successfully generated.'),
}

export const telemetryMessage = {
  sendUsageData: l10n.t(
    'Help us make Affinidi better! Do you accept to send anonymous usage data?',
  ),
}

export const csvMessage = {
  openCsvTemplate: l10n.t('Open a CSV template'),
  uploadCsvFile: l10n.t('Upload a CSV file'),
  commaSeperatorMessage: l10n.t('Make sure to use comma (,) as separator. '),
  csvValidationError: l10n.t(
    'Could not create issuance due to validation errors in the CSV file: {0}',
  ),
  IssaunceCreationMessage: l10n.t(
    'Issuance has been created and the offers were sent. Issuance ID: {0}',
  ),
  invalidCsvFile: l10n.t('Invalid CSV file'),
  invalidDataInRow: l10n.t('Invalid data in row #'),
  couldNotFindAllColumns: l10n.t('Could not find all required columns'),
}

// cross reference with CLI + ignore
export const wrongEmailError = l10n.t('Invalid email address entered')
export const invalidOrExpiredOTPError = l10n.t(
  'The confirmation code entered is either invalid or expired',
)
export const emailAlreadyRegistered = l10n.t(
  'This email has already been registered, please use the login command.',
)

export const userNotAuthenticated = l10n.t('You are already logged out')
export const wrongStructureForJson = l10n.t(
  'Please check that your json file content is in the right structure as in the schema.',
)
export const wrongFileExtension = l10n.t('Please provide a valid file extension (.json)')
export const invalidSchemaUrl = l10n.t(
  'Could not parse schema URL, please provide a valid schema URl',
)
export const jsonFileSyntaxError = l10n.t('Please check syntax of json file and try again.')
export const verifierBadRequest = l10n.t('Please make sure that the VC is valid.')
export const projectNotFound = l10n.t(
  'Please provide an existing project ID or activate a project.',
)
export const schemaNotFound = l10n.t('Please provide an existing schema ID.')
export const invalidSchemaName = l10n.t(
  'Please, enter a schema name using only alpha numeric characters',
)
export const invalidCredentialSubject = l10n.t(
  'Please make sure to provide a valid schema credential subject.',
)
export const SignoutError = l10n.t(`There was an error while trying to sign-out. ${pleaseTryAgain}`)
