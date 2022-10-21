import {
  authentication,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  Command,
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import {
  getProjectIssuances,
  IssuanceList,
} from "../services/issuancesService";
import {
  getProjects,
  getProjectSummary,
  ProjectList,
  ProjectSummary,
} from "../services/iamService";
import { getPublicSchemas } from "../services/schemaManagerService";
import { AffinidiVariantTypes } from "./affinidiVariant";
import AffResourceTreeItem from "./treeItem";
import { ext } from "../extensionVariables";
import { AUTH_PROVIDER_ID } from "../auth/authentication-provider/affinidi-authentication-provider";

const isSignedIn = async () => {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: false,
  });
  return !!session;
};

export class AffinidiExplorerProvider
  implements TreeDataProvider<AffResourceTreeItem>
{
  private _onDidChangeTreeData: EventEmitter<
    AffResourceTreeItem | undefined | void
  > = new EventEmitter<AffResourceTreeItem | undefined | void>();
  readonly onDidChangeTreeData: Event<AffResourceTreeItem | undefined | void> =
    this._onDidChangeTreeData.event;

  projectsSummary: ProjectSummary[] = [];

  constructor() {
    ext.context.subscriptions.push(
      ext.authProvider.onDidChangeSessions(this.authListener)
    );
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private authListener = async (
    event: AuthenticationProviderAuthenticationSessionsChangeEvent
  ) => {
    this.refresh();
  };

  public getTreeItem(element: AffResourceTreeItem): TreeItem {
    return element;
  }

  public async getChildren(
    element?: AffResourceTreeItem
  ): Promise<AffResourceTreeItem[]> {
    const treeNodes: AffResourceTreeItem[] = [];

    if (!(await isSignedIn())) {
      await this._addLoginItem(treeNodes);
      return Promise.resolve(treeNodes);
    }

    switch (element?.resourceType) {
      case undefined:
        await this._addProjectItems(treeNodes);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.project]:
        await this._addProductItems(treeNodes, element);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootDID]:
        await this._addDIDItems(treeNodes, element);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootSchemas]:
        await this._addSchemaItems(treeNodes, element);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootIssuance]:
        await this._addIssuanceItems(treeNodes, element);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootRules]:
        await this._addRuleItems(treeNodes, element);
        break;

      default:
        await this._addEmptyItem(treeNodes, element);
        break;
    }

    return Promise.resolve(treeNodes);
  }

  private async _addProjectItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectListResponse: ProjectList = await getProjects();

    projectListResponse.projects.map(async (project) => {
      this.addNewTreeItem(
        treeNodes,
        AffinidiVariantTypes.project,
        project.projectId,
        project.name,
        "",
        TreeItemCollapsibleState.Collapsed,
        new ThemeIcon("project"),
        parent
      );
      const projectSummary = await getProjectSummary(project.projectId);
      this.projectsSummary.push(projectSummary);
    });
  }

  private async _addProductItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootDID,
      "",
      "Digital Identities",
      "",
      TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("lock"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootIssuance,
      "",
      "Issuances",
      "",
      TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("output"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootSchemas,
      "",
      "VC Schemas",
      "",
      TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("bracket"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootRules,
      "",
      "Rules",
      "",
      TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("server-process"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootAnalytics,
      "",
      "Analytics",
      "",
      TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("graph"),
      parent
    );
  }

  private async _addDIDItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo = this.projectsSummary.find(
      (projectSummary) =>
        projectSummary.project.projectId === parent?.parent?.metadata
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.schema,
      projectInfo?.wallet.didUrl || "",
      projectInfo?.wallet.did || "",
      "",
      TreeItemCollapsibleState.None,
      new ThemeIcon("lock"),
      parent
    );
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const res = await getPublicSchemas();

    res.schemas.map((schema) =>
      this.addNewTreeItem(
        treeNodes,
        AffinidiVariantTypes.schema,
        schema.id,
        schema.type,
        "",
        TreeItemCollapsibleState.None,
        new ThemeIcon("bracket"),
        parent
      )
    );
  }

  private async _addIssuanceItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo = this.projectsSummary.find(
      (projectSummary) =>
        projectSummary.project.projectId === parent?.parent?.metadata
    );
    if (projectInfo) {
      const issuanceListResponse: IssuanceList = await getProjectIssuances({
        apiKeyHash: projectInfo.apiKey.apiKeyHash,
        projectId: projectInfo.project.projectId,
      });

      issuanceListResponse.issuances.map((issuance) =>
        this.addNewTreeItem(
          treeNodes,
          AffinidiVariantTypes.issuance,
          issuance.id,
          issuance.id,
          "",
          TreeItemCollapsibleState.None,
          new ThemeIcon("output"),
          parent
        )
      );
    }
  }

  private async _addRuleItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:21835",
      "Education match",
      "MOCKED",
      TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:54835",
      "Health skills check",
      "MOCKED",
      TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:19805",
      "License compliance",
      "MOCKED",
      TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:74802",
      "Email validator",
      "MOCKED",
      TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );
  }

  private async _addEmptyItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.empty,
      "",
      "(empty)",
      "",
      TreeItemCollapsibleState.None,
      new ThemeIcon("dash"),
      parent
    );
  }

  private async _addLoginItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.login,
      "",
      "Sign in to Affinidi",
      "",
      TreeItemCollapsibleState.None,
      new ThemeIcon("sign-in"),
      parent,
      { title: "Sign In", command: "affinidi.login" }
    );
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    type: AffinidiVariantTypes,
    affId: string,
    label: string,
    description: string,
    state: TreeItemCollapsibleState,
    icon: ThemeIcon = ThemeIcon.Folder,
    parent?: AffResourceTreeItem,
    command?: Command,
    id?: string
  ) {
    treeNodes.push(
      new AffResourceTreeItem(
        AffinidiVariantTypes[type],
        affId,
        label,
        description,
        state,
        icon,
        parent,
        command
      )
    );
  }
}
