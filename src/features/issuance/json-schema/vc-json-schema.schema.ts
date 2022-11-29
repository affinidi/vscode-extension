export const VC_JSON_SCHEMA = {
  type: 'object',
  required: ['$schema', 'type', 'properties', 'required'],
  properties: {
    $schema: {
      type: 'string',
    },
    $id: {
      type: 'string',
    },
    $metadata: {
      type: 'object',
      required: ['version', 'revision', 'discoverable', 'uris'],
      properties: {
        version: {
          type: 'number',
          min: 1,
        },
        revision: {
          type: 'number',
          min: 0,
        },
        discoverable: {
          type: 'boolean',
        },
        uris: {
          type: 'object',
          required: ['jsonLdContext', 'jsonSchema'],
          properties: {
            jsonLdContext: {
              type: 'string',
            },
            jsonSchema: {
              type: 'string',
            },
          },
        },
      },
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['object'],
    },
    properties: {
      type: 'object',
      required: [
        '@context',
        'id',
        'type',
        'issuer',
        'issuanceDate',
        'expirationDate',
        'credentialSchema',
        'credentialSubject',
      ],
      properties: {
        '@context': {
          type: 'object',
        },
        id: {
          type: 'object',
        },
        type: {
          type: 'object',
        },
        issuer: {
          type: 'object',
        },
        issuanceDate: {
          type: 'object',
        },
        expirationDate: {
          type: 'object',
        },
        credentialSchema: {
          type: 'object',
          required: ['type', 'properties'],
          properties: {
            type: {
              type: 'string',
              enum: ['object'],
            },
            properties: {
              type: 'object',
              properties: {
                id: {
                  type: 'object',
                },
                type: {
                  type: 'object',
                },
              },
              required: ['id', 'type'],
            },
          },
        },
        credentialSubject: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['object'],
            },
          },
        },
      },
    },
  },
}
