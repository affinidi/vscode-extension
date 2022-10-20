import { openReadOnlyJson } from "../utils/openReadOnlyContent";
import { ProjectSummary } from "./iamService";

export const viewProjectProperties = (
  context: any,
  projectsSummary: ProjectSummary[]
) => {
  const projectInfo = projectsSummary.find(
    (projectSummary) => projectSummary.project.projectId === context.metadata
  );
  if (projectInfo) {
    openPropertiesDataInJson(
      context.label,
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
