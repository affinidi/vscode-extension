export function fetch(): string {
  return `\
// If you are using a version of node prior to 18 you need to install node-fetch
// npm install node-fetch
// Then save this script as .mjs and uncomment the following line
// import fetch from 'node-fetch';

${common()}`
}

function common(): string {
  return `\
async function run() {
  $0
}

run()
  .then(() => console.log('Success!'))
  .catch((error) => console.error(error));`
}
