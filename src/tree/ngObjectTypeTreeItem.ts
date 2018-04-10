import * as vscode from 'vscode';

import { NgTreeItem } from './ngTreeItem';
import { NgObjectType } from '../obj/ngObjectType';


export class NgObjectTypeTreeItem extends NgTreeItem {

    public static loadingTreeItem = new NgObjectTypeTreeItem(new NgObjectType('', 'Scanning...', []));
    public static noFilesTreeItem = new NgObjectTypeTreeItem(new NgObjectType('', 'No Angular files found', []));

    private count = 0;

    constructor(
        public readonly type: NgObjectType
    ) {
        super(type.label, vscode.TreeItemCollapsibleState.None);
    }

    setObjectCount(count: number) {
        this.count = count;
        this.label = this.type.label + ' (' + count + ')';
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    increaseObjectCount() {
        this.setObjectCount(this.count + 1);
    }
}