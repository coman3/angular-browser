import * as vscode from 'vscode';

export class Util {

    static startTime = new Date().getTime();

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
            // const startTime = new Date().getTime();

            const searchPaths: string[] | undefined = vscode.workspace.getConfiguration('angularExplorer').get('searchLocations');

            let thenables: Thenable<any>[] = [];
            let files: vscode.Uri[] = [];

            if (searchPaths && vscode.workspace.workspaceFolders) {
                for (let searchPath of searchPaths) {

                    const pattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + searchPath, '**' + glob);

                    thenables.push(vscode.workspace.findFiles(pattern).then(
                        uris => {
                            files.push(...uris);
                        },
                        reason => console.log(reason)
                    ));
                }
            }

            Promise.all(thenables).then(
                () => {
                    resolve(files);

                    // const endTime = new Date().getTime();
                    // console.log('-> search finished (' + glob + '), found ' + files.length + ' files, needed ' + ((endTime - startTime) / 1000) + 's');
                },
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