export enum AffinidiVariantTypes
{
    schema,
    rule,
    ruleData,
    signedCredential,
    unsignedCredential,
    did,
    project,
    text,
    rootProjects,
    rootSchemas,
    rootAnalytics,
    rootRules,
    empty,
    other
}

export interface AffinidiVariant
{
    affId: string;
    type: AffinidiVariantTypes;
    data: any;
}