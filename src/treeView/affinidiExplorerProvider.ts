import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import {
  getProjectIssuances,
  IssuanceList,
} from "../services/issuancesService";
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
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.project,
      "aff:default:project:2854793",
      "My Awesome Project",
      "",
      vscode.TreeItemCollapsibleState.Collapsed,
      new ThemeIcon("project"),
      parent
    );
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
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.schema,
      "aff:default:did:123456",
      "did:elem:EiA1niEsAUc3hq6ks5yK39oU2OM5u8ZZ01pky7xUwyc0Yw",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("lock"),
      parent
    );
  }

  private async _addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
  ): Promise<void> {
    this.addNewTreeItem(
      treeNodes,
      AffinidiVariantTypes.schema,
      "aff:default:schema:34232",
      "Education",
      "MOCKED",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("bracket"),
      parent
    );
  }

  private async _addIssuanceItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem
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
        new ThemeIcon("output"),
        parent
      )
    );
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
