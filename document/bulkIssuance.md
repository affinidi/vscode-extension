# What is Bulk Issuance

Bulk Issuance is used to issue digital credentials in a batch based on a CSV file, structured according to the selected credential schema, and deliver them to recipients via email. It saves a tremendous amount of time and operationalises the task of issuing and delivering digital credentials.

> How to Use Bulk Issuance
> 1. Click “Issue credentials”
> 2. Enter schema URL
>    * _Tip: if you have selected a schema from Schema Manager by clicking “Issue VC with schema”, the schema URL is automatically pre-filled here_
> 3. Confirm that your are aware that emails with digital credentials are actually going to be sent out to the email addresses listed in the CSV file, as soon as you click “Issue credentials” button and thus check “I confirm to send an email to all the recipients in the CSV”
> 4. Upload a CSV file with credential data
>    * _Tip: you can also download a CSV file template, based on the selected schema, by clicking “Download CSV Template” and filling it out_
> 5. Click “Issue credentials”, wait until the batch is fully processed and review the results

# How Does Bulk Issuance Work

Let us take a look under the hood. Firstly, an issuance is created, which is defined by the credential schema selected, your issuer DID used and a creation timestamp. Secondly, individual credential offers are added for each row of the uploaded CSV file. As these credential offers do not contain holder DIDs at this point, they are not yet the digital credentials.

In order to finalise the credential issuance process, emails are sent out to the recipients. They receive a Credential Offer Request Token as a link in their mailbox and respond with a Credential Offer Response Token by clicking the link and logging in to Affinidi Wallet to claim their digital credential. Successful login implicitly proves that a recipient has access to the specified email and provides the missing holder DID information necessary to issue the digital credential.

# Where Can I Find a Schema URL?

Bulk Issuance works best with the schemas hosted in [Affinidi Schema Manager](https://console.affinidi.com/schema-manager). You can use either JSON schema URL or JSON-LD context URL, which can be found in the detailed view of an individual schema. Here are examples of both URLs for a \`PartyInvite\` credential:
* JSON schema URL: \`https://schema.affinidi.com/PartyInviteV1-0.json\`
* JSON-LD context URL: \`https://schema.affinidi.com/PartyInviteV1-0.jsonld\`

# What Is the Structure of a CSV File to Upload?

In general, a CSV file structure matches a schema structure when there is a column in the CSV file for each required schema attribute, and their names match. Moreover, there should exist a column named \`@target.email\`, which contains the emails of VC recipients.

_Tip: you can also download a CSV file template, based on the selected schema, by clicking “Download CSV Template” and filling it out._

# How to Avoid Validation Errors?

In order to successfully pass the validation, a CSV file must:
* be smaller than 3MB
* be comma-separated, not semicolon-separated
* contain less than 100 rows
* contain a column named \`@target.email\`
* contain recipient emails in each row of the column named \`@target.email\`
* contain all columns named according to each of the required attributes of the selected schema
* contain values in all these columns

# How to Correctly Format Input Types?

The built-in formats listed in the [JSON Schema specification](https://json-schema.org/draft/2020-12/json-schema-validation.html#name-defined-formats) are supported, i.e.
* \`Text\`, _example: **Affinidi**_
* \`Number\`, _example: **136,8**_
* \`Boolean\`, _example: **true**_
* \`Date\` (as specified in [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)), _example: **2022-09-27**_
* \`DateTime\` (as specified in [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)), _example: **2022-09-27T15:00:00+00:00**_
* \`URI\` (as specified in [RFC3986](https://tools.ietf.org/html/rfc3986)), _example: **https://console.affinidi.com/**_
* \`DID\` (as specified in [RFC3986](https://tools.ietf.org/html/rfc3986)), _example: **did:example:321**_

# What Do Credential Offer Statuses Mean?

There are three credential offer statuses:
* \`CREATED\` is a new credential offer, which has not yet been claimed by the recipient or expired without being claimed
* \`CLAIMED\` is a credential offer, which has been successfully claimed as a digital credentials by the recipient
* \`EXPIRED\` is a credentials offer, which has been expired, as the recipient has not claimed it within a month

# What Happens after I Issue Credentials?

Each recipient gets an email with the following structure and a link which will lead them to [Affinidi Wallet](https://wallet.affinidi.com/), where they get access to their digital credentials.



_Hello!_

_A digital credential has been issued to you via Affinidi console._
_You can use your digital credential to prove information about yourself, including your employment, educational history, etc._
_To read more about digital credentials: [https://academy.affinidi.com](https://academy.affinidi.com)_

_Follow the link below to view and claim your credential: \`Affinidi Wallet URL\`_

_Please note, you have one month to claim your credential._

_Thank You!_

_Affinidi Team_

#