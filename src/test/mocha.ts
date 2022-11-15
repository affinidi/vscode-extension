import { extensions } from 'vscode'
import * as path from 'path'
import * as Mocha from 'mocha'
import * as glob from 'glob'

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
        console.error('Failed to run tests:', error)
        reject(error)
      }
    })
  })
}
