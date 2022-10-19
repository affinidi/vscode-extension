import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
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
import {
  getPublicSchemas,
} from "../services/schemaManagerService";
import { AffinidiVariantTypes } from "./affinidiVariant";
import AffResourceTreeItem from "./treeItem";

export class AffinidiExplorerProvider
  implements vscode.TreeDataProvider<AffResourceTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AffResourceTreeItem | undefined | void
  > = new vscode.EventEmitter<AffResourceTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AffResourceTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  projectsSummary: ProjectSummary[] = [];

  constructor() {}

  refresh(): void {
    console.log("Refreshing explorer");
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: AffResourceTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(
    element?: AffResourceTreeItem
  ): Promise<AffResourceTreeItem[]> {
    const treeNodes: AffResourceTreeItem[] = [];

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
        vscode.TreeItemCollapsibleState.Collapsed,
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
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("lock"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootIssuance,
      "",
      "Issuances",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("output"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootSchemas,
      "",
      "VC Schemas",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("bracket"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootRules,
      "",
      "Rules",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("server-process"),
      parent
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootAnalytics,
      "",
      "Analytics",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
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
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("lock"),
      parent
    );
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    const res = await getPublicSchemas();

    res.schemas.map(schema => this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootSchemas,
      schema.type,
      schema.description,
      '',
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("bracket"),
      parent
    ));
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
          vscode.TreeItemCollapsibleState.None,
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
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:54835",
      "Health skills check",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:19805",
      "License compliance",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process"),
      parent
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:74802",
      "Email validator",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
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
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("dash"),
      parent
    );
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    type: AffinidiVariantTypes,
    affId: string,
    label: string,
    description: string,
    state: vscode.TreeItemCollapsibleState,
    icon: ThemeIcon = ThemeIcon.Folder,
    parent?: AffResourceTreeItem
  ) {
    treeNodes.push(
      new AffResourceTreeItem(
        AffinidiVariantTypes[type],
        affId,
        label,
        description,
        state,
        icon,
        parent
      )
    );
  }
}
