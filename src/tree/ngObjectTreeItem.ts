import * as vscode from 'vscode';

import { NgTreeItem } from './ngTreeItem';
import { NgObject } from '../obj/ngObject';


export class NgObjectTreeItem extends NgTreeItem {

    constructor(
        public ngObject: NgObject
    ) {
        super(ngObject.name, vscode.TreeItemCollapsibleState.None);

        this.resourceUri = ngObject.files.scriptUri;
        this.command = {
            command: 'angularExplorer.openNgObject',
            title: '',
            arguments: [this]
        };
        this.contextValue = 'ngObject.' + ngObject.type.identifier;

        const iconsConfig = vscode.workspace.getConfiguration('angularExplorer').get('icons');

        if (iconsConfig === 'inbuilt') {
            if (ngObject.name.slice(0, 3) === 'app') {
                this.iconPath = {
                    light: __filename + '/../../../img/ic_' + ngObject.type.identifier + '_app.svg',
                    dark: __filename + '/../../../img/ic_' + ngObject.type.identifier + '_app.svg',
                };

            } else {
                this.iconPath = {
                    light: __filename + '/../../../img/ic_' + ngObject.type.identifier + '.svg',
                    dark: __filename + '/../../../img/ic_' + ngObject.type.identifier + '.svg'
                };
            }
        } else if (iconsConfig === 'none') {
            this.iconPath = {
                light: '',
                dark: ''
            };
        }



        this.info = ngObject.files.decorator;
    }

    getNgObjectFullName(): string {
        return this.ngObject.name + '.' + this.ngObject.type.identifier;
    }

    getFile(fileType: string): Promise<vscode.Uri> {
        return new Promise((resolve, reject) => {
            vscode.workspace.findFiles('**/' + this.ngObject.name + '.' + this.ngObject.type.identifier + '.' + fileType).then(
                value => resolve(value[0]),
                reason => reject(reason)
            );
        });
    }

}