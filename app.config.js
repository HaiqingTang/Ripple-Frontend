import 'dotenv/config';

export default {
    scheme: "ripple",
    plugins: [
        "expo-font",
        "expo-router",
        "expo-web-browser"
    ],
    extra: {
        firebaseApiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_PROJECT_ID,
        storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
        appId: process.env.REACT_APP_APP_ID,
        measurementId: process.env.REACT_APP_MEASUREMENT_ID,
    },
};