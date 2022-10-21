import { openReadOnlyJson } from "../utils/openReadOnlyContent";
import { ProjectSummary } from "./iamService";

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
