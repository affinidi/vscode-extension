import { window } from 'vscode'
import { labels } from '../../messages/messages'

const verifyInput = async () => {
  const verifyInputBox = await window.showInputBox({
    prompt: labels.verifyAVC,
  })
  return verifyInputBox
}

export const verifyHelpers = {
  verifyInput,
}
