/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
export const setLocale = (value = "english") => {
  localStorage.setItem("locale", value);
};

export const getLocale = () => localStorage.getItem("locale");

export const fetchTranslations = ({ language = getLocale() }) =>
  import(`../locales/${language}`).then((module) => {
    return module.default;
  });
