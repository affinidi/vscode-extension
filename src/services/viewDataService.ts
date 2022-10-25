import fetch from "node-fetch";
import { AffinidiVariantTypes } from "../treeView/affinidiVariant";
import { openReadOnlyContent } from "../utils/openReadOnlyContent";

export const viewProperties = async (
  resourceType: string,
  resourceInfo: any
) => {
  let label: string = "";
  let id: string = "";
  switch (resourceType) {
    case AffinidiVariantTypes[AffinidiVariantTypes.project]:
      label = resourceInfo.project.name;
      id = resourceInfo.project.projectId;
      break;

    case AffinidiVariantTypes[AffinidiVariantTypes.issuance]:
    case AffinidiVariantTypes[AffinidiVariantTypes.schema]:
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
