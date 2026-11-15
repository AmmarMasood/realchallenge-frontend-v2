/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
import { getUITranslations } from "../services/uiTranslations";
import {
  readSharedCookie,
  writeSharedCookie,
  readLanguageFromUrl,
  stripLanguageFromUrl,
  isSupportedLanguage,
} from "./crossDomain";

const LOCALE_KEY = "locale";

/**
 * Persist the chosen language.
 *
 * Written to a cookie on the PARENT domain so the WordPress site on
 * realchallenge.nl sees the same choice — localStorage cannot cross origins, and
 * without this a visitor who picks Dutch on the marketing site lands in an English
 * app at signup (MIGRATION-PLAN-content-site.md §3.3.1).
 *
 * localStorage is kept in step as a mirror: it is what every existing install
 * already has, and it still works if cookies are blocked.
 */
export const setLocale = (value = "english") => {
  try {
    localStorage.setItem(LOCALE_KEY, value);
  } catch (e) {
    /* private mode / storage disabled — the cookie below still carries it */
  }
  writeSharedCookie(LOCALE_KEY, value);
};

/**
 * The stored language preference, cookie first.
 *
 * Cookie before localStorage so a choice made on realchallenge.nl wins over a
 * stale per-browser value here. Falling back to localStorage migrates everyone who
 * already had one.
 */
export const getLocale = () => {
  const fromCookie = readSharedCookie(LOCALE_KEY);
  if (isSupportedLanguage(fromCookie)) return fromCookie;
  try {
    return localStorage.getItem(LOCALE_KEY);
  } catch (e) {
    return null;
  }
};

/**
 * The language to boot with.
 *
 * Order matters: an explicit `?lang=` on the inbound link beats everything, because
 * it is the WordPress site stating which language the visitor was just reading.
 * Consuming it here also persists it, so it survives the rest of the session.
 */
export const resolveInitialLocale = () => {
  const fromUrl = readLanguageFromUrl();
  if (fromUrl) {
    setLocale(fromUrl);
    stripLanguageFromUrl();
    return fromUrl;
  }
  return getLocale();
};

const CACHE_KEY = "ui_translations_cache";
const CACHE_TIMESTAMP_KEY = "ui_translations_timestamp";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached translations from localStorage
 */
const getCachedTranslations = (language) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${language}`);
    const timestamp = localStorage.getItem(`${CACHE_TIMESTAMP_KEY}_${language}`);

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < CACHE_TTL) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    console.warn("Failed to read translation cache:", e);
  }
  return null;
};

/**
 * Save translations to localStorage cache
 */
const setCachedTranslations = (language, translations) => {
  try {
    localStorage.setItem(`${CACHE_KEY}_${language}`, JSON.stringify(translations));
    localStorage.setItem(`${CACHE_TIMESTAMP_KEY}_${language}`, Date.now().toString());
  } catch (e) {
    console.warn("Failed to cache translations:", e);
  }
};

/**
 * Load static translations (synchronous import)
 */
const loadStaticTranslations = async (language) => {
  try {
    const module = await import(`../locales/${language}`);
    return module.default;
  } catch (e) {
    console.error(`Failed to load static translations for ${language}:`, e);
    return {};
  }
};

/**
 * Fetch translations with smart loading strategy:
 * 1. Return cached/static immediately (no flash)
 * 2. Fetch from API in background
 * 3. Update cache for next load
 *
 * @param {Object} options
 * @param {string} options.language - Language to fetch
 * @param {Function} options.onUpdate - Callback when newer translations are fetched
 * @returns {Promise<Object>} - Translations object
 */
export const fetchTranslations = async ({ language = getLocale(), onUpdate }) => {
  const lang = language || "english";

  // Step 1: Try to get cached translations first (instant)
  let cached = getCachedTranslations(lang);

  // Step 2: If no cache, load static file (still fast)
  if (!cached) {
    cached = await loadStaticTranslations(lang);
  }

  // Step 3: Fetch from API in background (don't block)
  getUITranslations(lang)
    .then((apiTranslations) => {
      if (apiTranslations && Object.keys(apiTranslations).length > 0) {
        // Cache the new translations
        setCachedTranslations(lang, apiTranslations);

        // If callback provided, notify of update
        if (onUpdate && JSON.stringify(apiTranslations) !== JSON.stringify(cached)) {
          onUpdate(apiTranslations);
        }
      }
    })
    .catch((err) => {
      console.warn(`Background fetch failed for ${lang}:`, err.message);
    });

  // Return cached/static immediately
  return cached;
};

/**
 * Force refresh translations from API (for admin panel after edits)
 */
export const refreshTranslations = async (language = getLocale()) => {
  const lang = language || "english";

  try {
    const translations = await getUITranslations(lang);
    if (translations && Object.keys(translations).length > 0) {
      setCachedTranslations(lang, translations);
      return translations;
    }
  } catch (err) {
    console.error("Failed to refresh translations:", err);
  }

  return loadStaticTranslations(lang);
};

/**
 * Clear translation cache (useful when switching languages)
 */
export const clearTranslationCache = (language) => {
  if (language) {
    localStorage.removeItem(`${CACHE_KEY}_${language}`);
    localStorage.removeItem(`${CACHE_TIMESTAMP_KEY}_${language}`);
  } else {
    // Clear all
    ["english", "dutch"].forEach((lang) => {
      localStorage.removeItem(`${CACHE_KEY}_${lang}`);
      localStorage.removeItem(`${CACHE_TIMESTAMP_KEY}_${lang}`);
    });
  }
};
