import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getAllMediaFolders,
  getMediaFolderFiles,
  uploadMediaFile,
  deleteMediaFile,
  createMediaFolder,
  deleteMediaFolder,
  updateMediaFolder,
  updateMediaFile, // Add this import
  getUserMediaFolders,
  moveMediaFileS,
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

  // Create folder and update cache (with hierarchy support)
  const handleCreateFolder = async (data) => {
    const res = await createMediaFolder(data);
    setFolders((prev) => [res.folder, ...prev]);
    return res.folder;
  };

  // Delete folder and update cache (with recursive child deletion)
  const handleDeleteFolder = async (folderId) => {
    await deleteMediaFolder(folderId);

    // Remove folder and any child folders from cache
    setFolders((prev) => {
      // Find all folders that are children of the deleted folder (recursively)
      const getAllChildFolders = (parentId, allFolders) => {
        const children = allFolders.filter((f) => f.parentId === parentId);
        let allChildren = [...children];
        children.forEach((child) => {
          allChildren = [
            ...allChildren,
            ...getAllChildFolders(child._id, allFolders),
          ];
        });
        return allChildren;
      };

      const childFolders = getAllChildFolders(folderId, prev);
      const folderIdsToRemove = [folderId, ...childFolders.map((f) => f._id)];

      // Remove from folders array
      const newFolders = prev.filter((f) => !folderIdsToRemove.includes(f._id));

      // Remove from filesByFolder cache
      setFilesByFolder((prevFiles) => {
        const newFiles = { ...prevFiles };
        folderIdsToRemove.forEach((id) => {
          delete newFiles[id];
        });
        return newFiles;
      });

      return newFolders;
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

  // Update file (rename) and update cache
  const handleUpdateFile = async (folderId, fileId, data) => {
    const res = await updateMediaFile(folderId, fileId, data);
    setFilesByFolder((prev) => ({
      ...prev,
      [folderId]: prev[folderId]?.map((f) =>
        f._id === fileId ? { ...f, ...res.file } : f
      ),
    }));
    return res.file;
  };

  // Helper function to get folder hierarchy
  const getFolderHierarchy = useCallback(() => {
    const folderMap = new Map();
    const rootFolders = [];

    // Create folder map
    folders.forEach((folder) => {
      folderMap.set(folder._id, {
        ...folder,
        children: [],
        depth: folder.depth || 0,
      });
    });

    // Build parent-child relationships
    folders.forEach((folder) => {
      const folderData = folderMap.get(folder._id);
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId);
        parent.children.push(folderData);
      } else {
        rootFolders.push(folderData);
      }
    });

    return { folderMap, rootFolders };
  }, [folders]);

  // Helper function to check if folder can have subfolders
  const canCreateSubfolder = useCallback(
    (folderId) => {
      const folder = folders.find((f) => f._id === folderId);
      return folder ? (folder.depth || 0) < 2 : false;
    },
    [folders]
  );

  // Helper function to get folder depth
  const getFolderDepth = useCallback(
    (folderId) => {
      if (folderId === "root") return -1;
      const folder = folders.find((f) => f._id === folderId);
      return folder ? folder.depth || 0 : 0;
    },
    [folders]
  );

  // Helper function to validate folder name uniqueness
  const isNameUniqueInFolder = useCallback(
    (name, parentId, excludeId = null) => {
      const siblings = folders.filter(
        (f) => f.parentId === parentId && f._id !== excludeId
      );
      return !siblings.some((f) => f.name === name);
    },
    [folders]
  );

  // IMPROVED moveMediaFile function with better error handling and logging
  const moveMediaFile = useCallback(
    async (fileId, oldFolderId, newFolderId) => {
      console.log(
        `Starting move operation: ${fileId} from ${oldFolderId} to ${newFolderId}`
      );

      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log("Making API request to move file...");

        try {
          const data = await moveMediaFileS(fileId, oldFolderId, newFolderId);
          console.log("Move operation successful:", data);
          // Update the local state to reflect the move
          setFilesByFolder((prev) => {
            const updated = { ...prev };

            // Remove file from old folder
            if (updated[oldFolderId]) {
              updated[oldFolderId] = updated[oldFolderId].filter(
                (file) => file._id !== fileId
              );
              console.log(`Removed file from folder ${oldFolderId}`);
            }

            // Add file to new folder (if it's already loaded)
            if (updated[newFolderId]) {
              // Update the file with new folderId and mediaType
              const movedFile = {
                ...data.file,
                folderId: newFolderId,
              };
              updated[newFolderId] = [...updated[newFolderId], movedFile];
              console.log(`Added file to folder ${newFolderId}`);
            }

            return updated;
          });

          console.log("Local state updated successfully");
          return data;
        } catch (error) {
          console.error("Error during API request:", error);
          throw new Error(error.message || "Failed to move file");
        }
      } catch (error) {
        console.error("Error moving file:", error);
        openNotificationWithIcon(
          "error",
          "Move Failed",
          error.message || "Failed to move file"
        );
        throw error;
      }
    },
    []
  );

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
        updateMediaFile: handleUpdateFile, // Add this new method

        // Helper functions for hierarchy management
        getFolderHierarchy,
        canCreateSubfolder,
        getFolderDepth,
        isNameUniqueInFolder,
        moveMediaFile,
      }}
    >
      {children}
    </MediaManagerContext.Provider>
  );
};

// Custom hook for easy usage
export const useMediaManager = () => useContext(MediaManagerContext);
