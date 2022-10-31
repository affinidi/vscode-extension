import { SnippetInput } from './snippet';

export function fetch(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string; context?: { errors?: { field: string; name: string; message: string }[] } };
type CreateIssuanceResponse = { id: string };
type CreateOfferResponse = { id: string };

const apiKeyHash = '${input.apiKeyHash}';
const projectId = '${input.projectId}';
const issuerDid = '${input.issuerDid}';

const issuanceResponse = await fetch('${input.issuanceApiUrl}/v1/issuances', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': apiKeyHash,
  },
  body: JSON.stringify({
    projectId,
    template: {
      issuerDid,
      // use Schema Manager to find or create a schema for your VC
      schema: {
        type: '${input.schema.type}',
        jsonLdContextUrl: '${input.schema.jsonLdContextUrl}',
        jsonSchemaUrl: '${input.schema.jsonSchemaUrl}',
      },
      verification: {
        // claim link will be sent by email
        method: 'email',
      }
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

const offerResponse = await fetch(\`${input.issuanceApiUrl}/v1/issuances/\${issuanceData.id}/offers\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': apiKeyHash,
  },
  body: JSON.stringify({
    // should match fields in VC Schema, specified in the Issuance template
    credentialSubject: {
      \${2:name: {
        firstName: 'John',
        lastName: 'Doe'
      \\},
      dateOfBirth: '1990-01-01'}
    },
    verification: {
      target: {
        // VC claim link will be sent here
        email: '${input.email || '${1:email@example.com}'}'
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
}`;
}

export function axios(input: SnippetInput) {
  return `\
type ApiOperationError = { code: string; message: string; context?: { errors?: { field: string; name: string; message: string }[] } };
type CreateIssuanceResponse = { id: string };
type CreateOfferResponse = { id: string };
  
const apiKeyHash = '${input.apiKeyHash}';
const projectId = '${input.projectId}';
const issuerDid = '${input.issuerDid}';

try {
  const { data: issuanceData } = await axios<CreateIssuanceResponse>({
    url: '${input.issuanceApiUrl}/v1/issuances',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKeyHash,
    },
    data: {
      projectId,
      template: {
        issuerDid,
        // use Schema Manager to find or create a schema for your VC
        schema: {
          type: '${input.schema.type}',
          jsonLdContextUrl: '${input.schema.jsonLdContextUrl}',
          jsonSchemaUrl: '${input.schema.jsonSchemaUrl}',
        },
        verification: {
          // claim link will be sent by email
          method: 'email',
        }
      }
    }
  });

  console.log('Issuance ID:', issuanceData.id);

  try {
    const { data: offerData } = await axios<CreateOfferResponse>({
      url: \`${input.issuanceApiUrl}/v1/issuances/\${issuanceData.id}/offers\`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKeyHash,
      },
      data: {
        // should match fields in VC Schema, specified in the Issuance template
        credentialSubject: {
          \${2:name: {
            firstName: 'John',
            lastName: 'Doe'
          \\},
          dateOfBirth: '1990-01-01'}
        },
        verification: {
          target: {
            // VC claim link will be sent here
            email: '${input.email || '${1:email@example.com}'}'
          }
        }
      }
    });
  
    console.log('Offer ID:', offerData.id);
  } catch (error: any) {
    const { code, message, context }: ApiOperationError = error.response.data;
    if (code === 'VIS-10') {
      console.log('Issuance has not been found');
    } else if (code === 'VIS-18') {
      console.log('Credential subject is invalid, validation errors:', context?.errors);
    } else {
      console.log('Could not create an offer:', code, message);
    }
  }
} catch (error: any) {
  const { code, message }: ApiOperationError = error.response.data;
  console.log('Could not create an issuance:', code, message);
}`;
}
