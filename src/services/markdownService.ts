import fetch from "node-fetch";
import { AffinidiVariantTypes } from "../treeView/affinidiVariant";

export const viewMarkdown = async (resourceType: string) => {
  let uri: string = "";

  switch (resourceType) {
    case AffinidiVariantTypes[AffinidiVariantTypes.rootIssuance]:
      uri = "/document/bulkIssuance.md";
      break;

    case AffinidiVariantTypes[AffinidiVariantTypes.rootSchemas]:
      uri = "/document/schemaManager.md";
      break;
  }

  return uri;
};
