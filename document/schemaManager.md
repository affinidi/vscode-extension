# What is Schema manager?

If you want to build an app using Affinidi components, you should start here.
Schema Manager helps you to find the right schema for your verifiable credential or to create a new one -
either on the basis of an already existing schema, or completely from scratch.

# How to use Schema manager?

Schema Manager provides URLs for two kinds of schema representations: JSON Schema and JSON-LD context.
Any schema can be referenced in a verifiable credentials or an application by these URLs.

> :info: How to use a schema?
>
> 1. Click on the required schema, so that schema details opens.
> 2. Click on “Issue VC with this schema”, so that “Schema URLs” drop-down opens
> 3. Click either on “JSON Schema” or “JSON-LD Context” to activate the according option, so that the option is activated
> 4. Either copy the associated URL or open it in a new tab to review the according schema representation
> 5. Reference the required schema by these URLs.

# How to create or fork a schema?

If you cannot find the right schema for your use case, you have two options:

1. fork an exiting schema, which can be reasonably adapted
2. create a new schema from scratch

In both cases you follow the same basic steps.

> :info: How to fork a schema?
>
> 1. Click on “Create” (to create a new schema) or click on the existing schema, then click on “Fork this schema” (to fork an exiting schema)
> 2. Provide the general information:
> 3. Enter or review “Credential schema type”
> 4. Enter or review “Description”
> 5. Review “Version” and “Revision”
> 6. Decide if the schema should be public or private (unlisted)
> 7. Provide the schema attributes (review the existing and/or create new attributes according to your use case)
> 8. Review and confirm the resulting schema structure to be created

# Why schemas are forked and not edited?

Before creating a new schema for your verifiable credentials, it is recommended to search for an existing one, which may fit your purpose.
There are both a number of standard schemas and some user-generated schemas already available in the Schema Manager for your disposal,
and you can search for them by “Credential schema type”.
That is why it is important to provide a meaningful and expressive type for your newly created schemas.

# What is the difference between a version and a revision?

Essentially, all the revisions of the single version should be compatible with each other, whereas new versions could feature breaking changes, e.g. new mandatory fields.

Currently adherence to this principle is not enforced, but it is good to keep in mind when choosing between new version or revision for your forked schema.

# What does it mean to “publish as searchable schema”?

Schemas can be either public (visible and searchable for everyone ) or private (unlisted, visible and searchable only for you).
When you “publish as searchable schema”, you make your schema public.

It is important to remember, that versions and revisions of public and private (unlisted) schema are independent of each other, and are maintained by the system in parallel.
However, you can always fork your private (unlisted) schema in order to make it public and vice versa.

# What attribute types are available?

- **Nested attribute** – a container for attributes
- **DID** – a decentralized identifier  
  _Example: \`"did:example:123"\`_
- **Text** – a string value  
  _Example: \`"my text"\`_
- **URL** – a link to a web resource  
  _Example: \`"http://ui.schema.affinidi.com/"\`_
- **Date** – a date (ISO 8601)  
  _Example: \`"2011-04-01"\`_
- **DateTime** – a specific point in time (ISO 8601)  
  _Example: \`"2011-05-08T19:30"\`_
- **Number** – a numerical value  
  _Example: \`123.45\`_
- **Boolean** – a boolean value  
  _Example: \`true\` or \`false\`_
