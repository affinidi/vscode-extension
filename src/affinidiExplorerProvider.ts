import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import { getProjectIssuances, IssuanceList } from "./services/issuancesService";
import {
  AffinidiVariant,
  AffinidiVariantTypes,
} from "./treeView/affinidiVariant";
import AffResourceTreeItem from "./treeView/treeItem";

export class AffinidiExplorerProvider
  implements
    vscode.TreeDataProvider<AffResourceTreeItem>,
    vscode.TreeDragAndDropController<AffResourceTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AffResourceTreeItem | undefined | void
  > = new vscode.EventEmitter<AffResourceTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AffResourceTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  public dropMimeTypes = ["application/vnd.code.tree.affTreeViewDragDrop"];
  public dragMimeTypes = ["text/uri-list"];

  private rawResources: AffinidiVariant[] = [];

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
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.project,
            "aff:default:project:2854793",
            "My Awesome Project",
            "",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon("project")
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.project]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rootDID,
            "",
            "Digital Identities",
            "",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon("lock")
          ),
            this.addNewTreeItem(
              treeNodes,
              AffinidiVariantTypes.rootIssuance,
              "",
              "Issuances",
              "",
              vscode.TreeItemCollapsibleState.Collapsed,
              false,
              new ThemeIcon("output")
            ),
            this.addNewTreeItem(
              treeNodes,
              AffinidiVariantTypes.rootSchemas,
              "",
              "VC Schemas",
              "",
              vscode.TreeItemCollapsibleState.Collapsed,
              false,
              new ThemeIcon("bracket")
            ),
            this.addNewTreeItem(
              treeNodes,
              AffinidiVariantTypes.rootRules,
              "",
              "Rules",
              "",
              vscode.TreeItemCollapsibleState.Collapsed,
              false,
              new ThemeIcon("server-process")
            ),
            this.addNewTreeItem(
              treeNodes,
              AffinidiVariantTypes.rootAnalytics,
              "",
              "Analytics",
              "",
              vscode.TreeItemCollapsibleState.Collapsed,
              false,
              new ThemeIcon("graph")
            );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootDID]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.schema,
            "aff:default:did:123456",
            "did:elem:EiA1niEsAUc3hq6ks5yK39oU2OM5u8ZZ01pky7xUwyc0Yw",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("lock")
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootSchemas]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.schema,
            "aff:default:schema:34232",
            "Education",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("bracket")
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootIssuance]:
        await this._getIssuanceItems(treeNodes);

        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootRules]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:21835",
            "Education match",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("server-process")
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:54835",
            "Health skills check",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("server-process")
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:19805",
            "License compliance",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("server-process")
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:74802",
            "Email validator",
            "MOCKED",
            vscode.TreeItemCollapsibleState.None,
            true,
            new ThemeIcon("server-process")
          );
        }
        break;

      default:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.empty,
            "",
            "(empty)",
            "",
            vscode.TreeItemCollapsibleState.None,
            false,
            new ThemeIcon("dash")
          );
        }
        break;
    }

    return Promise.resolve(treeNodes);

    /*
    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
        )
      );
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
    */
  }

  private async _getIssuanceItems(
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
        true,
        new ThemeIcon("output")
      )
    );
  }

  public async handleDrag(
    source: AffResourceTreeItem[],
    treeDataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    treeDataTransfer.set(
      "application/vnd.code.tree.affTreeViewDragDrop",
      new vscode.DataTransferItem(this.getAppropriateDragObject(source[0]))
    );
  }

  private getAppropriateDragObject(
    source: AffResourceTreeItem
  ): AffinidiVariant | undefined {
    return this.rawResources.find(
      (item) => item.affId === source.metadata.affId
    );
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    type: AffinidiVariantTypes,
    affId: string,
    label: string,
    description: string,
    state: vscode.TreeItemCollapsibleState,
    canDrag: boolean,
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

    if (canDrag) {
      this.rawResources.push({
        affId: affId,
        type: type,
        data: {},
      });
    }
  }
}
