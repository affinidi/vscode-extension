import { expect } from 'chai'
import { window } from 'vscode'
import sinon from 'sinon'

import { showQuickPick } from '../../../utils/showQuickPick'
import { sandbox } from '../setup'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ENTITIES: any = ['test', ['test1', { id: 0 }]]

describe('showQuickPick()', () => {
  let showQuickPickWindow: sinon.SinonStub

  beforeEach(() => {
    showQuickPickWindow = sandbox.stub(window, 'showQuickPick')
  })

  it('should return undefined if nothing selected', async () => {
    showQuickPickWindow.resolves()

    expect(await showQuickPick(ENTITIES)).equal(undefined)
  })

  it('should return undefined if selected entry not an array', async () => {
    showQuickPickWindow.resolves(ENTITIES[0])

    expect(await showQuickPick(ENTITIES)).equal(undefined)
  })

  it('should return selected entry', async () => {
    showQuickPickWindow.resolves(ENTITIES[1][0])

    expect(await showQuickPick(ENTITIES)).equal(ENTITIES[1][1])
  })
})
