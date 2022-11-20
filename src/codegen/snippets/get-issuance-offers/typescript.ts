import type { SnippetInput } from './snippet'

export function fetch(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string };
type OfferStatus = 'CREATED' | 'CLAIMED'
type GetOfferIssuancesResponse = {
  offers: {
    id: string
    status: OfferStatus
    statusLog: { status: OfferStatus; at: Date }[]
    expiresAt: Date
    issuerDid: string
    schema: {
      type: string
      jsonLdContextUrl: string
      jsonSchemaUrl: string
    }
    verification: {
      method: string
      target: {
        email: string
      }
    }
  }[]
}

const apiKeyHash = '${input.apiKeyHash}';
const issuanceId = '${input.issuanceId}';

const response = await fetch(\`${input.issuanceApiUrl}/issuances/\${issuanceId\\}/offers\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': apiKeyHash,
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
});

const data: GetOfferIssuancesResponse | ApiOperationError = await response.json();
if ('offers' in data) {
  const { offers } = data;
  for (const offer of offers) {
    console.log(\`Offer #\${offer.id\\}:\`, offer.status);
  }
} else {
  console.log('Could not get issuance offers:', data.code, data.message);
}`
}
