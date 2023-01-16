export const projectMessage = {
  projectName: 'Project Name',
  enterProjectName: 'Enter Project Name',
  creatingProject: 'Creating Project...',
  fetchingProjectSummary: 'Fetching project details...',
  successfulProjectCreation: 'Project created successfully',
  projectNameRequired: 'Project name is required',
  projectNotCreated: 'Project could not be created.',
  missingProjectID: 'Project ID is not provided',
  projectNotFound: (projectId: string) => `Project not found: ${projectId}`,
  errorFetchingActiveProject: 'Error while fetching the active project.',
  selectActiveProject: 'Select a new active project',
  activatedProject: (projectName: string) => `Successfully activated the project "${projectName}"`,
  creatingDefaultProject: 'Creating default project...',
  failedToFetchProjects: 'Failed to fetch projects',
  failedToUpdateIamStatusBar: 'Could not update IAM status bar item',
  projectRenameFailed: 'Failed to rename project...',
  projectRenamed: 'Project name updated.',
}

export const labels = {
  createProject: 'Create Project',
  issuances: 'Issuances',
  schemas: 'VC Schemas',
  digitalIdentities: 'Digital Identities',
  selectWallet: 'Enter a Wallet URL for VC claim',
  activeProject: 'Active',
  inactiveProjects: 'Inactive Projects',
}
