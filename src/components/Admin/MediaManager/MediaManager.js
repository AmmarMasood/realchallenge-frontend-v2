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
import { Button, Input, notification, Select, Modal, message } from "antd";

const { confirm } = Modal;

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
    moveMediaFile,
  } = useMediaManager();

  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [currentFolderName, setCurrentFolderName] = useState("Media Manager");
  const [lastViewedPath, setLastViewedPath] = useState("root");
  const currentFolderIdRef = useRef(currentFolderId);

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));
    // Only fetch folders on initial load
    fetchFolders();
    currentFolderIdRef.current = currentFolderId;

    // Remember last viewed path
    const savedPath = localStorage.getItem("mediaManager_lastPath");
    if (savedPath && savedPath !== "root") {
      setCurrentFolderId(savedPath);
      setLastViewedPath(savedPath);
    }
  }, []);

  // Fetch files when entering a folder (only if not already cached)
  useEffect(() => {
    if (currentFolderId !== "root" && !filesByFolder[currentFolderId]) {
      fetchFiles(currentFolderId);
    }

    // Save current path
    localStorage.setItem("mediaManager_lastPath", currentFolderId);
    setLastViewedPath(currentFolderId);
  }, [currentFolderId, filesByFolder, fetchFiles]);

  // Build folder hierarchy with proper nesting
  const buildFolderHierarchy = useCallback((folders) => {
    const folderMap = new Map();
    const rootFolders = [];

    // Create folder map with hierarchy info
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
  }, []);

  // Convert context data to Chonky file map format with hierarchy
  const fileMap = useMemo(() => {
    const { folderMap, rootFolders } = buildFolderHierarchy(folders);

    const newFileMap = {
      root: {
        id: "root",
        name: "Media Manager",
        isDir: true,
        childrenIds: rootFolders.map((folder) => folder._id),
        depth: -1,
        canDropFiles: false, // Root can't accept file drops
        droppable: false,
        draggable: false,
      },
    };

    // Add all folders to file map with proper parent-child relationships
    folderMap.forEach((folder, folderId) => {
      const childFiles = filesByFolder[folderId] || [];

      // Get immediate child folders (direct children only)
      const immediateChildFolders = folders.filter(
        (f) => f.parentId === folderId
      );

      newFileMap[folderId] = {
        id: folderId,
        name: folder.name,
        isDir: true,
        parentId: folder.parentId || "root",
        childrenIds: [
          ...immediateChildFolders.map((f) => f._id),
          ...childFiles.map((f) => f._id),
        ],
        mediaType: folder.mediaType,
        createdAt: folder.createdAt,
        depth: folder.depth || 0,
        canCreateSubfolder: (folder.depth || 0) < 2, // Can create subfolder if depth < 2
        canDropFiles: true, // Folders can accept file drops
        droppable: true, // Important: Make folder a drop target
        draggable: false, // Folders shouldn't be draggable
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
          size: file.size,
          draggable: true, // Important: Enable dragging
          droppable: false, // Files cannot be drop targets
        };
      });
    });

    return newFileMap;
  }, [folders, filesByFolder, buildFolderHierarchy]);

  // Get current folder depth
  const getCurrentDepth = useCallback(() => {
    const currentFolder = fileMap[currentFolderId];
    return currentFolder?.depth ?? -1;
  }, [fileMap, currentFolderId]);

  // Check if name is unique in current folder
  const isNameUnique = useCallback(
    (name, parentId, excludeId = null) => {
      const parent = fileMap[parentId];
      if (!parent) return true;

      return !parent.childrenIds.some((childId) => {
        const child = fileMap[childId];
        return child && child.name === name && child.id !== excludeId;
      });
    },
    [fileMap]
  );

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
    getCurrentDepth,
    isNameUnique,
    lastViewedPath,
    moveMediaFile,
  };
};

export const useFiles = (fileMap, currentFolderId) => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    if (!currentFolder) return [];

    const childrenIds = currentFolder.childrenIds || [];
    const files = childrenIds.map((fileId) => fileMap[fileId]).filter(Boolean);

    // Sort: folders first, then files, both alphabetically
    return files.sort((a, b) => {
      if (a.isDir !== b.isDir) {
        return a.isDir ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
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

// Enhanced File Action Handler with drag and drop support
export const useFileActionHandler = (
  setCurrentFolderName,
  setCurrentFolderId,
  setOpenUploadModal,
  setOpenCreateFolderModal,
  setOpenRenameModal,
  setRenameTarget,
  mediaActions,
  mediaType,
  setRemoteMediaManagerVisible,
  checkForType,
  refreshData,
  isNameUnique,
  getCurrentDepth,
  moveMediaFile
) => {
  const { deleteMediaFile, deleteMediaFolder, updateMediaFile } =
    useMediaManager();

  const confirmDelete = useCallback((items, onConfirm) => {
    const hasFiles = items.some((item) => !item.isDir);
    const hasFolders = items.some((item) => item.isDir);

    let title = "Confirm Delete";
    let content = "";

    if (hasFolders && hasFiles) {
      content = `Are you sure you want to delete ${items.length} items? This action cannot be undone.`;
    } else if (hasFolders) {
      const folderWord = items.length === 1 ? "folder" : "folders";
      content = `Are you sure you want to delete ${items.length} ${folderWord}? All contents will be permanently deleted.`;
    } else {
      const fileWord = items.length === 1 ? "file" : "files";
      content = `Are you sure you want to delete ${items.length} ${fileWord}? This action cannot be undone.`;
    }

    confirm({
      title,
      content,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: onConfirm,
      bodyStyle: {
        backgroundColor: "#fff",
      },
    });
  }, []);

  // Handle file preview in new tab
  const handlePreviewFile = useCallback((file) => {
    if (!file || !file.link) {
      message.error("File link not available");
      return;
    }

    // Open file in new tab
    window.open(file.link, "_blank", "noopener,noreferrer");

    // Show notification
    openNotificationWithIcon(
      "info",
      "Opening Preview",
      `Opening ${file.name} in new tab`
    );
  }, []);

  // Handle file/folder drop - FIXED VERSION
  const handleDrop = useCallback(
    async (data) => {
      console.log("Drop data received:", data);
      console.log("Drop payload:", data.payload);

      // The correct payload structure for Chonky drag and drop
      const { files, source, destination } = data.payload;

      // Alternative payload structure (try both)
      const draggedFiles = files || data.payload.draggedFiles;
      const targetFolder = destination || data.payload.targetFolder;

      console.log("Parsed - draggedFiles:", draggedFiles);
      console.log("Parsed - targetFolder:", targetFolder);
      console.log("Parsed - source:", source);
      console.log("Parsed - destination:", destination);

      if (!targetFolder || !targetFolder.isDir) {
        console.log("Invalid target folder:", targetFolder);
        message.error("Cannot drop files here - invalid target");
        return;
      }

      if (!targetFolder.canDropFiles) {
        console.log("Target folder cannot accept drops:", targetFolder);
        message.error("This folder cannot accept file drops");
        return;
      }

      if (!draggedFiles || draggedFiles.length === 0) {
        console.log("No files to drop");
        message.error("No files selected for drop");
        return;
      }

      // Filter only files (not folders) for moving
      const filesToMove = draggedFiles.filter((file) => !file.isDir);

      if (filesToMove.length === 0) {
        message.info("Only files can be moved between folders");
        return;
      }

      // Check if any files are being dropped into the same folder
      const validMoves = filesToMove.filter(
        (file) => file.parentId !== targetFolder.id
      );

      if (validMoves.length === 0) {
        message.info("Files are already in this folder");
        return;
      }

      try {
        // Move each file
        for (const file of validMoves) {
          console.log(
            `Moving file ${file.name} from ${file.parentId} to ${targetFolder.id}`
          );
          await moveMediaFile(file.id, file.parentId, targetFolder.id);
        }

        message.success(
          `Moved ${validMoves.length} file(s) to ${targetFolder.name}`
        );
        openNotificationWithIcon(
          "success",
          "Files Moved",
          `${validMoves.length} file(s) moved to ${targetFolder.name}`
        );
      } catch (error) {
        console.error("Error moving files:", error);
        message.error(error.message || "Failed to move files");
      }
    },
    [moveMediaFile]
  );

  return useCallback(
    async (data) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];

        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          setCurrentFolderId(fileToOpen.id);
          setCurrentFolderName(fileToOpen.name);
          return;
        }

        // Handle file selection for media
        if (!mediaActions || !mediaActions.length) return;

        const [media, setMedia] = mediaActions;

        if (checkForType(targetFile.name, mediaType)) {
          if (mediaActions[2]) {
            if (mediaActions[2] === "multiple") {
              setMedia([
                ...media,
                { name: targetFile.name, link: targetFile.link },
              ]);
              showActionNotification(data);
              setRemoteMediaManagerVisible(false);
              return;
            }
            setMedia(mediaActions[2], {
              name: targetFile.name,
              link: targetFile.link,
            });
            showActionNotification(data);
            setRemoteMediaManagerVisible(false);
            return;
          }
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
      } else if (
        data.id === ChonkyActions.MoveFiles.id ||
        data.id === "move_files"
      ) {
        // Handle drag and drop - FIXED
        await handleDrop(data);
      } else if (data.id === "delete_files" || data.id === "delete_folders") {
        const filesToDelete = data.state.selectedFilesForAction;

        confirmDelete(filesToDelete, async () => {
          try {
            const files = filesToDelete.filter((f) => !f.isDir);
            const foldersToDelete = filesToDelete.filter((f) => f.isDir);

            for (const file of files) {
              await deleteMediaFile(file.parentId, file.id);
            }

            for (const folder of foldersToDelete) {
              await deleteMediaFolder(folder.id);
            }

            showActionNotification(data);
            openNotificationWithIcon(
              "success",
              "Items deleted successfully",
              ""
            );
          } catch (error) {
            console.error("Error deleting items:", error);
            openNotificationWithIcon(
              "error",
              "Delete failed",
              error.message || "Unable to delete selected items"
            );
          }
        });
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        setOpenUploadModal(true);
      } else if (data.id === ChonkyActions.CreateFolder.id) {
        setOpenCreateFolderModal(true);
      } else if (data.id === "rename_item") {
        const item = data.state.selectedFilesForAction[0];
        if (item) {
          setRenameTarget(item);
          setOpenRenameModal(true);
        }
      } else if (data.id === "preview_file") {
        const item = data.state.selectedFilesForAction[0];
        if (item && !item.isDir) {
          handlePreviewFile(item);
        }
      }
    },
    [
      deleteMediaFile,
      deleteMediaFolder,
      updateMediaFile,
      mediaActions,
      mediaType,
      setRemoteMediaManagerVisible,
      setCurrentFolderId,
      setCurrentFolderName,
      confirmDelete,
      handleDrop,
    ]
  );
};

// Updated checkForType function
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
      return true;
  }
}

// Create Folder Modal with hierarchy support
const CreateFolderModal = ({
  visible,
  onClose,
  onSuccess,
  currentFolderId,
  getCurrentDepth,
  isNameUnique,
}) => {
  const [folderName, setFolderName] = useState("");
  const [mediaType, setMediaType] = useState("other");
  const [loading, setLoading] = useState(false);
  const { createMediaFolder } = useMediaManager();

  const handleCreate = async () => {
    if (!folderName.trim()) {
      message.warning("Please enter a folder name");
      return;
    }

    if (!isNameUnique(folderName.trim(), currentFolderId)) {
      message.error("A folder with this name already exists");
      return;
    }

    const currentDepth = getCurrentDepth();
    if (currentDepth >= 2) {
      message.error("Maximum folder depth reached (3 levels)");
      return;
    }

    setLoading(true);
    try {
      const parentId = currentFolderId === "root" ? null : currentFolderId;
      await createMediaFolder({
        name: folderName.trim(),
        mediaType,
        parentId,
      });

      setFolderName("");
      setMediaType("other");
      onClose();
      onSuccess?.();
      message.success(`Folder "${folderName}" created successfully`);
    } catch (error) {
      console.error("Error creating folder:", error);
      message.error(error.message || "Failed to create folder");
    } finally {
      setLoading(false);
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
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onPressEnter={handleCreate}
            placeholder="Enter folder name"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Media Type:</label>
          <Select
            value={mediaType}
            onChange={setMediaType}
            style={{ width: "100%" }}
          >
            <Select.Option value="picture">Picture</Select.Option>
            <Select.Option value="video">Video</Select.Option>
            <Select.Option value="audio">Audio</Select.Option>
            <Select.Option value="document">Document</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </div>
        <div className="modal-actions">
          <Button type="primary" onClick={handleCreate} loading={loading}>
            Create
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

// Rename Modal with backend integration
const RenameModal = ({ visible, onClose, onSuccess, target, isNameUnique }) => {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateMediaFolder, updateMediaFile } = useMediaManager();

  useEffect(() => {
    if (target) {
      setNewName(target.name);
    }
  }, [target]);

  const handleRename = async () => {
    if (!newName.trim()) {
      message.warning("Please enter a name");
      return;
    }

    if (newName === target.name) {
      onClose();
      return;
    }

    if (!isNameUnique(newName.trim(), target.parentId, target.id)) {
      message.error("An item with this name already exists");
      return;
    }

    setLoading(true);
    try {
      if (target.isDir) {
        await updateMediaFolder(target.id, { name: newName.trim() });
      } else {
        await updateMediaFile(target.parentId, target.id, {
          originalName: newName.trim(),
        });
      }

      onClose();
      onSuccess?.();
      message.success(`Renamed to "${newName}"`);
    } catch (error) {
      console.error("Error renaming:", error);
      message.error(error.message || "Failed to rename");
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !target) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Rename {target.isDir ? "Folder" : "File"}</h3>
        <div className="form-group">
          <label>New Name:</label>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleRename}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <Button type="primary" onClick={handleRename} loading={loading}>
            Rename
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced VFSBrowser with all features including drag and drop
export const VFSBrowser = React.memo((props) => {
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    refreshData,
    loading,
    getCurrentDepth,
    isNameUnique,
    moveMediaFile,
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
    setOpenRenameModal,
    setRenameTarget,
    mediaActions,
    mediaType,
    setRemoteMediaManagerVisible,
    checkForType,
    refreshData,
    isNameUnique,
    getCurrentDepth,
    moveMediaFile
  );

  // Enhanced file actions with depth-aware logic and drag and drop
  const fileActions = useMemo(() => {
    const actions = [];
    const currentDepth = getCurrentDepth();
    const canCreateSubfolder = currentDepth < 2;

    // Enable drag and drop
    actions.push(ChonkyActions.EnableDragAndDrop);

    if (currentFolderId === "root") {
      // Root level actions
      actions.push({
        id: "delete_folders",
        button: {
          name: "Delete Folder",
          toolbar: false,
          contextMenu: true,
          group: "Actions",
          icon: ChonkyActions.DeleteFiles.button.icon,
        },
        hotkeys: ["Delete"],
      });

      if (canCreateSubfolder) {
        actions.push(ChonkyActions.CreateFolder);
      }
    } else {
      // Inside folder actions
      actions.push({
        id: "delete_files",
        button: {
          name: "Delete Items",
          toolbar: false,
          contextMenu: true,
          group: "Actions",
          icon: ChonkyActions.DeleteFiles.button.icon,
        },
        hotkeys: ["Delete"],
      });

      actions.push(ChonkyActions.UploadFiles);

      if (canCreateSubfolder) {
        actions.push(ChonkyActions.CreateFolder);
      }

      // Add preview action for files only
      actions.push({
        id: "preview_file",
        button: {
          name: "Preview",
          toolbar: false,
          contextMenu: true,
          group: "Actions",
        },
        fileFilter: (file) => !file.isDir, // Only show for files, not folders
      });
    }

    // Add rename action (always available)
    actions.push({
      id: "rename_item",
      button: {
        name: "Rename",
        toolbar: false,
        contextMenu: true,
        group: "Actions",
      },
      hotkeys: ["F2"],
    });

    return actions;
  }, [currentFolderId, getCurrentDepth]);

  const thumbnailGenerator = useCallback(
    (file) => (file.thumbnailUrl ? file.thumbnailUrl : null),
    []
  );

  return (
    <>
      <div style={{ height: "100vh", position: "relative" }}>
        <MediaFileUploader
          currentFolderId={currentFolderId}
          currentFolderName={currentFolderName}
          visible={openUploadModal}
          onSuccess={() => {}}
          setVisible={setOpenUploadModal}
        />

        <CreateFolderModal
          visible={openCreateFolderModal}
          onClose={() => setOpenCreateFolderModal(false)}
          onSuccess={() => {}}
          currentFolderId={currentFolderId}
          getCurrentDepth={getCurrentDepth}
          isNameUnique={isNameUnique}
        />

        <RenameModal
          visible={openRenameModal}
          onClose={() => setOpenRenameModal(false)}
          onSuccess={() => {}}
          target={renameTarget}
          isNameUnique={isNameUnique}
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
          disableToolbar={true}
          disableDefaultFileActions={true}
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

        .modal-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 20px;
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

        /* Drag and Drop Visual Feedback */
        .chonky-file-browser .chonky-file-list-entry.chonky-dnd-drop-target {
          background-color: #e6f7ff !important;
          border: 2px dashed #1890ff !important;
          border-radius: 4px;
        }

        .chonky-file-browser .chonky-file-list-entry.chonky-dnd-can-drop {
          border: 1px solid #d9d9d9;
          background-color: #fafafa;
        }

        .chonky-file-browser .chonky-file-list-entry.chonky-dnd-dragging {
          opacity: 0.5;
        }

        /* Custom drop zone styling for folders */
        .chonky-file-browser .chonky-file-list-entry[data-is-dir="true"]:hover {
          background-color: #f0f8ff;
          transition: background-color 0.2s ease;
        }

        /* Enhanced folder highlighting during drag operations */
        .chonky-file-browser
          .chonky-file-list-entry[data-is-dir="true"].chonky-dnd-can-drop:hover {
          background-color: #e6f7ff;
          border: 1px solid #40a9ff;
        }
      `}</style>
    </>
  );
});
