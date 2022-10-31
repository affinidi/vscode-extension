import { SnippetInput } from './snippet';

export function fetch(input: SnippetInput) {
  return `\
const apiKeyHash = '${input.apiKeyHash}';
const issuanceId = '${input.issuanceId}';

const response = await fetch(\`${input.issuanceApiUrl}/v1/issuances/\${issuanceId\\}/offers\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': apiKeyHash,
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

export function axios(input: SnippetInput) {
  return `\
const apiKeyHash = '${input.apiKeyHash}';
const issuanceId = '${input.issuanceId}';

try {
  const { data } = await axios({
    url: \`${input.issuanceApiUrl}/v1/issuances/\${issuanceId\\}/offers\`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKeyHash,
    },
  });

  const { offers } = data;
  for (const offer of offers) {
    console.log(\`Offer #\${offer.id}:\`, offer.status);
  }
} catch (error) {
  const { code, message } = error.response.data;
  console.log('Could not get issuance offers:', code, message);
}`;
}
