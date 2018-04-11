'use strict';
import * as vscode from 'vscode';

import { AngularDataProvider } from './tree/angularDataProvider';
import { NgObjectTreeItem } from './tree/ngObjectTreeItem';
import { NgFileCollection } from './obj/ngFileCollection';

export function activate(context: vscode.ExtensionContext) {

    const angularDataProvider = new AngularDataProvider();

    vscode.window.registerTreeDataProvider('angularExplorer', angularDataProvider);

    /**
     * Commands
     */
    vscode.commands.registerCommand('angularExplorer.openNgObject', (treeItem: NgObjectTreeItem) => {
        const files = treeItem.ngObject.files;
        if (files) {
            showNgFileCollection(files);
        }
    });

    vscode.commands.registerCommand('angularExplorer.refreshExplorer', () => {
        angularDataProvider.refresh();
    });

    vscode.commands.registerCommand('angularExplorer.openScript', (treeItem: NgObjectTreeItem) => {
        openNgFile(treeItem.ngObject.files.scriptUri, undefined, true);
    });
    vscode.commands.registerCommand('angularExplorer.openTemplate', (treeItem: NgObjectTreeItem) => {
        openNgFile(treeItem.ngObject.files.templateUri, treeItem.ngObject.files.scriptUri, true);
    });
    vscode.commands.registerCommand('angularExplorer.openStyles', (treeItem: NgObjectTreeItem) => {
        openNgFiles(treeItem.ngObject.files.styleUris, treeItem.ngObject.files.scriptUri, true);
    });
    vscode.commands.registerCommand('angularExplorer.openSpec', (treeItem: NgObjectTreeItem) => {
        openNgFile(treeItem.ngObject.files.specUri, undefined, true);
    });

    /**
     * Events
     */


}

function showNgFileCollection(collection: NgFileCollection) {

    const hasTemplate = collection.templateUri !== undefined;

    vscode.window.showTextDocument(collection.scriptUri, {
        viewColumn: hasTemplate ? 1 : -1,
        preserveFocus: false,
        preview: true
    });

    if (collection.templateUri) {
        vscode.window.showTextDocument(collection.templateUri, {
            viewColumn: 2,
            preserveFocus: true,
            preview: true
        });
    }
}

function openNgFile(uri: vscode.Uri | undefined, alt?: vscode.Uri, keep: boolean = false): Promise<undefined> {
    return new Promise((resolve, reject) => {
        if (uri) {
            vscode.window.showTextDocument(uri, {
                preview: !keep,
                viewColumn: vscode.ViewColumn.Active
            }).then(
                value => resolve(),
                reason => {
                    if (alt) {
                        vscode.window.showTextDocument(alt, {
                            preview: !keep,
                            viewColumn: vscode.ViewColumn.Active
                        }).then(
                            value => resolve(),
                            reason => {
                                vscode.window.showErrorMessage(reason);
                                reject();
                            }
                        );
                    }
                }
            );
        } else {
            reject();
        }
    });
}

function openNgFilesRecursively(index: number, uris: vscode.Uri[], alt?: vscode.Uri, keep: boolean = false) {
    openNgFile(uris[index], alt, keep).then(() => {
        if (index < uris.length - 1) {
            openNgFilesRecursively(index + 1, uris, alt, keep);
        }
    });
}

function openNgFiles(uris: vscode.Uri[] | undefined, alt?: vscode.Uri, keep: boolean = false) {
    if (uris && uris.length > 0) {
        openNgFilesRecursively(0, uris, alt, keep);
    } else {
        openNgFile(alt, undefined, keep);
    }
}


export function deactivate() {
}