import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getAllMediaFolders,
  getAllMediaFoldersGroupedByUser, // New admin function
  getSpecificUserFolders, // New admin function
  getMediaFolderFiles,
  uploadMediaFile,
  deleteMediaFile,
  createMediaFolder,
  deleteMediaFolder,
  updateMediaFolder,
  updateMediaFile,
  getUserMediaFolders,
  moveMediaFileS,
  copyMediaFile,
  searchMediaFiles, // New search function for admin
} from "../services/mediaManager";
import { notification } from "antd";
import { userInfoContext } from "./UserStore";

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
  const [userInfo, setUserInfo] = useContext(userInfoContext); // Assuming userInfoContext is defined elsewhere
  const [folders, setFolders] = useState([]);
  const [filesByFolder, setFilesByFolder] = useState({}); // { [folderId]: [files] }
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState({}); // { [folderId]: boolean }

  // Admin-specific state
  const [adminMode, setAdminMode] = useState(false);
  const [usersData, setUsersData] = useState([]); // For admin view: [{user, folders, totalFolders}]
  const [currentViewingUserId, setCurrentViewingUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Clipboard state for copy/paste functionality
  const [clipboardFiles, setClipboardFiles] = useState([]);

  // Search state for admin
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPagination, setSearchPagination] = useState(null);
  const [lastSearchCriteria, setLastSearchCriteria] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Check if current user is admin
  const isAdmin = useCallback(() => userInfo.role === "admin", [userInfo]);

  // Fetch all folders for regular users (with cache)
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

  // NEW: Fetch all users and their folders for admin
  const fetchAllUsersData = useCallback(
    async (force = false) => {
      if (!isAdmin()) {
        throw new Error("Admin access required");
      }

      if (usersData.length > 0 && !force) return usersData;

      setLoadingUsers(true);
      try {
        const res = await getAllMediaFoldersGroupedByUser();
        setUsersData(res.users || []);
        return res.users || [];
      } catch (error) {
        openNotificationWithIcon(
          "error",
          "Failed to load users data",
          error.message || "Unable to fetch users data"
        );
        throw error;
      } finally {
        setLoadingUsers(false);
      }
    },
    [usersData, isAdmin]
  );

  // NEW: Fetch specific user's folders for admin
  const fetchUserFolders = useCallback(
    async (userId, force = false) => {
      if (!isAdmin()) {
        throw new Error("Admin access required");
      }

      // Check if we already have this user's folders cached
      const existingUserData = usersData.find((u) => u.user._id === userId);
      if (existingUserData && existingUserData.folders && !force) {
        setFolders(existingUserData.folders);
        setCurrentViewingUserId(userId);
        return existingUserData.folders;
      }

      setLoadingFolders(true);
      try {
        const res = await getSpecificUserFolders(userId);
        setFolders(res.folders || []);
        setCurrentViewingUserId(userId);

        // Update the users data cache
        setUsersData((prevUsers) =>
          prevUsers.map((userData) =>
            userData.user._id === userId
              ? { ...userData, folders: res.folders || [] }
              : userData
          )
        );

        return res.folders || [];
      } catch (error) {
        openNotificationWithIcon(
          "error",
          "Failed to load user folders",
          error.message || "Unable to fetch user folders"
        );
        throw error;
      } finally {
        setLoadingFolders(false);
      }
    },
    [usersData, isAdmin]
  );

  // Switch to admin mode
  const enableAdminMode = useCallback(() => {
    if (!isAdmin()) {
      openNotificationWithIcon(
        "error",
        "Access Denied",
        "Admin privileges required"
      );
      return false;
    }
    setAdminMode(true);
    setFolders([]); // Clear regular folders
    setFilesByFolder({}); // Clear files cache
    setCurrentViewingUserId(null);
    return true;
  }, [isAdmin]);

  // Switch back to regular user mode
  const disableAdminMode = useCallback(() => {
    setAdminMode(false);
    setUsersData([]);
    setCurrentViewingUserId(null);
    setFolders([]);
    setFilesByFolder({});
  }, []);

  // Get current context (admin viewing specific user vs regular user)
  const getCurrentContext = useCallback(() => {
    if (adminMode && currentViewingUserId) {
      const userData = usersData.find(
        (u) => u.user._id === currentViewingUserId
      );
      return {
        isAdmin: true,
        isViewingSpecificUser: true,
        currentUser: userData?.user || null,
        folders: folders,
      };
    } else if (adminMode) {
      return {
        isAdmin: true,
        isViewingSpecificUser: false,
        currentUser: null,
        folders: [],
        usersData: usersData,
      };
    } else {
      return {
        isAdmin: false,
        isViewingSpecificUser: false,
        currentUser: userInfo,
        folders: folders,
      };
    }
  }, [adminMode, currentViewingUserId, usersData, folders]);

  // Fetch files for a folder (with cache) - works for both admin and regular users
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
    if (adminMode) {
      data.forUser = currentViewingUserId;
    }
    const res = await createMediaFolder(data);
    setFolders((prev) => [res.folder, ...prev]);

    // If in admin mode viewing specific user, also update users data cache
    if (adminMode && currentViewingUserId) {
      setUsersData((prevUsers) =>
        prevUsers.map((userData) =>
          userData.user._id === currentViewingUserId
            ? {
                ...userData,
                folders: [res.folder, ...userData.folders],
                totalFolders: userData.totalFolders + 1,
              }
            : userData
        )
      );
    }

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

      // If in admin mode viewing specific user, also update users data cache
      if (adminMode && currentViewingUserId) {
        setUsersData((prevUsers) =>
          prevUsers.map((userData) =>
            userData.user._id === currentViewingUserId
              ? {
                  ...userData,
                  folders: newFolders,
                  totalFolders: Math.max(
                    0,
                    userData.totalFolders - folderIdsToRemove.length
                  ),
                }
              : userData
          )
        );
      }

      return newFolders;
    });
  };

  // Update folder and update cache
  const handleUpdateFolder = async (folderId, data) => {
    const res = await updateMediaFolder(folderId, data);
    setFolders((prev) =>
      prev.map((f) => (f._id === folderId ? { ...f, ...res.folder } : f))
    );

    // If in admin mode viewing specific user, also update users data cache
    if (adminMode && currentViewingUserId) {
      setUsersData((prevUsers) =>
        prevUsers.map((userData) =>
          userData.user._id === currentViewingUserId
            ? {
                ...userData,
                folders: userData.folders.map((f) =>
                  f._id === folderId ? { ...f, ...res.folder } : f
                ),
              }
            : userData
        )
      );
    }

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
          const data = await moveMediaFile(fileId, oldFolderId, newFolderId);
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

  // Cut files to clipboard (for move operation)
  const cutFilesToClipboard = useCallback((files) => {
    setClipboardFiles(files);
    openNotificationWithIcon(
      "info",
      "Files Cut",
      `${files.length} file(s) cut to clipboard - they will be moved when pasted`
    );
  }, []);

  // Paste files from clipboard to target folder (actually moves them)
  const pasteFilesFromClipboard = useCallback(
    async (targetFolderId) => {
      if (clipboardFiles.length === 0) {
        openNotificationWithIcon(
          "warning",
          "Nothing to Paste",
          "No files in clipboard"
        );
        return;
      }

      console.log(
        `Moving ${clipboardFiles.length} files to folder ${targetFolderId}`
      );

      try {
        const results = [];
        for (const file of clipboardFiles) {
          console.log(
            `Moving file ${file.name} from ${file.parentId} to ${targetFolderId}`
          );

          if (file.parentId === targetFolderId) {
            console.log(
              `Skipping file ${file.name} - already in target folder`
            );
            continue;
          }

          const result = await copyMediaFile(
            file.id,
            file.parentId,
            targetFolderId
          );
          results.push(result);
        }

        if (results.length > 0) {
          // Update local state: remove from source folders and add to target folder
          setFilesByFolder((prev) => {
            const updated = { ...prev };

            // Remove files from their original folders
            clipboardFiles.forEach((file) => {
              if (updated[file.parentId]) {
                updated[file.parentId] = updated[file.parentId].filter(
                  (f) => f._id !== file.id
                );
              }
            });

            // Add files to target folder
            if (updated[targetFolderId]) {
              const movedFiles = results.map((r) => r.file);
              updated[targetFolderId] = [
                ...updated[targetFolderId],
                ...movedFiles,
              ];
            }

            return updated;
          });

          openNotificationWithIcon(
            "success",
            "Files Moved",
            `${results.length} file(s) moved successfully`
          );
        } else {
          openNotificationWithIcon(
            "info",
            "No Files Moved",
            "All files were already in the target folder"
          );
        }

        // Clear clipboard after moving
        setClipboardFiles([]);

        return results;
      } catch (error) {
        console.error("Error moving files:", error);
        openNotificationWithIcon(
          "error",
          "Move Failed",
          error.message || "Failed to move files"
        );
        throw error;
      }
    },
    [clipboardFiles]
  );

  // Clear clipboard
  const clearClipboard = useCallback(() => {
    setClipboardFiles([]);
  }, []);

  // Search files (admin only)
  const searchFiles = useCallback(
    async (searchParams) => {
      if (!isAdmin()) {
        throw new Error("Admin access required");
      }

      setSearchLoading(true);
      try {
        const res = await searchMediaFiles(searchParams);
        setSearchResults(res.files || []);
        setSearchPagination(res.pagination || null);
        setLastSearchCriteria(res.searchCriteria || null);
        setShowSearchResults(true);

        openNotificationWithIcon(
          "success",
          "Search completed",
          `Found ${res.pagination?.totalFiles || 0} files`
        );

        return res;
      } catch (error) {
        openNotificationWithIcon(
          "error",
          "Search failed",
          error.message || "Unable to search files"
        );
        throw error;
      } finally {
        setSearchLoading(false);
      }
    },
    [isAdmin]
  );

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchPagination(null);
    setLastSearchCriteria(null);
    setShowSearchResults(false);
  }, []);

  // Load more search results (pagination)
  const loadMoreSearchResults = useCallback(
    async (page) => {
      if (!lastSearchCriteria || !isAdmin()) {
        return;
      }

      setSearchLoading(true);
      try {
        const searchParams = {
          ...lastSearchCriteria,
          page,
        };

        const res = await searchMediaFiles(searchParams);

        // Append new results to existing ones
        setSearchResults((prev) => [...prev, ...(res.files || [])]);
        setSearchPagination(res.pagination || null);

        return res;
      } catch (error) {
        openNotificationWithIcon(
          "error",
          "Failed to load more results",
          error.message || "Unable to load more search results"
        );
        throw error;
      } finally {
        setSearchLoading(false);
      }
    },
    [lastSearchCriteria, isAdmin]
  );

  // Refresh search with same criteria
  const refreshSearchResults = useCallback(
    async () => {
      if (!lastSearchCriteria || !isAdmin()) {
        return;
      }

      await searchFiles(lastSearchCriteria);
    },
    [lastSearchCriteria, isAdmin, searchFiles]
  );

  return (
    <MediaManagerContext.Provider
      value={{
        // Regular state
        folders,
        filesByFolder,
        loadingFolders,
        loadingFiles,

        // Admin state
        adminMode,
        usersData,
        currentViewingUserId,
        loadingUsers,

        // Regular functions
        fetchFolders,
        fetchFiles,
        uploadMediaFile: handleUploadFile,
        deleteMediaFile: handleDeleteFile,
        createMediaFolder: handleCreateFolder,
        deleteMediaFolder: handleDeleteFolder,
        updateMediaFolder: handleUpdateFolder,
        updateMediaFile: handleUpdateFile,

        // Admin functions
        isAdmin,
        enableAdminMode,
        disableAdminMode,
        fetchAllUsersData,
        fetchUserFolders,
        getCurrentContext,

        // Helper functions for hierarchy management
        getFolderHierarchy,
        canCreateSubfolder,
        getFolderDepth,
        isNameUniqueInFolder,
        moveMediaFile,

        // Cut/paste functions
        clipboardFiles,
        cutFilesToClipboard,
        pasteFilesFromClipboard,
        clearClipboard,

        // Search functions (admin only)
        searchFiles,
        clearSearchResults,
        loadMoreSearchResults,
        refreshSearchResults,
        searchResults,
        searchLoading,
        searchPagination,
        lastSearchCriteria,
        showSearchResults,
      }}
    >
      {children}
    </MediaManagerContext.Provider>
  );
};

// Custom hook for easy usage
export const useMediaManager = () => useContext(MediaManagerContext);
