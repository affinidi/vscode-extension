import { formatObject } from '../shared/formatObject'
import type { SnippetInput } from './snippet'

export function fetch(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string; context?: { errors?: { field: string; name: string; message: string }[] } };
type CreateIssuanceResponse = { id: string };
type CreateOfferResponse = { id: string };

const apiKeyHash = '${input.apiKeyHash}';
const projectId = '${input.projectId}';
const issuerDid = '${input.issuerDid}';
// use Schema Manager to find or create a schema for your VC
const schema = {
  type: '${input.schema.type}',
  jsonSchemaUrl: '${input.schema.jsonSchemaUrl}',
  jsonLdContextUrl: '${input.schema.jsonLdContextUrl}',
};
const email = '${input.email || '${1:email@example.com}'}'; // VC claim link will be sent here

const issuanceResponse = await fetch('${input.issuanceApiUrl}/issuances', {
  method: 'POST',
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
  body: JSON.stringify({
    projectId,
    template: {
      issuerDid,
      schema,
      verification: {
        // claim link will be sent by email
        method: 'email',
      },
      // set walletUrl to your wallet URL with claim flow support
      walletUrl: "http://localhost:3000/holder/claim",
    }
  })
});

const issuanceData: CreateIssuanceResponse | ApiOperationError = await issuanceResponse.json();
if ('id' in issuanceData) {
  console.log('Issuance ID:', issuanceData.id);
} else {
  console.log('Could not create an issuance:', issuanceData.code, issuanceData.message);
  throw new Error('Could not create an issuance');
}

const offerResponse = await fetch(\`${
    input.issuanceApiUrl
  }/issuances/\${issuanceData.id}/offers\`, {
  method: 'POST',
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
  body: JSON.stringify({
    // should match fields in VC Schema
    // read more about JSON schema specification formats:
    // https://json-schema.org/draft/2020-12/json-schema-validation.html#name-defined-formats
    credentialSubject: ${formatObject(input.credentialSubject, { indent: 2 })},
    verification: {
      target: {
        // VC claim link will be sent here
        email: email,
      }
    }
  })
});

const offerData: CreateOfferResponse | ApiOperationError = await offerResponse.json();
if ('id' in offerData) {
  console.log('Offer ID:', offerData.id);
} else if (offerData.code === 'VIS-10') {
  console.log('Issuance has not been found');
} else if (offerData.code === 'VIS-18') {
  console.log('Credential subject is invalid, validation errors:', offerData.context?.errors);
} else {
  console.log('Could not create an offer:', offerData.code, offerData.message);
}`
}
