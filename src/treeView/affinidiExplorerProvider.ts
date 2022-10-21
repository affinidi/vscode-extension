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
  IssuanceEntity,
  IssuanceList,
} from "../services/issuancesService";
import {
  getProjects,
  getProjectSummary,
  ProjectList,
  ProjectSummary,
} from "../services/iamService";
import {
  getPublicSchemas,
  getSchema,
  SchemaEntity,
} from "../services/schemaManagerService";
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
  issuancesSummary: IssuanceEntity[] = [];
  schemasSummary: SchemaEntity[] = [];

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
      this.addNewTreeItem(treeNodes, {
        type: AffinidiVariantTypes.project,
        metadata: project.projectId,
        label: project.name,
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon("project"),
        parent,
      });

      const projectSummary = await getProjectSummary(project.projectId);
      this.projectsSummary.push(projectSummary);
    });
  }

  private async _addProductItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rootDID,
      label: "Digital Identities",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("lock"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rootIssuance,
      label: "Issuances",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("output"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rootSchemas,
      label: "VC Schemas",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("bracket"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rootRules,
      label: "Rules",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rootAnalytics,
      label: "Analytics",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("graph"),
      parent,
    });
  }

  private async _addDIDItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const projectInfo = this.projectsSummary.find(
      (projectSummary) =>
        projectSummary.project.projectId === parent?.parent?.metadata
    );

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.did,
      metadata: projectInfo?.wallet.didUrl,
      label: projectInfo?.wallet.did || "",
      icon: new ThemeIcon("lock"),
      parent,
    });
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const res = await getPublicSchemas();

    res.schemas.map(async (schema) => {
      this.addNewTreeItem(treeNodes, {
        type: AffinidiVariantTypes.schema,
        label: schema.type,
        description: schema.type,
        metadata: schema,
        icon: new ThemeIcon("bracket"),
        parent,
      });

      this.schemasSummary.push(schema);
    });
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

      issuanceListResponse.issuances.map((issuance) => {
        this.addNewTreeItem(treeNodes, {
          type: AffinidiVariantTypes.issuance,
          label: issuance.id,
          metadata: issuance.id,
          icon: new ThemeIcon("output"),
          parent,
        });
        this.issuancesSummary.push(issuance);
      });
    }
  }

  private async _addRuleItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rule,
      metadata: "aff:default:rule:21835",
      label: "Education match",
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rule,
      metadata: "aff:default:rule:54835",
      label: "Health skills check",
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rule,
      metadata: "aff:default:rule:19805",
      label: "License compliance",
      description: "MOCKED",
      icon: new ThemeIcon("server-process"),
      parent,
    });

    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.rule,
      metadata: "aff:default:rule:74802",
      label: "Email validator",
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
      type: AffinidiVariantTypes.empty,
      label: "(empty)",
      icon: new ThemeIcon("dash"),
      parent,
    });
  }

  private async _addLoginItem(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: AffinidiVariantTypes.login,
      label: "Sign in to Affinidi",
      icon: new ThemeIcon("sign-in"),
      parent,
      command: { title: "Sign In", command: "affinidi.login" },
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
      type: AffinidiVariantTypes;
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
        resourceType: AffinidiVariantTypes[type],
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
