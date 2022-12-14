import { formatObject } from '../shared/formatObject'
import type { SnippetInput } from './snippet'

export function fetch(input: SnippetInput) {
  return `\
const apiKeyHash = '${input.apiKeyHash}';
const issuerDid = '${input.issuerDid}';
const claimId = '${input.claimId}'; // Autogenerated ID
// use Schema Manager to find or create a schema for your VC
const schema = {
  type: '${input.schema.type}',
  jsonSchemaUrl: '${input.schema.jsonSchemaUrl}',
  jsonLdContextUrl: '${input.schema.jsonLdContextUrl}',
};

const cloudWalletResponse = await fetch(\`${
    input.iamUrl
  }/cloud-wallet/\${issuerDid\\}/authenticate\`, {
  method: 'POST',
  headers: {
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
});

const cloudWalletData = await cloudWalletResponse.json();
if (String(cloudWalletResponse.status).startsWith('2')) {
  console.log('Authentication response:', cloudWalletData);
} else {
  console.log('Could not authenticate:', cloudWalletData.code, cloudWalletData.message);
  throw new Error('Could not authenticate');
}

const signCredentialResponse = await fetch('${input.cloudWalletApiUrl}/wallet/sign-credential', {
  method: 'POST',
  headers: {
    'Authorization': cloudWalletData.wallet.accessToken,
    'Api-Key': apiKeyHash,
    'Content-Type': 'application/json',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, max-age=0',
  },
  body: JSON.stringify({
    unsignedCredential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        schema.jsonLdContextUrl,
      ],
      id: \`claimId:\${claimId\\}\`,
      type: ['VerifiableCredential', schema.type],
      holder: {
        id: cloudWalletData.wallet.did,
      },
      // should match fields in VC Schema
      // read more about JSON schema specification formats:
      // https://json-schema.org/draft/2020-12/json-schema-validation.html#name-defined-formats
      credentialSubject: ${formatObject(input.credentialSubject, { indent: 3 })},
      credentialSchema: {
        id: schema.jsonSchemaUrl,
        type: schema.type,
      },
      issuanceDate: new Date().toISOString()
    }
  })
});

const signedCredentialData = await signCredentialResponse.json();
if (String(signCredentialResponse.status).startsWith('2')) {
  console.log('Signed credential:', signedCredentialData.signedCredential);
} else if (signedCredentialData.code === 'CWA-18') {
  console.log('Credential subject is invalid, validation errors:', signedCredentialData.context?.message);
} else {
  console.log('Could not sign credential:', signedCredentialData.code, signedCredentialData.message);
}
`
}
