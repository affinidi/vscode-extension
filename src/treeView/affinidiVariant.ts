export enum AffinidiVariantTypes {
  project,
  rootSchemas,
  schema,
  rootIssuance,
  issuance,
  rootRules,
  rule,
  rootDID,
  did,
  rootAnalytics,
  empty,
  other,
}

export interface AffinidiVariant {
  affId: string;
  type: AffinidiVariantTypes;
  data: any;
}
