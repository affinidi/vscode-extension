export const labels = {
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
  selectWallet: 'Enter a Wallet URL for VC claim',
  activeProject: 'Active',
  inactiveProjects: 'Inactive Projects',
  verifyVC: 'Verify a VC',
  invalidFileType: 'Invalid File Type',
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

export const genericMessage = {
  unexpectedError: 'Unexpected error',
  errorNotification: (message: string) => `${message}. Check Affinidi Output for details.`,
}
