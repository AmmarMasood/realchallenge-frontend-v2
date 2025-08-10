import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getAllMediaFolders,
  getMediaFolderFiles,
  uploadMediaFile,
  deleteMediaFile,
  createMediaFolder,
  deleteMediaFolder,
  updateMediaFolder,
  getUserMediaFolders,
} from "../services/mediaManager";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Create context
const MediaManagerContext = createContext();

// Provider component
export const MediaManagerProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [filesByFolder, setFilesByFolder] = useState({}); // { [folderId]: [files] }
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState({}); // { [folderId]: boolean }

  // Fetch all folders (with cache)
  const fetchFolders = useCallback(
    async (force = false) => {
      if (folders.length > 0 && !force) return folders;
      setLoadingFolders(true);
      try {
        const res = await getUserMediaFolders();
        setFolders(res.folders || []);
        return res.folders || [];
      } finally {
        setLoadingFolders(false);
      }
    },
    [folders]
  );

  // Fetch files for a folder (with cache)
  const fetchFiles = useCallback(
    async (folderId, force = false) => {
      if (filesByFolder[folderId] && !force) return filesByFolder[folderId];
      setLoadingFiles((prev) => ({ ...prev, [folderId]: true }));
      try {
        const res = await getMediaFolderFiles(folderId);
        setFilesByFolder((prev) => ({ ...prev, [folderId]: res.files || [] }));
        return res.files || [];
      } finally {
        setLoadingFiles((prev) => ({ ...prev, [folderId]: false }));
      }
    },
    [filesByFolder]
  );

  const handleUploadFile = async (folderId, file) => {
    // Find the folder to get its mediaType
    const folder = folders.find((f) => f._id === folderId);
    if (!folder) throw new Error("Folder not found");

    // Define allowed mime types for each mediaType
    const allowedMimeTypes = {
      picture: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ],
      video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
      audio: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
      ],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ],
      other: [], // allow all
    };

    // If not "other", check file type
    if (folder.mediaType !== "other") {
      const allowed = allowedMimeTypes[folder.mediaType] || [];
      if (!allowed.includes(file.type)) {
        openNotificationWithIcon(
          "error",
          "Invalid file type",
          `Only ${folder.mediaType} files are allowed in this folder.`
        );
        throw new Error(
          `Only ${folder.mediaType} files are allowed in this folder.`
        );
      }
    }

    const res = await uploadMediaFile(folderId, file);
    setFilesByFolder((prev) => ({
      ...prev,
      [folderId]: prev[folderId]
        ? [res.mediaFile, ...prev[folderId]]
        : [res.mediaFile],
    }));
    return res.mediaFile;
  };
  // Delete file and update cache
  const handleDeleteFile = async (folderId, fileId) => {
    await deleteMediaFile(folderId, fileId);
    setFilesByFolder((prev) => ({
      ...prev,
      [folderId]: prev[folderId]?.filter((f) => f._id !== fileId),
    }));
  };

  // Create folder and update cache
  const handleCreateFolder = async (data) => {
    const res = await createMediaFolder(data);
    setFolders((prev) => [res.folder, ...prev]);
    return res.folder;
  };

  // Delete folder and update cache
  const handleDeleteFolder = async (folderId) => {
    await deleteMediaFolder(folderId);
    setFolders((prev) => prev.filter((f) => f._id !== folderId));
    setFilesByFolder((prev) => {
      const newObj = { ...prev };
      delete newObj[folderId];
      return newObj;
    });
  };

  // Update folder and update cache
  const handleUpdateFolder = async (folderId, data) => {
    const res = await updateMediaFolder(folderId, data);
    setFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, ...res.folder } : f))
    );
    return res.folder;
  };

  return (
    <MediaManagerContext.Provider
      value={{
        folders,
        filesByFolder,
        loadingFolders,
        loadingFiles,
        fetchFolders,
        fetchFiles,
        uploadMediaFile: handleUploadFile,
        deleteMediaFile: handleDeleteFile,
        createMediaFolder: handleCreateFolder,
        deleteMediaFolder: handleDeleteFolder,
        updateMediaFolder: handleUpdateFolder,
      }}
    >
      {children}
    </MediaManagerContext.Provider>
  );
};

// Custom hook for easy usage
export const useMediaManager = () => useContext(MediaManagerContext);
