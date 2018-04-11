import * as vscode from 'vscode';

import { NgObjectType } from './ngObjectType';
import { NgFileCollection } from './ngFileCollection';


export class NgObject {

    private constructor(
        public name: string,
        public type: NgObjectType,
        public scriptDir: vscode.Uri,
        public files: NgFileCollection
    ) {

    }

    public static fromScriptUri(uri: vscode.Uri): Promise<NgObject> {
        return new Promise((resolve, reject) => {
            const uriParts = uri.toString().split('/');
            const scriptFileName = uriParts[uriParts.length - 1];
            const scriptFileNameParts = scriptFileName.split('.');

            const name = scriptFileNameParts.slice(0, scriptFileNameParts.length - 2).join('.');//scriptFileName.slice(0, scriptFileName.length - 3);
            const identifier = scriptFileNameParts[scriptFileNameParts.length - 2];
            const type = NgObjectType.getByIdentifier(identifier);

            if (type) {
                const scriptDir = vscode.Uri.parse(uriParts.slice(0, uriParts.length - 1).join('/'));



                NgFileCollection.create(uri, name, type, scriptDir).then(
                    collection => {
                        resolve(new NgObject(name, type, scriptDir, collection));
                    }
                );

            } else {
                reject('Uri has no valid identifier (' + identifier + ')');
            }

        });
    }
}