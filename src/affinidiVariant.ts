export enum AffinidiVariantTypes
{
    schema,
    rule,
    ruleData,
    issuance,
    signedCredential,
    unsignedCredential,
    did,
    project,
    text,
    rootProjects,
    rootSchemas,
    rootIssuance,
    rootAnalytics,
    rootRules,
    rootDID,
    empty,
    other
}

export interface AffinidiVariant
{
    affId: string;
    type: AffinidiVariantTypes;
    data: any;
}