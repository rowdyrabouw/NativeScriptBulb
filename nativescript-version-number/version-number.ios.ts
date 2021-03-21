declare let NSBundle: any;

export class VersionNumber {
    constructor() {}

    getVersion(): string {
        let version = NSBundle.mainBundle.objectForInfoDictionaryKey(
            "CFBundleShortVersionString"
        );
        return version;
    }
}
