export const errorMessage = {
  invalidJsonSchemaUrl: 'Could not parse schema URL, please provide a valid schema URl',
  internalErrorNullOrUndefined: 'Internal error: Expected value to be neither null nor undefined',
}

export const cliMessage = {
  cliNeedsToBeInstalledForExtension:
    'Affinidi CLI needs to be installed for some actions in the extension: npm i -g @affinidi/cli',
  cliNeedsToBeInstalledForAction:
    'Affinidi CLI needs to be installed to proceed with this action: npm i -g @affinidi/cli',
  tryCli: 'Try out Affinidi CLI: npm i -g @affinidi/cli',
  appIsGenerating: 'App is generating...',
  appGenerated: 'App successfully generated',
  unableToGenerateApp: 'Unable to generate app.',
}

export const generatorMessage = {
  directoryNameDuplication: 'Directory with this name already exist',
}

export const genericMessage = {
  unexpectedError: 'Unexpected error',
  errorNotification: (message: string) => `${message}. Check Affinidi Output for details.`,
}
