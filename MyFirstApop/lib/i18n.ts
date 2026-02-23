import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/locales/en.json';
import ne from '@/locales/ne.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
    en: { translation: en },
    ne: { translation: ne },
};

// A custom language detector for react-native
const languageDetector: any = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            // Get stored language from Async Storage
            const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (storedLanguage) {
                return callback(storedLanguage);
            }
            // If no stored language, get device language
            let phoneLanguage = Localization.getLocales()[0].languageCode;

            // Fallback to 'en' if the device language is not natively supported by our app
            if (phoneLanguage !== 'ne' && phoneLanguage !== 'en') {
                phoneLanguage = 'en';
            }

            callback(phoneLanguage ?? 'en');
        } catch (error) {
            console.log('Error reading language from async storage', error);
            callback('en');
        }
    },
    init: () => { },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language to async storage', error);
        }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already does escaping
        },
        react: {
            useSuspense: false, // Prevents loading screens while translations load
        },
    });

export default i18n;
