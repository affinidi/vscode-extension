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
