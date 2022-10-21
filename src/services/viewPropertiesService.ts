import { openReadOnlyJson } from "../utils/openReadOnlyContent";
import { ProjectSummary } from "./iamService";
import { IssuanceEntity, SchemaDescription } from "./issuancesService";
import { SchemaEntity } from "./schemaManagerService";

export const viewProjectProperties = async (
  projectId: string,
  projectName: string,
  projectsSummary: ProjectSummary[]
) => {
  const projectInfo = projectsSummary.find(
    (projectSummary) => projectSummary.project.projectId === projectId
  );
  if (projectInfo) {
    await openReadOnlyJson(
      { label: projectName, fullId: projectInfo.project.projectId },
      projectInfo
    );
  }
};

export const viewIssuanceProperties = async (
  issuanceId: string,
  issuancesSummary: IssuanceEntity[]
) => {
  const issuanceInfo = issuancesSummary.find(
    (issuanceSummary) => issuanceSummary.id === issuanceId
  );

  if (issuanceInfo) {
    await openReadOnlyJson(
      { label: issuanceId, fullId: issuanceId },
      issuanceInfo
    );
  }
};

export const viewSchemaProperties = async (schemaSummary: SchemaEntity) => {
  const id = schemaSummary.id;
  await openReadOnlyJson({ label: id, fullId: id }, schemaSummary);
};
