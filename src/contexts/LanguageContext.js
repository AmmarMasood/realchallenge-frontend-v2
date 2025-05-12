import React, {
  useState,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getLocale, setLocale } from "../helpers/translationHelpers";

const initialLocale = getLocale();

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
