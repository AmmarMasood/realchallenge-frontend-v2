import axios from "axios";
import { notification } from "antd";

// Media types constant for Media Manager
export const MEDIA_MANAGER_MEDIA_TYPES = {
  VIDEO: "video",
  AUDIO: "audio",
  PICTURE: "picture",
  DOCUMENT: "document",
  OTHER: "other",
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// --- TEST ROUTE ---
export function testMediaRoute() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Media route test failed",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// --- FOLDER APIs ---
export function createMediaFolder({ name, mediaType, parentId, forUser }) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/folder`, {
      name,
      mediaType,
      parentId, // Add parentId support for nested folders
      forUser, // Admin can create folder for specific user
    })
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to create folder",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

export function getMediaFolder(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folder/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get folder",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

export function updateMediaFolder(id, { name, mediaType }) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/media/folder/${id}`, {
      name,
      mediaType,
    })
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to update folder",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

export function deleteMediaFolder(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/media/folder/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to delete folder",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// Original admin function - gets all folders in flat structure
export function getAllMediaFolders() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folders`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get all folders",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// --- NEW ADMIN FUNCTIONS ---

// Get all folders grouped by users (admin only)
export function getAllMediaFoldersGroupedByUser() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folders/admin`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get user folders",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// Get specific user's folders (admin only)
export function getSpecificUserFolders(userId) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folders/user/${userId}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get user folders",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// Regular user folders
export function getUserMediaFolders() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folders/user`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get user folders",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// --- FILE APIs ---
export function uploadMediaFile(folderId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}`,
      formData
    )
    .then((res) => {
      openNotificationWithIcon("success", "File uploaded successfully", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to upload file",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

export function getMediaFolderFiles(folderId) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}/files`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get files",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

export function deleteMediaFile(folderId, fileId) {
  return axios
    .delete(
      `${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}/files/${fileId}`
    )
    .then((res) => {
      openNotificationWithIcon("success", "File deleted successfully", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to delete file",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// --- Update file (rename) ---
export function updateMediaFile(folderId, fileId, data) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}/files/${fileId}`,
      data
    )
    .then((res) => {
      openNotificationWithIcon("success", "File updated successfully", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to update file",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}

// --- Move file between folders ---
export function moveMediaFileS(fileId, oldFolderId, newFolderId) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/media/folders/${oldFolderId}/files/${fileId}/move`,
      { newFolderId }
    )
    .then((res) => {
      openNotificationWithIcon("success", "File moved successfully", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to move file",
        err?.response?.data?.message || ""
      );
      throw err;
    });
}
