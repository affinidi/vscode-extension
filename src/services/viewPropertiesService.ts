import { openReadOnlyJson } from "../utils/openReadOnlyContent";
import { ProjectSummary } from "./iamService";
import { IssuanceEntity } from "./issuancesService";

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
  projectId: string,
  id: string,
  issuancesSummary: IssuanceEntity[]
) => {
  const issuanceInfo = issuancesSummary.find(
    (issuanceSummary) => issuanceSummary.id === projectId
  );

  if (issuanceInfo) {
    await openReadOnlyJson(
      { label: id, fullId: issuanceInfo.id },
      issuanceInfo
    );
  }
};
