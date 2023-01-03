const validVC = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://schema.affinidi.com/TestEmployeeCredentialPersonNestedV1-2.jsonld',
  ],
  id: 'claimId:6f4532f45933189d',
  type: ['VerifiableCredential', 'TestEmployeeCredentialPersonNested'],
  holder: {
    id: 'did:elem:EiC9C2LaJrhrgrmXHyamViL15bcAT7P4wBfWefTfGfPoEA',
  },
  credentialSubject: {
    data: {
      name: 'Jon Snow',
      dateOfJoining: '2021-01-01',
      otherDetails: {
        githubLink: 'https://github.com/jon-snow',
      },
    },
  },
  issuanceDate: '2021-10-21T20:58:21.217Z',
  issuer:
    'did:elem:EiD78M2fskp7WgStA915l6xdynkm2PGIn4XtJLF3HFitLw;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeU5tVmlaV0l3TTJFME56WmlPREJpWlRBd09EaGpaakUwTXpjMk9UTTVOR1l3TlRrNFpqZzNOVFEyT0dWbU1UUXdOakExTWpJMllURmxabUk1TkRaa01pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpKa1pESXlZekJqWTJZMFlUQmtOalV5TldFellUYzBaREUwT1dNeVl6TTNaalF6T1RrelpEUTVaV0ppTmpObU1qSmlObVUxWTJSa1lqSmhNREEwTURFaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiTHJoRDZhUzZMZHM4MnkwcWZmWjlSX1laUXhzSFNuQWxIWFpwUUVGaGoteEhsRExPb2pvM1piR2dBMDJ3b0hRVkdTUVhxdmtMTVVveTJjMmFjMWo3c1EifQ',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2021-10-21T20:59:04Z',
    verificationMethod: 'did:elem:EiD78M2fskp7WgStA915l6xdynkm2PGIn4XtJLF3HFitLw#primary',
    proofPurpose: 'assertionMethod',
    jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..u6Cp6BLlSyVMVshDpiLzzcgeAAz7pSLJnFQaMSiBzlcbj93_zKZ3sermaHnlH_5qKwOsmMnRtx5VMDLqe8fSJw',
  },
}

const invalidVC = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      HealthPassportBundleCredentialV1: {
        '@id': 'https://schema.affinity-project.org/HealthPassportBundleCredentialV1',
        '@context': {
          '@version': 1.1,
          '@protected': true,
        },
      },
      data: {
        '@id': 'https://schema.affinity-project.org/data',
        '@context': [
          null,
          {
            '@version': 1.1,
            '@protected': true,
            '@vocab': 'http://hl7.org/fhir/',
            Observation: {
              '@id': 'http://hl7.org/fhir/Observation',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            Immunization: {
              '@id': 'http://hl7.org/fhir/Immunization',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            Specimen: {
              '@id': 'http://hl7.org/fhir/Specimen',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            Organization: {
              '@id': 'http://hl7.org/fhir/Organization',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            BundleEntry: {
              '@id': 'http://hl7.org/fhir/BundleEntry',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            Bundle: {
              '@id': 'http://hl7.org/fhir/Bundle',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
              },
            },
            BundleContainer: {
              '@id': 'https://schema.affinity-project.org/BundleContainer',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': null,
                fhirVersion: 'https://schema.affinity-project.org/fhirVersion',
                fhirBundle: 'https://schema.affinity-project.org/fhirBundle',
              },
            },
            Patient: {
              '@id': 'http://hl7.org/fhir/Patient',
              '@context': {
                '@version': 1.1,
                '@protected': true,
                '@vocab': 'http://hl7.org/fhir/',
                resourceType: 'http://hl7.org/fhir/resourceType',
                identifier: 'http://hl7.org/fhir/identifier',
                active: 'http://hl7.org/fhir/active',
                name: 'http://hl7.org/fhir/name',
                gender: 'http://hl7.org/fhir/gender',
                birthDate: 'http://hl7.org/fhir/birthDate',
                telecom: 'http://hl7.org/fhir/telecom',
                address: 'http://hl7.org/fhir/address',
                contact: 'http://hl7.org/fhir/contact',
                communication: 'http://hl7.org/fhir/communication',
              },
            },
          },
        ],
      },
    },
    'https://w3id.org/vc-revocation-list-2020/v1',
  ],
  id: 'claimId:73aba53f3dbfde02',
  type: ['VerifiableCredential', 'HealthPassportBundleCredentialV1'],
  holder: {
    id: 'did:elem:EiDe6ItdvA6V_zG9stqpHDI8xSdizeyjDcPnFFEvp1cYyg',
  },
  credentialSubject: {
    data: {
      '@type': 'BundleContainer',
      fhirVersion: '4.0.1',
      fhirBundle: {
        '@type': 'Bundle',
        resourceType: 'Bundle',
        entry: [
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Patient',
              resourceType: 'Patient',
              active: true,
              telecom: [
                {
                  system: 'phone',
                  value: '+6518003339999',
                },
                {
                  system: 'email',
                  value: 'demo+2@affinidi.com',
                },
              ],
              name: [
                {
                  text: 'demo user',
                },
              ],
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: 'PPN',
                        display: 'Passport number',
                      },
                    ],
                    text: 'PPN',
                  },
                  value: 'E7831177B',
                },
              ],
              gender: 'male',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                  valueCodeableConcept: {
                    text: 'SGP',
                  },
                },
              ],
              birthDate: '1984-12-23',
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Specimen',
              resourceType: 'Specimen',
              status: 'available',
              type: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '119334006',
                    display: 'Sputum specimen',
                  },
                ],
              },
              collection: {
                collectedDateTime: '2020-12-23',
              },
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Observation',
              resourceType: 'Observation',
              effectiveDateTime: '2020-12-23',
              identifier: [
                {
                  type: {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: 'ACSN',
                        display: 'Accession ID',
                      },
                    ],
                    text: 'ACSN',
                  },
                  value: 'observation-identifier',
                },
              ],
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '260385009',
                    display: 'Negative',
                  },
                ],
              },
              performer: [
                {
                  resourceType: 'Practitioner',
                  name: [
                    {
                      text: 'PerformerName',
                    },
                  ],
                  qualification: [
                    {
                      identifier: [
                        {
                          value: 'MCR 123214',
                        },
                      ],
                      issuer: {
                        identifier: {
                          value: 'MOH',
                        },
                      },
                      code: {},
                    },
                  ],
                },
              ],
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '94531-1',
                    display:
                      'SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection',
                  },
                ],
              },
              status: 'final',
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Organization',
              resourceType: 'Organization',
              name: 'Raffles Medical Clinic',
              type: [
                {
                  text: 'Licensed Healthcare Provider',
                },
              ],
              endpoint: [
                {
                  display: 'http://www.rafflesmedical.com.sg',
                },
              ],
              contact: [
                {
                  telecom: [
                    {
                      system: 'phone',
                      value: '+6563111111',
                    },
                  ],
                  address: {
                    type: 'physical',
                    use: 'work',
                    text: 'Raffles Hospital 585 North Bridge Road Singapore 188770',
                  },
                },
              ],
              identifier: [
                {
                  id: 'organization-provider-1',
                },
              ],
            },
          },
          {
            '@type': 'BundleEntry',
            resource: {
              '@type': 'Organization',
              resourceType: 'Organization',
              name: 'Parkway Laboratory',
              type: [
                {
                  text: 'Accredited Laboratory',
                },
              ],
              endpoint: [
                {
                  display: 'https://www.parkwaylab.com.sg/',
                },
              ],
              contact: [
                {
                  telecom: [
                    {
                      system: 'phone',
                      value: '+6562789188',
                    },
                  ],
                  address: {
                    type: 'physical',
                    use: 'work',
                    text: '2 Aljunied Avenue 1 #07-11 Framework 2 Building Singapore 389977',
                  },
                },
              ],
              identifier: [
                {
                  id: 'organization-lab-1',
                },
              ],
            },
          },
        ],
      },
    },
  },
  issuanceDate: '2021-01-26T10:31:24.660Z',
  credentialStatus: {
    id: 'https://affinity-issuer.dev.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/did:elem:EiAc78fQqVpFmDpiTyAW1X99bfPCi_tft1Evhgdmg-mxxQ/14#12',
    type: 'RevocationList2020Status',
    revocationListIndex: '12',
    revocationListCredential:
      'https://affinity-issuer.dev.affinity-project.org/api/v1/revocation/revocation-list-2020-credentials/did:elem:EiAc78fQqVpFmDpiTyAW1X99bfPCi_tft1Evhgdmg-mxxQ/14',
  },
  issuer:
    'did:elem:EiAc78fQqVpFmDpiTyAW1X99bfPCi_tft1Evhgdmg-mxxQ;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVlqQTNOV1pqTkRObE5UUXdPVFk0WWpKa01qbGtZV1ZrWVRkaU1EQmpaVFUyTmpaa05HVmxaak14WVdObU1UZzJaV0ZqWkdVd1lqTmtNak00TldJMlppSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1KbE5UWXdNV0U0TkdSak5tRTBNRGszWXpJM1pUQTRNR1V4TlRobFlqZG1PRGN4TVRBeVpESmhNMlF6WVRrMk56VXpaV1prT1dNMk16Sm1OV0V4TUdFaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiSEQzX2RQamlXZWRvQzZrMDJsNEt1MGZPd0s3Nl9UZHd6OW51R2ZYdE9kb2RjUjNmZHdXWnpHTG83N0V2c2R2dkR6dUhEVzM3Y19HVFAyd3BtYXRsdUEifQ',
  proof: {
    type: 'EcdsaSecp256k1Signature2019',
    created: '2021-01-26T10:31:28Z',
    verificationMethod: 'did:elem:EiAc78fQqVpFmDpiTyAW1X99bfPCi_tft1Evhgdmg-mxxQ#primary',
    proofPurpose: 'assertionMethod',
    jws: 'eyJhbGciOiJFUzI1NksiLCJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdfQ..C_jYFcRBblzShjVoSr9kmaPoOcFs1vsaxAG21oxZmuMTxdvw2L1buWRuxOhz39epUW1sCWAL0i34l3hb66fbMA',
  },
}

export const vcExamples = {
  validVC,
  invalidVC,
}
