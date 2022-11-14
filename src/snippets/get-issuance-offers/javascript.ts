import { SnippetInput } from './snippet';

export function fetch(input: SnippetInput) {
  return `\
const apiKeyHash = '${input.apiKeyHash}';
const issuanceId = '${input.issuanceId}';

const response = await fetch(\`${input.issuanceApiUrl}/v1/issuances/\${issuanceId\\}/offers\`, {
  method: 'GET',
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
});

const data = await response.json();
if (String(response.status).startsWith('2')) {
  const { offers } = data;
  for (const offer of offers) {
    console.log(\`Offer #\${offer.id}:\`, offer.status);
  }
} else {
  console.log('Could not get issuance offers:', data.code, data.message);
}`;
}
