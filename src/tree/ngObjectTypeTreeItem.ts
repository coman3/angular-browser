import * as vscode from 'vscode';

import { NgTreeItem } from './ngTreeItem';
import { NgObjectType } from '../obj/ngObjectType';


export class NgObjectTypeTreeItem extends NgTreeItem {

    public static scanningTreeItem = new NgObjectTypeTreeItem(new NgObjectType('', 'Scanning...', []));
    public static noFilesTreeItem = new NgObjectTypeTreeItem(new NgObjectType('', 'No Angular files found', []));

    private count = 0;


    constructor(
        public readonly type: NgObjectType
    ) {
        super(type.label, vscode.TreeItemCollapsibleState.None);
    }

    setLabelInfo(info: string) {
        this.label = this.type.label + ' (' + info + ')';
    }

    increaseObjectCount() {
        this.count++;
        this.setLabelInfo('' + this.count);

        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        }
    }
}