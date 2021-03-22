declare let NSBundle: any;

export class Version {
    constructor() {}

    getVersion(): string {
        let version = NSBundle.mainBundle.objectForInfoDictionaryKey(
            "CFBundleShortVersionString"
        );
        return version;
    }
}
