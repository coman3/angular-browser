import { NgFileType } from './ngFileType';


export class NgObjectType {

    public static readonly types = [
        new NgObjectType('component', 'Components', [NgFileType.Script, NgFileType.Template, NgFileType.Style, NgFileType.Spec], 10),
        new NgObjectType('service', 'Services', [NgFileType.Script, NgFileType.Spec], 8),
        new NgObjectType('directive', 'Directives', [NgFileType.Script, NgFileType.Spec], 5),
        new NgObjectType('pipe', 'Pipes', [NgFileType.Script, NgFileType.Spec], 4),
        new NgObjectType('guard', 'Guards', [NgFileType.Script, NgFileType.Spec], 3),
        new NgObjectType('module', 'Modules', [NgFileType.Script], 1),
    ];


    public static getByIdentifier(identifier: string): NgObjectType | undefined {
        return this.types.find(type => type.identifier === identifier);
    }

    constructor(
        public readonly identifier: string,
        public readonly label: string,
        public readonly possibleFileTypes: NgFileType[],
        public readonly priority = 0
    ) {

    }

    has(fileType: NgFileType): boolean {
        return this.possibleFileTypes.indexOf(fileType) > -1;
    }

}

