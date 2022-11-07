import fetch from "node-fetch";
import { ExplorerResourceTypes } from "../treeView/treeTypes";
import { openReadOnlyContent } from "../utils/openReadOnlyContent";

export const viewProperties = async (
  resourceType: string,
  resourceInfo: any
) => {
  let label: string = "";
  let id: string = "";
  switch (resourceType) {
    case ExplorerResourceTypes[ExplorerResourceTypes.project]:
      label = resourceInfo.project.name;
      id = resourceInfo.project.projectId;
      break;

    case ExplorerResourceTypes[ExplorerResourceTypes.issuance]:
    case ExplorerResourceTypes[ExplorerResourceTypes.schema]:
      label = resourceInfo.id;
      id = resourceInfo.id;
      break;
  }

  await openReadOnlyContent({ node: { label, id }, content: resourceInfo });
};

export const viewSchemaContent = async (
  schemaName: string,
  url: string,
  fileExtension?: string
) => {
  const fetchedData = await fetch(url);
  const schemaContent = await fetchedData.json();
  await openReadOnlyContent({
    node: { label: schemaName, id: schemaName },
    content: schemaContent,
    fileExtension,
  });
};
