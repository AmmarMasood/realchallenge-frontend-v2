import { ChonkyActions, FileHelper, FullFileBrowser } from "chonky";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { showActionNotification } from "./mediaManagerUtils";
import MediaFileUploader from "./MediaFileUploader";
import { useMediaManager } from "../../../contexts/MediaManagerContext";
import setAuthToken from "../../../helpers/setAuthToken";
import { Button, Input, notification, Select } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Hook that sets up our file map using the MediaManagerContext
const useCustomFileMap = () => {
  const {
    folders,
    filesByFolder,
    loadingFolders,
    loadingFiles,
    fetchFolders,
    fetchFiles,
  } = useMediaManager();

  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [currentFolderName, setCurrentFolderName] = useState("Media Manager");
  const currentFolderIdRef = useRef(currentFolderId);

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));
    // Only fetch folders on initial load
    fetchFolders();
    currentFolderIdRef.current = currentFolderId;
  }, []);

  // Fetch files when entering a folder (only if not already cached)
  useEffect(() => {
    if (currentFolderId !== "root" && !filesByFolder[currentFolderId]) {
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId, filesByFolder, fetchFiles]);

  // Convert context data to Chonky file map format
  const fileMap = useMemo(() => {
    const newFileMap = {
      root: {
        id: "root",
        name: "Media Manager",
        isDir: true,
        childrenIds: folders.map((folder) => folder._id),
        childrenCount: folders.length,
      },
    };

    // Add folders to file map
    folders.forEach((folder) => {
      newFileMap[folder._id] = {
        id: folder._id,
        name: folder.name,
        isDir: true,
        parentId: "root",
        childrenIds: filesByFolder[folder._id]?.map((file) => file._id) || [],
        // childrenCount: filesByFolder[folder._id]?.length || 0,
        mediaType: folder.mediaType,
        createdAt: folder.createdAt,
      };
    });

    // Add files to file map for all cached folders
    Object.entries(filesByFolder).forEach(([folderId, files]) => {
      files.forEach((file) => {
        newFileMap[file._id] = {
          id: file._id,
          name: file.originalName || file.filename,
          isDir: false,
          parentId: folderId,
          link: file.filelink,
          mediaType: file.mediaType,
          thumbnailUrl: file.mediaType === "picture" ? file.filelink : null,
          createdAt: file.createdAt,
          filename: file.filename,
        };
      });
    });

    return newFileMap;
  }, [folders, filesByFolder]);

  // Refresh data when needed (force refetch)
  const refreshData = useCallback(async () => {
    await fetchFolders(true);
    if (currentFolderId !== "root") {
      await fetchFiles(currentFolderId, true);
    }
  }, [fetchFolders, fetchFiles, currentFolderId]);

  return {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    refreshData,
    loading: loadingFolders || loadingFiles[currentFolderId],
  };
};

export const useFiles = (fileMap, currentFolderId) => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    if (!currentFolder) return [];

    const childrenIds = currentFolder.childrenIds || [];
    const files = childrenIds.map((fileId) => fileMap[fileId]).filter(Boolean);
    return files;
  }, [currentFolderId, fileMap]);
};

export const useFolderChain = (fileMap, currentFolderId) => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    if (!currentFolder) return [];

    const folderChain = [currentFolder];

    let parentId = currentFolder.parentId;
    while (parentId) {
      const parentFile = fileMap[parentId];
      if (parentFile) {
        folderChain.unshift(parentFile);
        parentId = parentFile.parentId;
      } else {
        break;
      }
    }

    return folderChain;
  }, [currentFolderId, fileMap]);
};

export const useFileActionHandler = (
  setCurrentFolderName,
  setCurrentFolderId,
  setOpenUploadModal,
  setOpenCreateFolderModal,
  mediaActions,
  mediaType,
  setRemoteMediaManagerVisible,
  checkForType,
  refreshData
) => {
  const { deleteMediaFile, deleteMediaFolder, createMediaFolder, fetchFiles } =
    useMediaManager();

  return useCallback(
    async (data) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];

        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          setCurrentFolderId(fileToOpen.id);
          setCurrentFolderName(fileToOpen.name);
          // Files will be fetched by useEffect if not already cached
          return;
        }

        // Handle file selection for media
        if (!mediaActions || !mediaActions.length) return;

        const [media, setMedia] = mediaActions;

        if (checkForType(targetFile.name, mediaType)) {
          if (mediaActions[2]) {
            // Multiple selection mode
            if (mediaActions[2] === "multiple") {
              setMedia([
                ...media,
                { name: targetFile.name, link: targetFile.link },
              ]);
              showActionNotification(data);
              setRemoteMediaManagerVisible(false);
              return;
            }
            // Custom setter with additional parameter
            setMedia(mediaActions[2], {
              name: targetFile.name,
              link: targetFile.link,
            });
            showActionNotification(data);
            setRemoteMediaManagerVisible(false);
            return;
          }
          // Single selection mode
          setMedia({
            name: targetFile.name,
            link: targetFile.link,
          });
          showActionNotification(data);
          setRemoteMediaManagerVisible(false);
          return;
        } else {
          openNotificationWithIcon(
            "error",
            "Invalid file type",
            `This file type is not compatible with ${mediaType} selection.`
          );
        }
      } else if (data.id === "delete_files" || data.id === "delete_folders") {
        try {
          const filesToDelete = data.state.selectedFilesForAction;

          // Separate files and folders
          const files = filesToDelete.filter((f) => !f.isDir);
          const foldersToDelete = filesToDelete.filter((f) => f.isDir);

          // Delete files first
          for (const file of files) {
            await deleteMediaFile(file.parentId, file.id);
          }

          // Then delete folders
          for (const folder of foldersToDelete) {
            await deleteMediaFolder(folder.id);
          }

          showActionNotification(data);
          openNotificationWithIcon("success", "Items deleted successfully", "");
        } catch (error) {
          console.error("Error deleting items:", error);
          openNotificationWithIcon(
            "error",
            "Delete failed",
            error.message || "Unable to delete selected items"
          );
        }
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        setOpenUploadModal(true);
      } else if (data.id === ChonkyActions.CreateFolder.id) {
        setOpenCreateFolderModal(true);
      }
    },
    [
      deleteMediaFile,
      deleteMediaFolder,
      mediaActions,
      mediaType,
      setRemoteMediaManagerVisible,
      setCurrentFolderId,
      setCurrentFolderName,
    ]
  );
};

// Updated checkForType function to work with the new media types
function checkForType(filename, fileType) {
  if (!filename) return false;

  const parts = filename.split(".");
  const ext = parts[parts.length - 1]?.toLowerCase();

  if (!ext) return false;

  switch (fileType) {
    case "picture":
    case "images":
      return [
        "png",
        "jpeg",
        "jpg",
        "tiff",
        "gif",
        "bmp",
        "webp",
        "svg",
      ].includes(ext);

    case "video":
    case "videos":
      return [
        "m4v",
        "avi",
        "mpg",
        "mp4",
        "mov",
        "wmv",
        "flv",
        "webm",
        "mkv",
      ].includes(ext);

    case "document":
    case "docs":
      return [
        "pdf",
        "doc",
        "docx",
        "txt",
        "rtf",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ].includes(ext);

    case "audio":
    case "voiceOvers":
    case "musics":
      return ["mp3", "wav", "aac", "ogg", "flac", "m4a", "wma"].includes(ext);

    case "other":
    default:
      return true; // Allow any file type for "other"
  }
}

// Create Folder Modal Component
const CreateFolderModal = ({ visible, onClose, onSuccess }) => {
  const [folderName, setFolderName] = useState("");
  const [mediaType, setMediaType] = useState("other");
  const [loading, setLoading] = useState(false);
  const { createMediaFolder } = useMediaManager();

  const handleCreate = async () => {
    if (!folderName.trim()) {
      openNotificationWithIcon(
        "warning",
        "Invalid input",
        "Please enter a folder name"
      );
      return;
    }

    setLoading(true);
    try {
      await createMediaFolder({ name: folderName.trim(), mediaType });
      setFolderName("");
      setMediaType("other");
      onClose();
      onSuccess?.();
      openNotificationWithIcon(
        "success",
        "Folder created",
        `${folderName} has been created successfully`
      );
    } catch (error) {
      console.error("Error creating folder:", error);
      openNotificationWithIcon(
        "error",
        "Failed to create folder",
        error.message || "Unable to create folder"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Folder</h3>
        <div className="form-group">
          <label>Folder Name:</label>

          <Input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter folder name"
            autoFocus
            style={{
              padding: "4px 11px",
            }}
          />
        </div>
        <div className="form-group">
          <label>Media Type:</label>
          <Select
            value={mediaType}
            onChange={(value) => setMediaType(value)}
            style={{ width: "100%" }}
          >
            <Select.Option value="picture">Picture</Select.Option>
            <Select.Option value="video">Video</Select.Option>
            <Select.Option value="audio">Audio</Select.Option>
            <Select.Option value="document">Document</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Button
            type="primary"
            onClick={handleCreate}
            disabled={loading || !folderName.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export const VFSBrowser = React.memo((props) => {
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);

  const {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    refreshData,
    loading,
  } = useCustomFileMap();

  const files = useFiles(fileMap, currentFolderId);
  const folderChain = useFolderChain(fileMap, currentFolderId);
  const mediaActions = props.actions;
  const mediaType = props.mediaType;
  const setRemoteMediaManagerVisible = props.setRemoteMediaManagerVisible;

  const handleFileAction = useFileActionHandler(
    setCurrentFolderName,
    setCurrentFolderId,
    setOpenUploadModal,
    setOpenCreateFolderModal,
    mediaActions,
    mediaType,
    setRemoteMediaManagerVisible,
    checkForType,
    refreshData
  );

  // Create separate actions for deleting files vs folders (context menu only)
  const deleteFilesAction = useMemo(
    () => ({
      id: "delete_files",
      button: {
        name: "Delete Files",
        toolbar: false,
        contextMenu: true,
        group: "Actions",
        icon: ChonkyActions.DeleteFiles.button.icon,
      },
      hotkeys: ["Delete"],
    }),
    []
  );

  const deleteFoldersAction = useMemo(
    () => ({
      id: "delete_folders",
      button: {
        name: "Delete Folder",
        toolbar: false,
        contextMenu: true,
        group: "Actions",
        icon: ChonkyActions.DeleteFiles.button.icon,
      },
      hotkeys: ["Delete"],
    }),
    []
  );

  const fileActions = useMemo(() => {
    const actions = [];

    // Add appropriate delete action based on current location
    if (currentFolderId === "root") {
      // In root, we're dealing with folders
      actions.push(deleteFoldersAction);
      actions.push(ChonkyActions.CreateFolder);
    } else {
      // In a folder, we're dealing with files
      actions.push(deleteFilesAction);
      actions.push(ChonkyActions.UploadFiles);
    }

    return actions;
  }, [currentFolderId, deleteFilesAction, deleteFoldersAction]);

  const thumbnailGenerator = useCallback(
    (file) => (file.thumbnailUrl ? file.thumbnailUrl : null),
    []
  );

  // Handle successful folder creation
  const handleFolderCreated = useCallback(() => {
    // Context will automatically update the folders list
    // No need to manually refresh since the context handles caching
  }, []);

  // Handle successful file upload
  const handleFileUploaded = useCallback(() => {
    // Context will automatically update the files list
    // No need to manually refresh since the context handles caching
  }, []);

  return (
    <>
      <div style={{ height: "100vh", position: "relative" }}>
        <MediaFileUploader
          currentFolderId={currentFolderId}
          currentFolderName={currentFolderName}
          visible={openUploadModal}
          onSuccess={handleFileUploaded}
          setVisible={setOpenUploadModal}
        />

        <CreateFolderModal
          visible={openCreateFolderModal}
          onClose={() => setOpenCreateFolderModal(false)}
          onSuccess={handleFolderCreated}
        />

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Loading...</div>
          </div>
        )}

        <FullFileBrowser
          files={files}
          folderChain={folderChain}
          fileActions={fileActions}
          onFileAction={handleFileAction}
          thumbnailGenerator={thumbnailGenerator}
          disableSelection={loading}
          {...props}
        />
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          width: 400px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #555;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        .modal-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .modal-actions button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .modal-actions button:first-child {
          background: #1890ff;
          color: white;
          border-color: #1890ff;
        }

        .modal-actions button:first-child:hover:not(:disabled) {
          background: #40a9ff;
        }

        .modal-actions button:first-child:disabled {
          background: #f5f5f5;
          color: #bbb;
          cursor: not-allowed;
        }

        .modal-actions button:last-child:hover {
          border-color: #40a9ff;
          color: #40a9ff;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .loading-spinner {
          padding: 12px 24px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          font-size: 14px;
          color: #666;
        }
      `}</style>
    </>
  );
});
