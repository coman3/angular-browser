import * as vscode from 'vscode';

import { Util } from '../util';
import { NgObjectType } from './ngObjectType';
import { NgFileType } from './ngFileType';


export class NgFileCollection {

    //public ngObject?: NgObject;

    public templateUri?: vscode.Uri;
    public styleUris?: vscode.Uri[];
    public specUri?: vscode.Uri;

    public decorator?: string;

    private constructor(
        public scriptUri: vscode.Uri
    ) {

    }


    public static create(scriptUri: vscode.Uri, name: string, type: NgObjectType, scriptDir: vscode.Uri): Promise<NgFileCollection> {
        return new Promise((resolve, reject) => {
            const collection = new NgFileCollection(scriptUri);

            let promises: Thenable<any>[] = [];


            // Get Decorator
            promises.push(vscode.workspace.openTextDocument(scriptUri).then(doc => {
                const matchDecorator = doc.getText().match(/@(.*?)\s*?\([\s\n]*([^]*?)[\s\n]*?\)/);

                if (matchDecorator) {
                    collection.decorator = matchDecorator[0];
                    const decoratorContent = matchDecorator[2];

                    if (decoratorContent) {
                        // Get Template
                        if (type.has(NgFileType.Template)) {
                            promises.push(this.getTemplateFile(decoratorContent, scriptDir)
                                .then(uri => collection.templateUri = uri)
                                .catch(reason => console.log(name + ': No Template File found')));
                        }
                        // Get Styles
                        if (type.has(NgFileType.Style)) {
                            promises.push(this.getStyleFiles(decoratorContent, scriptDir)
                                .then(uri => collection.styleUris = uri)
                                .catch(reason => console.log(name + ': No Style Files found')));
                        }
                    }
                }
            }));


            // Find Spec File
            if (type.has(NgFileType.Spec)) {
                promises.push(this.getSpecFile(name, type.identifier, scriptDir)
                    .then(uri => collection.specUri = uri)
                    .catch(reason => console.log(name + ': No Spec File found')));
            }

            Promise.all(promises).then(
                values => resolve(collection),
                reason => reject(reason)
            );

        });
    }


    private static getSpecFile(name: string, identifier: string, scriptDir: vscode.Uri): Promise<vscode.Uri> {
        return new Promise<vscode.Uri>((resolve, reject) => {
            const fileName = name + '.' + identifier + '.spec.ts';
            vscode.workspace.openTextDocument(vscode.Uri.parse(scriptDir.toString() + '/' + fileName)).then(
                doc => resolve(doc.uri),
                reason => {
                    Util.findFile(fileName).then(
                        uri => resolve(uri),
                        reason => reject(reason)
                    );
                }
            );
        });
    }

    private static getTemplateFile(decoraterContent: string, scriptDir: vscode.Uri): Promise<vscode.Uri> {
        return new Promise<vscode.Uri>((resolve, reject) => {
            let matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?'(.*?)'/);

            if (!matchTemplateUrl) {
                matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?"(.*?)"/);
                if (!matchTemplateUrl) {
                    reject('Template not found'); return;
                }
            }

            const templateUrl = matchTemplateUrl[1];

            if (!templateUrl) {
                reject('Template Url not valid'); return;
            }

            resolve(vscode.Uri.parse(Util.getAbsolutePath(scriptDir.toString(), templateUrl)));
        });
    }

    private static getStyleFiles(decoraterContent: string, scriptDir: vscode.Uri): Promise<vscode.Uri[]> {
        return new Promise<vscode.Uri[]>((resolve, reject) => {
            const matchStyleList = decoraterContent.match(/styleUrls:\s*?\[([^]*?)\]/);

            if (!matchStyleList) {
                reject('No styleList found'); return;
            }

            let styleUris: vscode.Uri[] = [];
            let stylePaths = matchStyleList[1].replace(/'/g, '').replace(/"/g, '').split(',');
            for (let i = 0; i < stylePaths.length; i++) {
                stylePaths[i] = stylePaths[i].trim();

                styleUris.push(vscode.Uri.parse(Util.getAbsolutePath(scriptDir.toString(), stylePaths[i])));
            }

            resolve(styleUris);
        });
    }
}