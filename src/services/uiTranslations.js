import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

/**
 * Get all UI translations for a specific language
 * Returns nested JSON object for frontend use
 * @param {string} language - 'english' or 'dutch'
 */
export function getUITranslations(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/ui-translations/${language}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error("Failed to fetch UI translations:", err);
      throw err;
    });
}

/**
 * Get all translations with both languages for admin panel
 * Returns array of {key, english, dutch} objects
 */
export function getAllTranslationsAdmin() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/ui-translations/admin/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to fetch translations",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}

/**
 * Update a single translation
 * @param {string} language - 'english' or 'dutch'
 * @param {string} key - The translation key (dot notation)
 * @param {string} value - The new translation value
 */
export function updateTranslation(language, key, value) {
  const encodedKey = encodeURIComponent(key);
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/ui-translations/${language}/${encodedKey}`,
      { value }
    )
    .then((res) => {
      openNotificationWithIcon("success", "Translation updated", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to update translation",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}

/**
 * Get translations that are missing in either language
 */
export function getMissingTranslations() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/ui-translations/admin/missing`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to fetch missing translations",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}

/**
 * Bulk update translations
 * @param {Array} translations - Array of {key, language, value} objects
 */
export function bulkUpdateTranslations(translations) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/ui-translations/admin/bulk`,
      { translations }
    )
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Translations updated",
        `Updated: ${res.data.results.updated}, Created: ${res.data.results.created}`
      );
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to update translations",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}
