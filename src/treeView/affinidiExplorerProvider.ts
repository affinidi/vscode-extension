import {
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  Command,
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  l10n,
} from "vscode";
import {
  getProjectIssuances,
  IssuanceList,
} from "../services/issuancesService";
import {
  iamService,
  ProjectList,
  ProjectSummary,
} from "../services/iamService";
import {
  getMySchemas,
  SchemaSearchScope,
} from "../services/schemaManagerService";
import { ExplorerResourceTypes } from "./treeTypes";
import { AffResourceTreeItem } from "./treeItem";
import { ext } from "../extensionVariables";
import { formatIssuanceName } from "../shared/formatIssuanceName";

const isSignedIn = async () => {
  const sessions = await ext.authProvider.getSessions([]);
  return !!sessions.length;
};

const { getProjects, getProjectSummary } = iamService;

export class AffinidiExplorerProvider
  implements TreeDataProvider<AffResourceTreeItem>
{
  private _onDidChangeTreeData: EventEmitter<
    AffResourceTreeItem | undefined | void
  > = new EventEmitter<AffResourceTreeItem | undefined | void>();
  readonly onDidChangeTreeData: Event<AffResourceTreeItem | undefined | void> =
    this._onDidChangeTreeData.event;

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
    const signedIn = await isSignedIn();

    if (!signedIn) {
      await this._addLoginItem(treeNodes);
      await this._addSignupItem(treeNodes);

      return Promise.resolve(treeNodes);
    }

    switch (element?.resourceType) {
      case undefined:
        await this._addProjectItems(treeNodes);
        await this._addCreateProjectItem(treeNodes);
        break;

      case ExplorerResourceTypes[ExplorerResourceTypes.project]:
        await this._addProductItems(treeNodes, element);
        break;

      case ExplorerResourceTypes[ExplorerResourceTypes.rootDID]:
        await this._addDIDItems(treeNodes, element);
        break;

      case ExplorerResourceTypes[ExplorerResourceTypes.rootSchemas]:
        await this._addSubRootSchemaItems(treeNodes, element);
        break;

      case ExplorerResourceTypes[ExplorerResourceTypes.subRootSchemas]:
        await this._addSchemaItems(treeNodes, element);
        break;

      case ExplorerResourceTypes[ExplorerResourceTypes.rootIssuance]:
        await this._addIssuanceItems(treeNodes, element);
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

    // sort projects array in descending order on createdAt field
    const sortedProjects = projectListResponse.projects.sort(
      (projectA, projectB) =>
        Date.parse(projectB.createdAt) - Date.parse(projectA.createdAt)
    );

    for (const project of sortedProjects) {
      const projectSummary = await getProjectSummary(project.projectId);

      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.project,
        metadata: projectSummary,
        label: project.name,
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon("project"),
        parent,
      });
    }
  }

  private async _addProductItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootDID,
      label: l10n.t("Digital Identities"),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("lock"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootIssuance,
      label: l10n.t("Issuances"),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("output"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootSchemas,
      label: l10n.t("VC Schemas"),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("bracket"),
      parent,
    });
  }

  private async _addDIDItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo: ProjectSummary = parent?.parent?.metadata;

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.did,
      metadata: projectInfo.wallet,
      label: projectInfo.wallet.did,
      icon: new ThemeIcon("lock"),
      parent,
    });
  }

  private _addSubRootSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ) {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t("Public"),
      metadata: {
        scope: "public" as SchemaSearchScope,
      },
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("bracket"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t("Unlisted"),
      metadata: {
        scope: "unlisted" as SchemaSearchScope,
      },
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("bracket"),
      parent,
    });
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo: ProjectSummary = parent?.parent?.parent?.metadata;

    const res = await getMySchemas({
      did: projectInfo.wallet.did,
      scope: parent?.metadata?.scope,
      apiKeyHash: projectInfo.apiKey.apiKeyHash,
    });

    res.schemas.map((schema) => {
      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.schema,
        label: `${schema.type}V${schema.version}-${schema.revision}`,
        description: schema.description || "",
        metadata: {
          projectId: projectInfo.project.projectId,
          ...schema,
        },
        icon: new ThemeIcon("bracket"),
        parent,
        command: {
          title: l10n.t("Open schema details"),
          command: "schema.showSchemaDetails",
        },
      });
    });
  }

  private async _addIssuanceItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo: ProjectSummary = parent?.parent?.metadata;

    const issuanceListResponse: IssuanceList = await getProjectIssuances({
      apiKeyHash: projectInfo.apiKey.apiKeyHash,
      projectId: projectInfo.project.projectId,
    });

    issuanceListResponse.issuances.map((issuance) => {
      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.issuance,
        metadata: issuance,
        label: formatIssuanceName(issuance),
        description: issuance.id,
        icon: new ThemeIcon("output"),
        parent,
      });
    });
  }

  private async _addRuleItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rule,
      metadata: "aff:default:rule:21835",
      label: l10n.t("Education match"),
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rule,
      metadata: "aff:default:rule:54835",
      label: l10n.t("Health skills check"),
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rule,
      metadata: "aff:default:rule:19805",
      label: l10n.t("License compliance"),
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rule,
      metadata: "aff:default:rule:74802",
      label: l10n.t("Email validator"),
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });
  }

  private async _addEmptyItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.empty,
      label: l10n.t("(empty)"),
      icon: new ThemeIcon("dash"),
      parent,
    });
  }

  private async _addSignupItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.signup,
      label: l10n.t("Create an Account with Affinidi"),
      icon: new ThemeIcon("sign-in"),
      parent,
      command: {
        title: l10n.t("Create an Account"),
        command: "affinidi.signUp",
      },
    });
  }

  private async _addLoginItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.login,
      label: l10n.t("Sign in to Affinidi"),
      icon: new ThemeIcon("sign-in"),
      parent,
      command: { title: l10n.t("Sign In"), command: "affinidi.login" },
    });
  }

  private async _addCreateProjectItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.project,
      label: l10n.t("Create Project"),
      icon: new ThemeIcon("file-directory-create"),
      parent,
      command: {
        title: l10n.t("Create Project"),
        command: "affinidi.createProject",
      },
    });
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    {
      type,
      metadata,
      label,
      description,
      state = TreeItemCollapsibleState.None,
      icon = ThemeIcon.Folder,
      command,
      parent,
    }: {
      type: ExplorerResourceTypes;
      metadata?: any;
      label: string;
      description?: string;
      state?: TreeItemCollapsibleState;
      icon: ThemeIcon;
      parent?: AffResourceTreeItem;
      command?: Command;
    }
  ) {
    treeNodes.push(
      new AffResourceTreeItem({
        resourceType: ExplorerResourceTypes[type],
        metadata,
        label,
        description,
        collapsibleState: state,
        icon,
        parent,
        command,
      })
    );
  }
}
