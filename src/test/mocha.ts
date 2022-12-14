import { extensions } from 'vscode'
import path from 'path'
import Mocha from 'mocha'
import glob from 'glob'
import { logger } from '../utils/logger'

export async function run(): Promise<void> {
  // wait for extension to be activate
  await new Promise<void>((resolve) => {
    setInterval(() => {
      if (extensions.getExtension('affinidi.affinidi')?.isActive) {
        resolve()
      }
    }, 50)
  })

  const testsRoot = path.resolve(__dirname, 'suite')
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 100000,
  })

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      mocha.addFile(path.resolve(testsRoot, 'setup.js'))
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`))
          } else {
            resolve()
          }
        })
      } catch (error) {
        logger.error(error, 'Failed to run tests')
        reject(error)
      }
    })
  })
}
