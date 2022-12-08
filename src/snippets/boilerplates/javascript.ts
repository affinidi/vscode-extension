function common(): string {
  return `\
async function run() {
  $0
}

run()
  .then(() => console.log('Success!'))
  .catch((error) => console.error(error));`
}

export function fetch(): string {
  return `\
// Save this script as .mjs and run it with
// node name-of-script.mjs 

// If you are using a version of node prior to 18 you need to install node-fetch
// npm install node-fetch
// And uncomment the following line
// import fetch from 'node-fetch';

${common()}`
}
