# About Issuance

## What is Issuance

Issuance is used to issue digital credentials, structured according to the selected credential schema, and deliver them to recipients via email. When performed as a batch based on a CSV file, it saves a tremendous amount of time and operationalises the task of issuing and delivering digital credentials.

## How does Issuance work

Let us take a look under the hood. Firstly, an issuance “container” is created, which is defined by the credential schema selected, your project’s issuer DID used, a wallet URL and a timestamp. Secondly, individual credential offers are added to it. As these credential offers do not contain holder DIDs at this point, they are not yet the digital credentials. 

In order to finalise the credential issuance process, emails are sent out to the recipients. They receive a link in their mailbox to a wallet with a Credential Offer Request Token. When clicking this link they will be redirected to a wallet that generates a Credential Offer Response Token and uses it to claim the digital credential. A successful login to the wallet implicitly proves that a recipient has access to the specified email and provides the missing holder DID information necessary to issue the digital credential.

## Frequently asked questions

### Where can I find a schema URL?

Issuance works best with the schemas stored under VC Schemas. You can use either JSON schema URL or JSON-LD context URL of the selected schema. Here are examples of both URLs for a credential: 

- JSON schema URL: `https://schema.affinidi.com/MySchemaV1-0.json`
- JSON-LD context URL: `https://schema.affinidi.com/MySchemaV1-0.jsonld`

### Which wallet will be used?

To complete the flow it is necessary to deploy a wallet that supports the claim flow. You can easily create a wallet using the app generators available through [Affinidi CLI](https://www.npmjs.com/package/@affinidi/cli) and [Affinidi VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Affinidi.affinidi). You can also create your own wallet and add claim flow support to it: if you are using Affinidi Cloud Wallet you can use the [ClaimCredentials endpoint](https://cloud-wallet-api.aps1.affinidi.io/api-docs/#/Wallet/ClaimCredentials), if you are creating your own wallet you can use Affinidi SDK [claimCredentials function](https://github.com/affinidi/affinidi-core-sdk/blob/f11ec09d0cf5d2b06147d83c3dfe5a1d9cb89e93/sdk/core/src/CommonNetworkMember/BaseNetworkMember.ts#L1154).

### What is the structure of a CSV file to upload?

In general, a CSV file structure matches a schema structure when there is a column in the CSV file for each required schema attribute, and their names match. Moreover, there should exist a column named `@target.email`, which contains the emails of VC recipients.

*Tip: you can also utilise a CSV file template, based on the selected schema.*

### How to avoid validation errors?

In order to successfully pass the validation, a CSV file must:

- be smaller than 3MB
- be comma-separated, not semicolon-separated
- contain less than 100 rows
- contain a column named `@target.email`
- contain recipient emails in each row of the column named `@target.email`
- contain all columns named according to each of the required attributes of the selected schema
- contain values in all these columns

### Where can I find the correct format for specific input types?

The built-in formats listed in the [JSON Schema specification](https://json-schema.org/draft/2020-12/json-schema-validation.html#name-defined-formats) are supported, i.e.

|Input Type|Example|Specification|
|---|---|---|
|Text|`my text`||
|Number|`136.8`||
|Boolean|either `true` or `false`||
|Date|`2022-09-27`|[RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)|
|DateTime|`2022-09-27T15:00:00+00:00`|[RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)|
|URI|`https://www.affinidi.com/`|[RFC3986](https://tools.ietf.org/html/rfc3986)|
|DID|`did:example:321`|[RFC3986](https://tools.ietf.org/html/rfc3986)|

### What do credential offer statuses mean?

There are three credential offer statuses:

- `CREATED` is a new credential offer, which has not yet been claimed by the recipient or expired without being claimed

- `CLAIMED` is a credential offer, which has been successfully claimed as a digital credentials by the recipient

- `EXPIRED` is a credentials offer, which has been expired, as the recipient has not claimed it within a month.

### What happens after I issue credentials?

Each recipient gets an email with a link which will lead them to a wallet, where they get access to their digital credentials.
