import { iamClient } from './features/iam/iamClient'

iamClient.listProjects = async () => ({
  projects: [
    {
      name: "Vitaly's Project",
      projectId: '021b82a6-f3b9-4a9b-8b40-9ca20e7973f7',
      createdAt: '2022-07-12T08:32:10.740Z',
    },
    {
      name: "Vitaly's Project 2",
      projectId: '72cede00-c4e0-47c6-8064-8917499b814b',
      createdAt: '2022-11-30T12:51:54.168Z',
    },
    {
      name: 'Empty Project',
      projectId: 'a9ad45a8-6020-45fc-90c8-370f13e30669',
      createdAt: '2022-11-27T09:40:05.577Z',
    },
  ],
})

const projectSummaries = {
  'a9ad45a8-6020-45fc-90c8-370f13e30669': {
    project: {
      name: 'Empty Project',
      projectId: 'a9ad45a8-6020-45fc-90c8-370f13e30669',
      createdAt: '2022-11-27T09:40:05.577Z',
    },
    apiKey: {
      apiKeyHash: '925172c3c06dbf03d904c30006987e3c9f3ecc9dfee4a48ef1fc78e64be920b8',
      apiKeyName: 'ea1c2884-11f8-4e6c-b8bc-8a47b4ef0aff',
    },
    wallet: {
      did: 'did:elem:EiCXWOyLFpw_PMQ2hq926eyX5hncwlOCo-N7P6ewPvm5Ig',
      didUrl:
        'did:elem:EiCXWOyLFpw_PMQ2hq926eyX5hncwlOCo-N7P6ewPvm5Ig;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBelptUTJZakZoTW1GaE1UbGtNR1JpT0RsaVpEWmtZVFJrWmpjeE9UVTROR014WlRoak1EQTFPREV6TW1Jek56RXpPRGRrWmpKaE9UQXlZMkUxWWpNeVpDSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpWbVlXTXpZV0poTXpFNU1XUXpPREF4TnpKak9EYzJNR0UxT0RReVptSmxOMlUxTmpFeU5qQmtabUUwTkRCbFltVTVOakkxWWpNM1ltTmpaRE14WXpraWZTeDdJbWxrSWpvaUkySmljeUlzSW5SNWNHVWlPaUpDYkhNeE1qTTRNVWN5UzJWNU1qQXlNQ0lzSW5WellXZGxJam9pYzJsbmJtbHVaeUlzSW5CMVlteHBZMHRsZVVKaGMyVTFPQ0k2SW5Cd1lsSTFjMlptY0doak5uazFUa1p4TVZKdlRWQmlRbVZ6YzNKbFJGSm9XWFpYWjJVNFNHOUxOMFIyT1dwTlFrWmxhVXB5TmxobFJrVmFaRm96V0VvMVVWb3hkMEpLY0dnMVNtRlNaREZGYURVMlRucHJZbWg0Wms1bGVIRmFjME5WYmxCQ1lXSmhhazQxZFhKaFFuVkhkMU55UWxSMlZFWmlVWHBCVW05bGNFeFlJbjFkTENKaGRYUm9aVzUwYVdOaGRHbHZiaUk2V3lJamNISnBiV0Z5ZVNJc0lpTmlZbk1pWFN3aVlYTnpaWEowYVc5dVRXVjBhRzlrSWpwYklpTndjbWx0WVhKNUlpd2lJMkppY3lKZGZRIiwic2lnbmF0dXJlIjoiWlJuX25GYXJwSGV4WWZ2WkFkUWkxQmlYUEZfX2ZXQmVGUEplTWFOc1lGMXFQbWNFUmJ0eEltOFhjNWVTQmNSdlZkdnlKMW54b2dCS0xjT2RvVjdfOHcifQ',
    },
  },
  '021b82a6-f3b9-4a9b-8b40-9ca20e7973f7': {
    project: {
      name: "Vitaly's Project",
      projectId: '021b82a6-f3b9-4a9b-8b40-9ca20e7973f7',
      createdAt: '2022-07-12T08:32:10.740Z',
    },
    apiKey: {
      apiKeyHash: '521240c2a556883aa35126b8e80afc48b5b119ecce12bad2b62fe123beecb68c',
      apiKeyName: 'vitaly.r@affinidi.com',
    },
    wallet: {
      did: 'did:elem:EiC8fehVnWr2XAXlNSdHWg8fy1s8rMImwgn3YaNZQL--jg',
      didUrl:
        'did:elem:EiC8fehVnWr2XAXlNSdHWg8fy1s8rMImwgn3YaNZQL--jg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVlXTmpaRE0xWVdJeU5EaGlNVFF5TXpobE5tVXdORGRpTWpVek5qVXlOakZtWm1NeU5ERTRabU0yWVdGbE1HUXhZVFJrWkRjME1XTmtOREZsT0dObE1pSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TXpGalpUUTNNR000Tm1GaU1EVTRZV1l5TUdJek9HRTFaREEyTXpnd1lURmxNbVZtWXpKbFl6ZGxZalJpTjJVelltVTRZakF5T0RNMU5qSTNNVFptT1RZaWZWMHNJbUYxZEdobGJuUnBZMkYwYVc5dUlqcGJJaU53Y21sdFlYSjVJbDBzSW1GemMyVnlkR2x2YmsxbGRHaHZaQ0k2V3lJamNISnBiV0Z5ZVNKZGZRIiwic2lnbmF0dXJlIjoiS2xxOVJzSVJmd05obkRJeHAtM2NIWWdXLWxuaFFSVEgxR011cG9oTUdBeFotLUR3NEZubVptQVFPQ1N6WXpXdlhfTmdVWXZmeEEtN0FZRlpqWWRlRncifQ',
    },
  },
  '72cede00-c4e0-47c6-8064-8917499b814b': {
    project: {
      name: "Vitaly's Project 2",
      projectId: '72cede00-c4e0-47c6-8064-8917499b814b',
      createdAt: '2022-11-30T12:51:54.168Z',
    },
    apiKey: {
      apiKeyHash: 'f141b7e53d2d7151b779049e1238fb43fca3d9dfab3c1b23615689ecfaaa28d9',
      apiKeyName: '74998b54-fe9a-442e-8099-d4259dd78fb4',
    },
    wallet: {
      did: 'did:elem:EiAyrOf_0Tpy3xyjIRfxsP9jNGUnamdixHkPjhsasxQqDg',
      didUrl:
        'did:elem:EiAyrOf_0Tpy3xyjIRfxsP9jNGUnamdixHkPjhsasxQqDg;elem:initial-state=eyJwcm90ZWN0ZWQiOiJleUp2Y0dWeVlYUnBiMjRpT2lKamNtVmhkR1VpTENKcmFXUWlPaUlqY0hKcGJXRnllU0lzSW1Gc1p5STZJa1ZUTWpVMlN5SjkiLCJwYXlsb2FkIjoiZXlKQVkyOXVkR1Y0ZENJNkltaDBkSEJ6T2k4dmR6TnBaQzV2Y21jdmMyVmpkWEpwZEhrdmRqSWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pSTNCeWFXMWhjbmtpTENKMWMyRm5aU0k2SW5OcFoyNXBibWNpTENKMGVYQmxJam9pVTJWamNESTFObXN4Vm1WeWFXWnBZMkYwYVc5dVMyVjVNakF4T0NJc0luQjFZbXhwWTB0bGVVaGxlQ0k2SWpBeVkyWTFOVEV6Wmprd016a3pZVGxtTjJOak1HSmhPVFExTnpnME5XSmpNRGc1TkRJeVltTmlPRFprWkdRME1qUXdZbUUzTW1FeVpUQTVZbVk0TlRBMk5DSjlMSHNpYVdRaU9pSWpjbVZqYjNabGNua2lMQ0oxYzJGblpTSTZJbkpsWTI5MlpYSjVJaXdpZEhsd1pTSTZJbE5sWTNBeU5UWnJNVlpsY21sbWFXTmhkR2x2Ymt0bGVUSXdNVGdpTENKd2RXSnNhV05MWlhsSVpYZ2lPaUl3TW1FMU1HUXpNemN5TWprek5URTBaRFZoTXpJNU9HSTBZamxtT1RNMFlUaGxZVGRsT0RNd09ESm1OV1E1WTJNeE1HWXlPRGs0WmpJNFpXTTFNbU00T0RNaWZTeDdJbWxrSWpvaUkySmljeUlzSW5SNWNHVWlPaUpDYkhNeE1qTTRNVWN5UzJWNU1qQXlNQ0lzSW5WellXZGxJam9pYzJsbmJtbHVaeUlzSW5CMVlteHBZMHRsZVVKaGMyVTFPQ0k2SW00NGFrdzJibFpvZERSRFVGTnVTbVoxUkhaR2VYcGlTbE4wTWxBNFJXVnFjSFpCTlVOdWFtOU1XVkJXYzJkb1dHOURObEpEYjBJeVozVkZSalkxVERWQ05HSllZM280ZWxGbU4wMTVkRVo1UWxoeGJXVndibkZyVWs1WE1tUTVOREo1ZWtjNFkxRkNWWGREWkdwbE0zRkdUVFZPY20xcVkxSmFSRlpqUkhOWVMwUXpJbjFkTENKaGRYUm9aVzUwYVdOaGRHbHZiaUk2V3lJamNISnBiV0Z5ZVNJc0lpTmlZbk1pWFN3aVlYTnpaWEowYVc5dVRXVjBhRzlrSWpwYklpTndjbWx0WVhKNUlpd2lJMkppY3lKZGZRIiwic2lnbmF0dXJlIjoiN3JtZ19ELXFtVzRoLXlaOTh2aVZWT1Y5UGlEeGdFU1J3RGxmTXY1aVJyRUVuUEJwZlV0SUhPb2tSb1VhQ2NvWEVmWW5uaElLMmF3V2FISHRidlVMMHcifQ',
    },
  },
}

iamClient.getProjectSummary = async ({ projectId }) => {
  // @ts-ignore
  return projectSummaries[projectId]
}
