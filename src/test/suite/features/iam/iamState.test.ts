import { expect } from 'chai'
import { authHelper } from '../../../../auth/authHelper'
import { configVault } from '../../../../config/configVault'
import { iamClient } from '../../../../features/iam/iamClient'
import { IamState } from '../../../../features/iam/iamState'
import { projectMessage } from '../../../../features/iam/messages'
import { sandbox } from '../../setup'

describe('IamState', () => {
  const project1Summary: any = { fake: 'project-1-summary' }
  const project2Summary: any = { fake: 'project-2-summary' }
  const projects = [
    { projectId: 'fake-project-1', name: 'project 1', createdAt: '2020-01-01T12:00Z' },
    { projectId: 'fake-project-2', name: 'project 2', createdAt: '2020-01-01T12:00Z' },
  ]

  let iamState: IamState

  beforeEach(async () => {
    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamClient, 'listProjects').resolves({ projects })
    sandbox.stub(configVault, 'requireActiveProjectId').resolves('fake-project-1')
    sandbox
      .stub(iamClient, 'getProjectSummary')
      .withArgs({ projectId: 'fake-project-1' })
      .resolves(project1Summary)
      .withArgs({ projectId: 'fake-project-2' })
      .resolves(project2Summary)

    iamState = new IamState()
  })

  describe('listProjects()', () => {
    it('should fetch projects once and then reuse the cached value', async () => {
      await expect(iamState.listProjects()).to.eventually.deep.eq(projects)
      await expect(iamState.listProjects()).to.eventually.deep.eq(projects)

      expect(iamClient.listProjects).calledOnce

      iamState.clear()

      await expect(iamState.listProjects()).to.eventually.deep.eq(projects)

      expect(iamClient.listProjects).calledTwice

      iamState.clear()
    })
  })

  describe('getProjectById()', () => {
    it('should fetch projects once and then reuse the cached value', async () => {
      const [project1, project2] = projects

      await expect(iamState.getProjectById('fake-project-1')).to.eventually.deep.eq(project1)
      await expect(iamState.getProjectById('fake-project-2')).to.eventually.deep.eq(project2)

      expect(iamClient.listProjects).calledOnce

      iamState.clear()

      await expect(iamState.getProjectById('fake-project-1')).to.eventually.deep.eq(project1)

      expect(iamClient.listProjects).calledTwice

      iamState.clear()
    })
  })

  describe('getActiveProject()', () => {
    it('should fetch projects once and then reuse the cached value', async () => {
      await expect(iamState.requireActiveProject()).to.eventually.deep.eq(projects[0])

      expect(iamClient.listProjects).calledOnce

      iamState.clear()

      await expect(iamState.requireActiveProject()).to.eventually.deep.eq(projects[0])

      expect(iamClient.listProjects).calledTwice

      iamState.clear()
    })
    it('should throw error when active project could not be fetched', async () => {
      sandbox.stub(iamState, 'getProjectById').resolves(undefined)
      await expect(iamState.requireActiveProject()).to.eventually.be.rejectedWith(
        projectMessage.errorFetchingActiveProject,
      )
    })
  })

  describe('getInactiveProjects()', () => {
    it('should fetch projects once and then reuse the cached value', async () => {
      await expect(iamState.getInactiveProjects()).to.eventually.deep.eq([projects[1]])

      expect(iamClient.listProjects).calledOnce

      iamState.clear()

      await expect(iamState.getInactiveProjects()).to.eventually.deep.eq([projects[1]])

      expect(iamClient.listProjects).calledTwice

      iamState.clear()
    })
  })

  describe('requireProjectSummary()', () => {
    it('should fetch project summary once and then reuse the cached value', async () => {
      await expect(iamState.requireProjectSummary('fake-project-1')).to.eventually.deep.eq(
        project1Summary,
      )
      await expect(iamState.requireProjectSummary('fake-project-1')).to.eventually.deep.eq(
        project1Summary,
      )
      expect(iamClient.getProjectSummary).calledOnce

      await expect(iamState.requireProjectSummary('fake-project-2')).to.eventually.deep.eq(
        project2Summary,
      )
      await expect(iamState.requireProjectSummary('fake-project-2')).to.eventually.deep.eq(
        project2Summary,
      )
      expect(iamClient.getProjectSummary).calledTwice

      iamState.clear()

      await expect(iamState.requireProjectSummary('fake-project-1')).to.eventually.deep.eq(
        project1Summary,
      )

      expect(iamClient.getProjectSummary).calledThrice

      iamState.clear()
    })
  })
})
