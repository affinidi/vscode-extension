import { ExplorerResourceTypes } from "../treeView/treeTypes";

export const viewMarkdown = async (resourceType: string) => {
  let uri: string = "";

  switch (resourceType) {
    case ExplorerResourceTypes[ExplorerResourceTypes.rootIssuance]:
      uri = "/document/bulkIssuance.md";
      break;

    case ExplorerResourceTypes[ExplorerResourceTypes.rootSchemas]:
      uri = "/document/schemaManager.md";
      break;
  }

  return uri;
};
