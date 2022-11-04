import { SnippetInput } from "./snippet";

export function fetch(input: SnippetInput) {
  return `\
const apiKeyHash = '${input.apiKeyHash}';
const cloudWalletResponse = await fetch('${input.iamUrl}/v1/cloud-wallet/${input.issuerDid}/authenticate', {
  method: 'POST',
  headers: {
    'Api-Key': \'${input.apiKeyHash}\'
  },
});

const cloudWalletData = await cloudWalletResponse.json();
if (String(cloudWalletResponse.status).startsWith('2')) {
  console.log('Authentication response:', cloudWalletData);
} else {
  console.log('Could not authenticate:', cloudWalletData.code, cloudWalletData.message);
  throw new Error('Could not authenticate');
}

const signCredentialResponse = await fetch('${input.cloudWalletApiUrl}/v1/wallet/sign-credential', {
  method: 'POST',
  headers: {
    'Authorization': \`\${cloudWalletData.wallet.accessToken}\`,
    'Content-Type': 'application/json',
    'Api-Key': apiKeyHash,
  },
  body: JSON.stringify({
    unsignedCredential: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "${input.schema.jsonLdContextUrl}"
      ],
      "id": \'claimId:${input.claimId}\',
      "type": ["VerifiableCredential", "${input.schema.type}"],
      "holder": {
        "id": \`\${cloudWalletData.wallet.did}\`
      },
      // should match fields in VC Schema
      credentialSubject: {
        "@type": "${input.schema.type}",
        \${1:name: {
          firstName: 'John',
          lastName: 'Doe'
        \\},
        dateOfBirth: '1990-01-01'}
      },
      "credentialSchema": {
        "id": "${input.schema.jsonSchemaUrl}",
        "type": "${input.schema.type}"
      },
      "issuanceDate": new Date().toISOString()
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
`;
}

export function axios(input: SnippetInput) {
  return `\
  const apiKeyHash = '${input.apiKeyHash}';

try {
  const { data: cloudWalletData } = await axios({
    url: '${input.iamUrl}/v1/cloud-wallet/${input.issuerDid}/authenticate',
    method: 'post',
    headers: {
      'Api-Key': \'${input.apiKeyHash}\'
    },
  });

  console.log('Authentication response:', cloudWalletData);

  try {
    const { data: signedCredentialData } = await axios({
      url: '${input.cloudWalletApiUrl}/v1/wallet/sign-credential',
      method: 'post',
      headers: {
        'Authorization': \`\${cloudWalletData.wallet.accessToken}\`,
        'Content-Type': 'application/json',
        'Api-Key': apiKeyHash,
      },
      data: {
        unsignedCredential: {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "${input.schema.jsonLdContextUrl}"
          ],
          "id": \'claimId:${input.claimId}\',
          "type": ["VerifiableCredential", "${input.schema.type}"],
          "holder": {
            "id": \`\${cloudWalletData.wallet.did}\`
          },
          // should match fields in VC Schema
          credentialSubject: {
            "@type": "${input.schema.type}",
            \${1:name: {
              firstName: 'John',
              lastName: 'Doe'
            \\},
            dateOfBirth: '1990-01-01'}
          },
          "credentialSchema": {
            "id": "${input.schema.jsonSchemaUrl}",
            "type": "${input.schema.type}"
          },
          "issuanceDate": new Date().toISOString()
        }
      }
    });
  
    console.log('Signed credential:', signedCredentialData.signedCredential);
  } catch (error) {
    const { code, message, context } = error.response.data;
    if (code === 'CWA-18') {
      console.log('Credential subject is invalid, validation errors:', context?.message);
    } else {
      console.log('Could not sign credential:', code, message);
    }
  }
} catch (error) {
  const { code, message, context } = error.response.data;
  console.log('Could not authenticate:', code, message);
}`;
}
