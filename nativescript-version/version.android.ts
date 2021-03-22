import { Application } from "@nativescript/core";

declare let android: any;
declare let java: any;

export class Version {
    constructor() {}

    getVersion(): string {
        let PackageManager = android.content.pm.PackageManager;
        let pkg = Application.android.context
            .getPackageManager()
            .getPackageInfo(
                Application.android.context.getPackageName(),
                PackageManager.GET_META_DATA
            );
        return pkg.versionName;
    }
}
