module.exports = {
    expo: {
        name: 'Method do',
        slug: 'method-app',
        version: '1.1.0',
        orientation: 'portrait',
        icon: './assets/images/icons/icon-light.png',
        scheme: 'com.anonymous.methodapp',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        jsEngine: 'jsc',
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/icons/icon-trans.png',
                backgroundColor: '#ffffff',
            },
            package: 'com.anonymous.methodapp',
            intentFilters: [
                {
                    action: 'VIEW',
                    autoVerify: true,
                    data: [
                        {
                            scheme: 'com.anonymous.methodapp',
                        },
                    ],
                    category: ['BROWSABLE', 'DEFAULT'],
                },
            ],
        },
        ios: {
            usesAppleSignIn: true,
            bundleIdentifier: 'com.anonymous.methodapp',
            buildNumber: '1',
            icon: './assets/images/icons/icon-light.png',
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/icons/icon-light.png',
        },
        plugins: [
            [
                'expo-dev-client',
                {
                    developerMode: true,
                },
            ],
            'expo-router',
            'expo-audio',
            'expo-notifications',
            'react-native-iap',
        ],
        experiments: {
            typedRoutes: true,
            tsconfigPaths: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: '2f9b2df6-af52-4635-9b67-d222cd5006c8',
            },
            revenuecat: {
                revenuecatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
                revenuecatId: process.env.EXPO_PUBLIC_REVENUECAT_ID,
            },
        },
        updates: {
            enabled: true,
            checkAutomatically: 'ON_LOAD',
            fallbackToCacheTimeout: 0,
            url: 'https://u.expo.dev/2f9b2df6-af52-4635-9b67-d222cd5006c8',
        },
        runtimeVersion: '1.1.0',
        channel: 'production',
        sdkVersion: '52.0.0',
    },
    name: 'method-app',
};
