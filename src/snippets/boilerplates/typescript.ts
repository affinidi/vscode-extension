export function fetch(): string {
  return `\
// To run this script directly use node 18+ and ts-node:
// npx ts-node name-of-script.ts
  
/// <reference lib="dom" />

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
