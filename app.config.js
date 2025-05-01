module.exports = {
    "expo": {
        "name": "tibetskaya_courier",
        "slug": "tibetskaya_courier",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "myapp",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": false,
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": "com.edil-kulzhabay.tibetskaya-courier",
            "googleServicesFile": "./GoogleService-Info.plist"
        },
        "android": {
            "googleServicesFile": "./google-services.json",
            "adaptiveIcon": {
            "foregroundImage": "./assets/images/adaptive-icon.png",
            "backgroundColor": "#ffffff"
            },
            "package": "com.edil_kulzhabay.tibetskaya_courier",
            "permissions": [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION"
            ]
        },
        "web": {
            "bundler": "metro",
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router",
            [
            "expo-splash-screen",
            {
                "image": "./assets/images/splash.png",
                "imageWidth": 200,
                "resizeMode": "contain",
                "backgroundColor": "#ffffff"
            }
            ],
            [
            "expo-notifications",
            {
                "icon": "./assets/images/icon.png",
                "color": "#ffffff",
                "defaultChannel": "default"
            }
            ],
            [
            "expo-location",
            {
                "locationAlwaysAndWhenInUsePermission": "Разрешите доступ к геолокации для работы приложения."
            }
            ],
            ["expo-build-properties", {
                "android": {
                    "googleServicesFile": "./google-services.json",
                    "extraGradleProperties": [
                        "android.useAndroidX=true",
                        "android.enableJetifier=true"
                    ],
                    "extraMavenRepos": [
                        "google()",
                        "mavenCentral()"
                    ],
                    "gradlePlugins": [
                        "com.google.gms:google-services:4.4.1"
                    ]
                },
                "ios": {
                    "useModularHeaders": true
                }
            }],
            "@react-native-firebase/app"
        ],
        "experiments": {
            "typedRoutes": true
        },
        "extra": {
            "router": {
            "origin": false
            },
            "eas": {
            "projectId": "2163ede9-aad0-446c-9528-95a99fdb5c5e"
            }
        },
        "owner": "edil_kulzhabay",
        "runtimeVersion": "1.0.0",
        "updates": {
        "url": "https://u.expo.dev/2163ede9-aad0-446c-9528-95a99fdb5c5e"
        }
    }
}
  