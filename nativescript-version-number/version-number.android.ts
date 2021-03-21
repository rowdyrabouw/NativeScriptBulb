import * as application from "tns-core-modules/application";

declare let android: any;
declare let java: any;

export class VersionNumber {
    constructor() {}

    getVersion(): string {
        let PackageManager = android.content.pm.PackageManager;
        let pkg = application.android.context
            .getPackageManager()
            .getPackageInfo(
                application.android.context.getPackageName(),
                PackageManager.GET_META_DATA
            );
        return java.lang.Integer.toString(pkg.versionCode);
    }
}
