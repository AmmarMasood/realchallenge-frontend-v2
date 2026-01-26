import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

/**
 * Get all active package configurations (public)
 */
export function getAllPackages() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/package-config`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error("Failed to fetch package configs:", err);
      throw err;
    });
}

/**
 * Get a single package by ID
 * @param {string} packageId - CHALLENGE_1, CHALLENGE_3, or CHALLENGE_12
 */
export function getPackageById(packageId) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/package-config/${packageId}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(`Failed to fetch package ${packageId}:`, err);
      throw err;
    });
}

/**
 * Get all packages for admin (including inactive)
 */
export function getAllPackagesAdmin() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/package-config/admin/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to fetch packages",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}

/**
 * Update a package configuration
 * @param {string} packageId - CHALLENGE_1, CHALLENGE_3, or CHALLENGE_12
 * @param {Object} data - Fields to update
 */
export function updatePackage(packageId, data) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/package-config/admin/${packageId}`,
      data
    )
    .then((res) => {
      openNotificationWithIcon("success", "Package updated successfully", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to update package",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}

/**
 * Reset all packages to default values
 */
export function resetPackagesToDefaults() {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/package-config/admin/reset`)
    .then((res) => {
      openNotificationWithIcon("success", "Packages reset to defaults", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to reset packages",
        err.response?.data?.message || "Please try again"
      );
      console.error(err);
      throw err;
    });
}
