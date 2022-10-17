import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import { AffinidiVariant, AffinidiVariantTypes } from "./affinidiVariant";

export class AffinidiExplorerProvider
  implements
    vscode.TreeDataProvider<AffResourceTreeItem>,
    vscode.TreeDragAndDropController<AffResourceTreeItem>
{
  public dropMimeTypes = ["application/vnd.code.tree.affTreeViewDragDrop"];
  public dragMimeTypes = ["text/uri-list"];

  private rawResources: AffinidiVariant[] = [];

  constructor() {}

  public getTreeItem(element: AffResourceTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(
    element?: AffResourceTreeItem
  ): Thenable<AffResourceTreeItem[]> {
    const treeNodes: AffResourceTreeItem[] = [];

    switch (element?.resourceType) {
      // case undefined:
      //   {
      //     this.addNewTreeItem(
      //       treeNodes,
      //       AffinidiVariantTypes.rootProjects,
      //       "",
      //       "Projects",
      //       "Affinidi projects",
      //       vscode.TreeItemCollapsibleState.Expanded,
      //       false,
      //       undefined
      //     );
      //   }
      //   break;

      case undefined:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.project,
            "aff:default:project:2854793",
            "<default>",
            "Default project",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon('project')
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.project,
            "aff:default:project:14334",
            "My Project",
            "Special project for customer test",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon('project')
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.project]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rootRules,
            "",
            "Rules",
            "Defined rules and rule sets",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon('server-process')
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rootSchemas,
            "",
            "Schemas",
            "VC Schemas",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon('bracket')
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rootAnalytics,
            "",
            "Analytics",
            "Data analytics",
            vscode.TreeItemCollapsibleState.Collapsed,
            false,
            new ThemeIcon('graph')
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
            "Defines education",
            vscode.TreeItemCollapsibleState.None,
            true
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rootRules]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:21835",
            "Education match",
            "Checks education for validity",
            vscode.TreeItemCollapsibleState.Collapsed,
            true
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:54835",
            "Health skills check",
            "Set of rules for hospital",
            vscode.TreeItemCollapsibleState.Collapsed,
            true
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:19805",
            "License compliance",
            "Validation of driver license",
            vscode.TreeItemCollapsibleState.Collapsed,
            true
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.rule,
            "aff:default:rule:74802",
            "Email validator",
            "Email is valid check",
            vscode.TreeItemCollapsibleState.Collapsed,
            true
          );
        }
        break;

      case AffinidiVariantTypes[AffinidiVariantTypes.rule]:
        {
          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.ruleData,
            "",
            "Id " + "aff:default:rule:19805",
            "",
            vscode.TreeItemCollapsibleState.None,
            false
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.ruleData,
            "",
            "Valid from: 31/10/2001",
            "",
            vscode.TreeItemCollapsibleState.None,
            false
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.ruleData,
            "",
            "Valid to: 31/10/2024",
            "",
            vscode.TreeItemCollapsibleState.None,
            false
          );

          this.addNewTreeItem(
            treeNodes,
            AffinidiVariantTypes.ruleData,
            "",
            "Created by: Adam Larter",
            "",
            vscode.TreeItemCollapsibleState.None,
            false
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
            false
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

  refresh(): void {
    console.log("Refreshing explorer");
    //this._onDidChangeTreeData.fire();
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

class AffResourceTreeItem extends vscode.TreeItem {
  constructor(
    public readonly resourceType: string,
    public readonly metadata: any,
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly icon: ThemeIcon
  ) {
    super(label, collapsibleState);
    this.resourceType = resourceType;
    this.tooltip = `${this.label}`;
    this.description = this.description;
    this.metadata = metadata;
    this.iconPath = icon;
    this.contextValue = resourceType;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    AffResourceTreeItem | undefined | null | void
  > = new vscode.EventEmitter<AffResourceTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AffResourceTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;
}
