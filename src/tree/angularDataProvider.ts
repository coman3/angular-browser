import * as vscode from 'vscode';

import { NgTreeItem } from './ngTreeItem';
import { NgObjectTreeItem } from './ngObjectTreeItem';
import { NgObjectTypeTreeItem } from './ngObjectTypeTreeItem';
import { NgObjectType } from '../obj/ngObjectType';
import { NgObject } from '../obj/ngObject';
import { Util } from '../util';


export class AngularDataProvider implements vscode.TreeDataProvider<NgTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NgTreeItem | undefined> = new vscode.EventEmitter<NgTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<NgTreeItem | undefined> = this._onDidChangeTreeData.event;

    private ngObjectTypeTreeItems = new Map<NgObjectType, NgObjectTypeTreeItem>();
    private ngObjectTreeItems = new Map<NgObjectType, NgObjectTreeItem[]>();

    private lastCollapsibleStates = new Map<NgObjectType, vscode.TreeItemCollapsibleState>();


    constructor() {
        this.refresh();

        /*
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            this.loadTreeItems();
            this._onDidChangeTreeData.fire();
        });*/



        vscode.workspace.onDidChangeConfiguration(e => {
            this.refresh();
        });
    }

    public refresh() {
        this.loadTreeItems();
    }


    getTreeItem(treeItem: NgTreeItem): vscode.TreeItem | Promise<vscode.TreeItem> {
        return treeItem;
    }

    getChildren(treeItem?: NgTreeItem): Promise<NgTreeItem[]> {
        return new Promise(resolve => {
            if (treeItem) /* if not in root */ {
                if (treeItem instanceof NgObjectTypeTreeItem && treeItem.type) {
                    const items = this.ngObjectTreeItems.get(treeItem.type);
                    if (items) {
                        items.sort((a, b) => {
                            return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
                        });
                    }
                    resolve(items);
                }
            } else /* if in root (-> ObjectTypes) */ {
                const items = Array.from(this.ngObjectTypeTreeItems.values()).sort((a, b) => {
                    return b.type.priority - a.type.priority;
                });
                /*items.forEach(item => {
                    const lastState = this.lastCollapsibleStates.get(item.type);
                    if (lastState) {
                        item.collapsibleState = lastState;
                        console.log('last state of ' + item.type.label + ' was ' + lastState);

                    }
                });*/
                if (!items.length) {
                    items.push(NgObjectTypeTreeItem.noFilesTreeItem);
                }
                //console.log('-> Show Children (' + (new Date().getTime() - Util.startTime) + 'ms)');
                resolve(items);
            }
        });
    }


    private loadTreeItems() {
        for (let type of NgObjectType.types) {
            this.loadNgObjectTreeItemsByType(type);
        }
    }

    private loadNgObjectTreeItemsByType(type: NgObjectType) {
        this.ngObjectTypeTreeItems.clear();
        this.setScanningEnabled(true);

        //console.log('-> Start Script Search (' + (new Date().getTime() - Util.startTime) + 'ms)');

        Util.findFiles('/*.' + type.identifier + '.ts').then(uris => {
            this.ngObjectTreeItems.set(type, []);

            //console.log('-> Start Object Initialization (' + (new Date().getTime() - Util.startTime) + 'ms)');


            if (!uris.length) {
                this._onDidChangeTreeData.fire();
                return;
            }

            let promises: Promise<any>[] = [];

            for (let uri of uris) {
                promises.push(this.getNgObjectTreeItem(uri).then(
                    treeItem => {
                        const treeItems = this.ngObjectTreeItems.get(type);
                        if (treeItems) {
                            treeItems.push(treeItem);

                            if (!this.ngObjectTypeTreeItems.has(type)) {
                                this.ngObjectTypeTreeItems.set(type, new NgObjectTypeTreeItem(type));
                            }

                            const ngObjectTypeTreeItem = this.ngObjectTypeTreeItems.get(type);
                            if (ngObjectTypeTreeItem) {
                                ngObjectTypeTreeItem.increaseObjectCount();
                            }

                            this.ngObjectTypeTreeItems.forEach((val, key) => {
                                this.lastCollapsibleStates.set(key, val.collapsibleState);
                            });
                            //this._onDidChangeTreeData.fire();
                        }
                    },
                    reason => console.log(reason)
                ).catch(reason => { }));
            }

            Promise.all(promises).then(
                value => {
                    this.setScanningEnabled(false);
                    // console.log('-> Finished Object Initialization of ' + type.label + ' (' + (new Date().getTime() - Util.startTime) + 'ms)');
                }
            );
        }).catch(
            reason => {
                this.setScanningEnabled(false);
            }
        );
    }

    private setScanningEnabled(enabled: boolean) {
        if (enabled) {
            this.ngObjectTypeTreeItems.set(NgObjectTypeTreeItem.scanningTreeItem.type, NgObjectTypeTreeItem.scanningTreeItem);
        } else {
            this.ngObjectTypeTreeItems.delete(NgObjectTypeTreeItem.scanningTreeItem.type);
        }
        this._onDidChangeTreeData.fire();
    }


    private getNgObjectTreeItem(scriptUri: vscode.Uri): Promise<NgObjectTreeItem> {
        return new Promise((resolve, reject) => {
            NgObject.fromScriptUri(scriptUri).then(
                ngObject => resolve(new NgObjectTreeItem(ngObject)),
                reason => reject(reason)
            );
        });
    }
}