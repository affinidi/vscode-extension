import { AffinidiVariantTypes } from "../treeView/affinidiVariant";
import { openReadOnlyJson } from "../utils/openReadOnlyContent";

export const viewProperties = async (
  resourceType: string,
  resourceInfo: any
) => {
  let label: string = "";
  let fullId: string = "";
  switch (resourceType) {
    case AffinidiVariantTypes[AffinidiVariantTypes.project]:
      label = resourceInfo.project.name;
      fullId = resourceInfo.project.projectId;
      break;
      
    case AffinidiVariantTypes[AffinidiVariantTypes.issuance]:
    case AffinidiVariantTypes[AffinidiVariantTypes.schema]:
      label = resourceInfo.id;
      fullId = resourceInfo.id;
      break;
  }

  await openReadOnlyJson({ label, fullId }, resourceInfo);
};
