declare module 'react-native-version-check' {
    export interface NeedUpdateResponse {
        isNeeded: boolean;
        storeVersion?: string;
        currentVersion?: string;
    }

    export function setAppName(appName: string): void;
    export function needUpdate(option?: Object): Promise<NeedUpdateResponse>;
    export function getStoreUrl(option?: Object): Promise<string>;
    export function getCountry(option?: Object): Promise<string>;
    export function getPackageName(option?: Object): Promise<string>;
    export function getCurrentBuildNumber(option?: Object): Promise<string>;
    export function getCurrentVersion(option?: Object): Promise<string>;
}

export default 'react-native-version-check';
