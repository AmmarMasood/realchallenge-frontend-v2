import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Get all translations for a specific translation key
export function getTranslationsByKey(translationKey) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/translations/${translationKey}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get translations", "");
      console.log(err);
      return null;
    });
}

// Get content missing translations for a specific language
export function getContentMissingTranslations(contentType, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/translations/missing/${contentType}/${language}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get content missing translations",
        ""
      );
      console.log(err);
      return null;
    });
}

// Get content needing translation to a target language
export function getContentNeedingTranslation(
  contentType,
  targetLanguage,
  sourceLanguage = null
) {
  let url = `${process.env.REACT_APP_SERVER}/api/translations/needs-translation/${contentType}/${targetLanguage}`;
  if (sourceLanguage) {
    url += `?sourceLanguage=${sourceLanguage}`;
  }
  return axios
    .get(url)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get content needing translation",
        ""
      );
      console.log(err);
      return null;
    });
}

// Link existing content as translations
export function linkTranslations(contentType, contentIds, translationKey) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/translations/link`, {
      contentType,
      contentIds,
      translationKey,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Translations linked successfully!", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to link translations", "");
      console.log(err);
      return null;
    });
}
