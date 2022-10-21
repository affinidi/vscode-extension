import { openReadOnlyJson } from "../utils/openReadOnlyContent";
import { ProjectSummary } from "./iamService";

export const viewProjectProperties = (
  projectId: string,
  projectName: string,
  projectsSummary: ProjectSummary[]
) => {
  const projectInfo = projectsSummary.find(
    (projectSummary) => projectSummary.project.projectId === projectId
  );
  if (projectInfo) {
    openPropertiesDataInJson(
      projectName,
      projectInfo.project.projectId,
      projectInfo
    );
  }
};

const openPropertiesDataInJson = async (
  label: string,
  id: string,
  data: any
) => {
  await openReadOnlyJson({ label, fullId: id }, data);
};
