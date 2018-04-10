import * as vscode from 'vscode';

export class Util {

    public static findFile(glob: string): Promise<vscode.Uri> {
        return new Promise((resolve, reject) => {
            const searchPaths: string[] | undefined = vscode.workspace.getConfiguration('angularExplorer').get('searchLocations');

            if (searchPaths) {
                for (let searchPath of searchPaths) {
                    vscode.workspace.findFiles(searchPath + '/**' + glob).then(
                        value => resolve(value[0]),
                        reason => reject(reason)
                    );
                }
            }

        });
    }

    public static findFiles(glob: string): Promise<vscode.Uri[]> {
        return new Promise((resolve, reject) => {
            const searchPaths: string[] | undefined = vscode.workspace.getConfiguration('angularExplorer').get('searchLocations');


            let thenables: Thenable<any>[] = [];
            let files: vscode.Uri[] = [];

            if (searchPaths) {
                for (let searchPath of searchPaths) {
                    thenables.push(vscode.workspace.findFiles(searchPath + '/**' + glob).then(
                        uris => {
                            files.push(...uris);
                        },
                        reason => console.log(reason)
                    ));
                }
            }

            Promise.all(thenables).then(
                () => resolve(files),
                reason => reject(reason)
            );
        });
    }

    public static getAbsolutePath(base: string, relative: string): string {
        let stack = base.split("/");
        let parts = relative.split("/");

        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === ".") {
                continue;
            }
            if (parts[i] === "..") {
                stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        return stack.join("/");
    }

}