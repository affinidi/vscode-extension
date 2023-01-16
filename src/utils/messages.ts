export const errorMessage = {
  invalidJsonSchemaUrl: 'Could not parse schema URL, please provide a valid schema URl',
  internalErrorNullOrUndefined: 'Internal error: Expected value to be neither null nor undefined',
}

export const cliMessage = {
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
