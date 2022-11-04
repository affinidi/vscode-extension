import { SnippetInput } from "./snippet";

export function fetch(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string; context?: { message?: string } };
type AuthenticateCloudWalletResponse = { apiKey: { apiKeyHash: string }; wallet: { did: string; didUrl: string; accessToken: string; } };
type SignedVcResponse = { signedCredential: any }

const apiKeyHash = '${input.apiKeyHash}';

const cloudWalletResponse = await fetch('${input.iamUrl}/v1/cloud-wallet/${input.issuerDid}/authenticate', {
  method: 'POST',
  headers: {
    'Api-Key': \'${input.apiKeyHash}\'
  },
});

const cloudWalletData: AuthenticateCloudWalletResponse | ApiOperationError = await cloudWalletResponse.json();
if ('wallet' in cloudWalletData) {
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

const signedCredentialData: SignedVcResponse | ApiOperationError = await signCredentialResponse.json();
if ('signedCredential' in signedCredentialData) {
  console.log('Signed credential:', signedCredentialData.signedCredential);
} else if (signedCredentialData.code === 'CWA-18') {
  console.log('Credential subject is invalid, validation errors:', signedCredentialData.context?.message);
} else {
  console.log('Could not sign credential:', signedCredentialData.code, signedCredentialData.message);
}`;
}

export function axios(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string; context?: { message: string } };
type AuthenticateCloudWalletResponse = { apiKey: { apiKeyHash: string }; wallet: { did: string; didUrl: string; accessToken: string; } };
type SignedVcResponse = { signedCredential: any }

const apiKeyHash = '${input.apiKeyHash}';

try {
  const { data: cloudWalletData } = await axios<AuthenticateCloudWalletResponse>({
    url: '${input.iamUrl}/v1/cloud-wallet/${input.issuerDid}/authenticate',
    method: 'post',
    headers: {
      'Api-Key': \'${input.apiKeyHash}\'  
    },
  });

  console.log('Authentication response:', cloudWalletData);

  try {
    const { data: signedCredentialData } = await axios<SignedVcResponse>({
      url: '${input.cloudWalletApiUrl}/v1/wallet/sign-credential',
      method: 'post',
      headers: {
        'Authorization': \`\${cloudWalletData.wallet.accessToken}\`,
        'Content-Type': 'application/json',
        'Api-Key': apiKeyHash,
      },
      data: JSON.stringify({
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
  
    console.log('Signed credential:', signedCredentialData.signedCredential);
  } catch (error: any) {
    const { code, message, context }: ApiOperationError = error.response.data;
    if (code === 'CWA-18') {
      console.log('Credential subject is invalid, validation errors:', context?.message);
      throw new Error('Credential subject is invalid');
    } else {
      console.log('Could not sign credential:', code, message);
      throw new Error('Could not sign credential');
    }
  }
} catch (error: any) {
  if (error.response) {
    const { code, message }: ApiOperationError = error.response.data;
    console.log('Could not authenticate:', code, message);
    throw new Error('Could not authenticate');
  } else { 
    throw new Error(error);
  }
}`;
}
