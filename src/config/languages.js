// Central language configuration for the frontend
// To add a new language:
// 1. Add to SUPPORTED_LANGUAGES array below
// 2. Create translation file: src/locales/{language}.json
// 3. Also update backend: utils/language.js

export const SUPPORTED_LANGUAGES = [
  { code: "english", label: "English", flag: "🇬🇧" },
  { code: "dutch", label: "Dutch", flag: "🇳🇱" },
];

export const DEFAULT_LANGUAGE = "english";

// Helper to get language label by code
export const getLanguageLabel = (code) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.label : code;
};

// Helper to get language flag by code
export const getLanguageFlag = (code) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.flag : "";
};

// Helper to get opposite language (for bilingual linking)
export const getOppositeLanguage = (lang) => {
  if (lang === "english") return "dutch";
  if (lang === "dutch") return "english";
  return DEFAULT_LANGUAGE;
};

// Helper to get all other languages except the current one
export const getOtherLanguages = (currentLang) => {
  return SUPPORTED_LANGUAGES.filter((l) => l.code !== currentLang);
};

// Helper to check if language is valid
export const isValidLanguage = (lang) => {
  return SUPPORTED_LANGUAGES.some((l) => l.code === lang);
};

// Helper to get language codes only
export const getLanguageCodes = () => {
  return SUPPORTED_LANGUAGES.map((l) => l.code);
};
