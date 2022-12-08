# About VC Schemas

## What are VC Schemas
With VC Schemas you can select the suitable schema for your digital credential or to create a new one - either based on an already existing schema or entirely from scratch.

## How to use a schema
Each schema provides URLs for two kinds of schema representations: JSON Schema and JSON-LD Context. You can reference any schema in a digital credential or an application by these URLs.

## How to create or fork a schema
If you cannot find a suitable schema for your use case, you have two options:
- Fork an existing schema, which can be reasonably adapted
- Create a new schema from scratch

## Frequently asked questions

### Why are schemas forked and not edited?
Schemas are immutable by design. They can be created and forked but can never be deleted or edited. A schema must always be available online so that digital credentials issued with this schema are ready to be verified at any given moment.

### What is a schema type?
Searching for an existing schema that may fit your purpose is recommended before creating a new one for your digital credentials. There are many standard schemas and some user-generated schemas already available in the Affinidi Schema Manager for your disposal. You can search for them by schema type. Providing a meaningful and expressive type for your newly created schemas is essential.

### What is the difference between a version and a revision?
All the revisions of the single version should be compatible with each other, whereas new versions could feature breaking changes, e.g. new mandatory fields.

Adherence to this principle is not enforced, but it is good to remember when choosing between a new version or revision for your forked schema.

### What does it mean to *“Make this schema public”*?
Schemas can be either public (visible for everyone) or unlisted (JSON Schema and JSON-LD Context are only accessible via direct link). 

It is important to remember that versions and revisions of public and unlisted schemas are independent, and the system maintains them in parallel. However, you can always fork your unlisted schema to make it public and vice versa.

### What attribute types are available?
|Name|Definition|Example|
|---|---|---|
|Nested attribute|a container for attributes|groups other attributes|
|DID|a decentralized identifier |`did:example:123`|
|Text|a string value|`my text`|
|URI|a link to a web resource|`https://www.affinidi.com/`|
|Date|a date (ISO 8601)|`2011-04-01`|
|DateTime|a specific point in time (ISO 8601)|`2011-05-08T19:30`|
|Number|a numerical value|`123.45`|
|Boolean|a boolean value|either `true` or `false`|
