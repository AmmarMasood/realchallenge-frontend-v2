import React, {
  useState,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { setLocale, resolveInitialLocale } from "../helpers/translationHelpers";

// Resolved at module load, before the first render, so the very first paint is in
// the right language. resolveInitialLocale() prefers an inbound `?lang=` from the
// WordPress site over the stored preference — see helpers/crossDomain.js.
const initialLocale = resolveInitialLocale();

export const LanguageContext = createContext({
  language: initialLocale ? initialLocale : "english",
  strings: {},
  updateLanguage: () => {},
});

export const LanguageProvider = ({ children, fetchTranslations }) => {
  const [{ language, strings }, setLanguage] = useState({
    language: initialLocale ? initialLocale : "english",
    strings: {},
  });
  const initialStringsLoaded = useRef(false);

  const updateLanguage = useCallback(
    async (newLang) => {
      if (initialStringsLoaded.current && newLang === language) return;
      const newStrings = await fetchTranslations({ language: newLang });
      setLocale(newLang);
      initialStringsLoaded.current = true;
      setLanguage({
        language: newLang,
        strings: newStrings,
      });
    },
    [language, fetchTranslations]
  );

  useEffect(() => {
    updateLanguage(language);
  }, [language, updateLanguage]);

  const context = {
    language,
    strings,
    updateLanguage: updateLanguage,
  };

  return (
    <LanguageContext.Provider value={context}>
      {children}
    </LanguageContext.Provider>
  );
};
