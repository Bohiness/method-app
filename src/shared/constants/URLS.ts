export const API_URLS = {
    BASE: process.env.EXPO_PUBLIC_API_URL || 'https://api.method.do',
    DOCS: {
        EULA: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
        getBase: (locale: string) => `https://method.do/${locale}/docs/app`,
        getTerms: (locale: string) => `https://method.do/${locale}/docs/app/terms`,
        getPrivacy: (locale: string) => `https://method.do/${locale}/docs/app/privacy`,
    },
} as const;
