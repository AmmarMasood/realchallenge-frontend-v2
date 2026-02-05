import get from "lodash/get";
import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";
import { getLocale } from "../helpers/translationHelpers";
import englishStrings from "../locales/english.json";
import dutchStrings from "../locales/dutch.json";

// Pre-loaded translation files for use outside React context
const localeStrings = {
  english: englishStrings,
  dutch: dutchStrings,
};

// Cache key for localStorage (same as in translationHelpers.js)
const CACHE_KEY = "ui_translations_cache";

/**
 * Get cached translations from localStorage
 */
const getCachedTranslations = (language) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${language}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Failed to read translation cache:", e);
  }
  return null;
};

/**
 * Interpolate a string with parameters
 * Replaces {{paramName}} with the corresponding value from params
 * @param {string} str - The string with placeholders
 * @param {Object} params - The parameters to interpolate
 * @returns {string} The interpolated string
 */
const interpolate = (str, params = {}) => {
  if (!str || typeof str !== "string" || !params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

/**
 * Get translation string outside of React context
 * Use this in service files, modals, or anywhere React context isn't available
 * Checks cached database translations first, falls back to static files
 * @param {string} key - The translation key (e.g., "payment.error_title")
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} The translated string
 */
export const translate = (key, params = {}) => {
  const locale = getLocale() || "english";
  // Try cached (database) translations first, fall back to static files
  const cached = getCachedTranslations(locale);
  const strings = cached || localeStrings[locale] || localeStrings.english;
  const translatedString = get(strings, key, key);
  return interpolate(translatedString, params);
};

export const T = (props) => {
  const children = props.children ? props.children : props;
  const params = props.params || props.values || {};
  const { strings, language } = useContext(LanguageContext);

  // Use context strings if available, otherwise fallback to pre-loaded locale files
  const effectiveStrings = Object.keys(strings).length > 0
    ? strings
    : localeStrings[language] || localeStrings.english;

  const translatedString = get(effectiveStrings, children, children);
  return interpolate(translatedString, params);
};
