export function fetch(): string {
  return `\
// uncomment for a Node app
// import fetch from 'node-fetch';

${common()}`;
}

export function axios(): string {
  return `\
import axios from 'axios';

${common()}`;
}

function common(): string {
  return `\
async function run() {
  $0
}

run()
  .then(() => console.log('Success!'))
  .catch((error) => console.error(error));`;
}