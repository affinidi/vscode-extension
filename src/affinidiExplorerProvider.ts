import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import { getProjectIssuances, IssuanceList } from "./services/issuancesService";
import { AffinidiVariantTypes } from "./treeView/affinidiVariant";
import AffResourceTreeItem from "./treeView/treeItem";

export class AffinidiExplorerProvider
  implements vscode.TreeDataProvider<AffResourceTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AffResourceTreeItem | undefined | void
  > = new vscode.EventEmitter<AffResourceTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AffResourceTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

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
        await this._addProductItems(treeNodes);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootDID]:
        await this._addDIDItems(treeNodes);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootSchemas]:
        await this._addSchemaItems(treeNodes);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootIssuance]:
        await this._addIssuanceItems(treeNodes);
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootRules]:
        await this._addRuleItems(treeNodes);
        break;

      default:
        await this._addEmptyItem(treeNodes);
        break;
    }

    return Promise.resolve(treeNodes);
  }

  private async _addProjectItems(
    treeNodes: AffResourceTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.project,
      "aff:default:project:2854793",
      "My Awesome Project",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("project")
    );
  }

  private async _addProductItems(
    treeNodes: AffResourceTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootDID,
      "",
      "Digital Identities",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("lock")
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootIssuance,
      "",
      "Issuances",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("output")
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootSchemas,
      "",
      "VC Schemas",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("bracket")
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootRules,
      "",
      "Rules",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("server-process")
    );
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rootAnalytics,
      "",
      "Analytics",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("graph")
    );
  }

  private async _addDIDItems(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.schema,
      "aff:default:did:123456",
      "did:elem:EiA1niEsAUc3hq6ks5yK39oU2OM5u8ZZ01pky7xUwyc0Yw",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("lock")
    );
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.schema,
      "aff:default:schema:34232",
      "Education",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("bracket")
    );
  }

  private async _addIssuanceItems(
    treeNodes: AffResourceTreeItem[]
  ): Promise<void> {
    const issuanceListResponse: IssuanceList = await getProjectIssuances({
      apiKeyHash:
        "9b61dfbea987ec4004698ca8424640917a7196805a56edca39fbc330bb575050",
      projectId: "46280878-142a-410b-96de-b9c0b6d36440",
    });

    issuanceListResponse.issuances.map((issuance) =>
      this.addNewTreeItem(
        treeNodes,
        AffinidiVariantTypes.issuance,
        issuance.id,
        issuance.id,
        "",
        vscode.TreeItemCollapsibleState.None,
        new ThemeIcon("output")
      )
    );
  }

  private async _addRuleItems(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:21835",
      "Education match",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process")
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:54835",
      "Health skills check",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process")
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:19805",
      "License compliance",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process")
    );

    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.rule,
      "aff:default:rule:74802",
      "Email validator",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("server-process")
    );
  }

  private async _addEmptyItem(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.empty,
      "",
      "(empty)",
      "",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("dash")
    );
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    type: AffinidiVariantTypes,
    affId: string,
    label: string,
    description: string,
    state: vscode.TreeItemCollapsibleState,
    icon: ThemeIcon = ThemeIcon.Folder
  ) {
    treeNodes.push(
      new AffResourceTreeItem(
        AffinidiVariantTypes[type],
        affId,
        label,
        description,
        state,
        icon
      )
    );
  }
}
