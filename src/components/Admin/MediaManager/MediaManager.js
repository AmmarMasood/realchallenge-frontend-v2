import { ChonkyActions, FileHelper, FullFileBrowser } from "chonky";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactModal from "react-modal";
import ReactPlayer from "react-player";

import { showActionNotification } from "./mediaManagerUtils";
import MediaFileUploader from "./MediaFileUploader";
import AdminSearchPanel from "./AdminSearchPanel";
import { useMediaManager } from "../../../contexts/MediaManagerContext";
import setAuthToken from "../../../helpers/setAuthToken";
import {
  Button,
  Input,
  notification,
  Select,
  message,
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Divider,
  Switch,
  Tooltip,
  Modal,
  Tabs,
} from "antd";
import {
  UserOutlined,
  FolderOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  EyeOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  CloseOutlined,
  SearchOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { userInfoContext } from "../../../contexts/UserStore";

const { confirm } = Modal;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Admin Users Table Component
const AdminUsersView = ({ onSelectUser, usersData, loading }) => {
  const getMediaTypeColor = (mediaType) => {
    const colors = {
      video: "red",
      audio: "orange",
      picture: "green",
      document: "blue",
      other: "gray",
    };
    return colors[mediaType] || "gray";
  };

  const buildUserFolderTree = (folders) => {
    return folders.map((folder) => (
      <div key={folder._id} style={{ marginBottom: "4px" }}>
        <Space size="small">
          <FolderOutlined style={{ color: "#1890ff" }} />
          <Text>{folder.name}</Text>
          <Tag color={getMediaTypeColor(folder.mediaType)} size="small">
            {folder.mediaType}
          </Tag>
        </Space>
        {folder.children && folder.children.length > 0 && (
          <div style={{ marginLeft: "20px", marginTop: "4px" }}>
            {buildUserFolderTree(folder.children)}
          </div>
        )}
      </div>
    ));
  };

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: "bold" }}>{user.name}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {user.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Total Folders",
      dataIndex: "totalFolders",
      key: "totalFolders",
      align: "center",
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onSelectUser(record.user)}
          >
            View Folders
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>
        <SettingOutlined /> Admin - All Users Media
      </Title>
      <Text type="secondary">
        Select a user to view and manage their media folders and files.
      </Text>

      <Divider />

      <Table
        columns={columns}
        dataSource={usersData}
        rowKey={(record) => record.user._id}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div
              style={{ margin: 0, padding: "16px", backgroundColor: "#f9f9f9" }}
            >
              <Title level={5}>Folder Structure for {record.user.name}</Title>
              {record.folders && record.folders.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {buildUserFolderTree(record.folders)}
                </div>
              ) : (
                <Text type="secondary">No folders found</Text>
              )}
            </div>
          ),
          rowExpandable: (record) =>
            record.folders && record.folders.length > 0,
        }}
      />
    </Card>
  );
};

// Hook that sets up our file map using the MediaManagerContext with admin support
const useCustomFileMap = () => {
  const {
    folders,
    filesByFolder,
    loadingFolders,
    loadingFiles,
    fetchFolders,
    fetchFiles,
    moveMediaFile,
    // Admin functions
    adminMode,
    usersData,
    currentViewingUserId,
    loadingUsers,
    enableAdminMode,
    disableAdminMode,
    fetchAllUsersData,
    fetchUserFolders,
    getCurrentContext,
    // Copy/paste functions
    clipboardFiles,
    cutFilesToClipboard,
    pasteFilesFromClipboard,
    clearClipboard,
    // Cache management
    clearFilesByFolderCache,
  } = useMediaManager();

  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [currentFolderName, setCurrentFolderName] = useState("Media Manager");
  const [lastViewedPath, setLastViewedPath] = useState("root");
  const [showAdminView, setShowAdminView] = useState(false);
  const [folderViewModes, setFolderViewModes] = useState({});
  const [forceRefreshFiles, setForceRefreshFiles] = useState(false); // Flag to force file refresh after main refresh
  const [currentViewMode, setCurrentViewMode] = useState("grid");
  const [adminActiveTab, setAdminActiveTab] = useState("users");
  const currentFolderIdRef = useRef(currentFolderId);

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));

    if (adminMode && !currentViewingUserId) {
      // In admin mode but not viewing specific user - show users list
      fetchAllUsersData();
    } else if (!adminMode) {
      // Regular user mode - fetch their folders
      fetchFolders();
    }

    currentFolderIdRef.current = currentFolderId;

    // Load view mode preferences from localStorage
    const savedViewModes = localStorage.getItem("mediaManager_viewModes");
    if (savedViewModes) {
      try {
        setFolderViewModes(JSON.parse(savedViewModes));
      } catch (error) {
        console.error("Error loading view modes:", error);
      }
    }

    // Remember last viewed path (only for regular user mode)
    if (!adminMode) {
      const savedPath = localStorage.getItem("mediaManager_lastPath");
      if (savedPath && savedPath !== "root") {
        setCurrentFolderId(savedPath);
        setLastViewedPath(savedPath);
      }
    }
  }, [adminMode, currentViewingUserId]);

  // Fetch files when entering a folder
  useEffect(() => {
    if (
      currentFolderId !== "root" &&
      (!filesByFolder[currentFolderId] || forceRefreshFiles) &&
      !adminMode
    ) {
      console.log("📁 FETCH: Fetching files for folder (user mode):", currentFolderId, "Force:", forceRefreshFiles);
      fetchFiles(currentFolderId);
    } else if (
      currentFolderId !== "root" &&
      (!filesByFolder[currentFolderId] || forceRefreshFiles) &&
      adminMode &&
      currentViewingUserId
    ) {
      console.log("📁 FETCH: Fetching files for folder (admin mode):", currentFolderId, "Force:", forceRefreshFiles);
      fetchFiles(currentFolderId);
    }

    // Reset the force refresh flag after use
    if (forceRefreshFiles) {
      setForceRefreshFiles(false);
    }

    // Save current path (only for regular users)
    if (!adminMode) {
      localStorage.setItem("mediaManager_lastPath", currentFolderId);
      setLastViewedPath(currentFolderId);
    }

    // Update current view mode based on folder preference
    const savedViewMode = folderViewModes[currentFolderId] || "grid";
    setCurrentViewMode(savedViewMode);
  }, [
    currentFolderId,
    filesByFolder,
    fetchFiles,
    adminMode,
    currentViewingUserId,
    folderViewModes,
    forceRefreshFiles,
  ]);

  // Handle admin mode toggle
  const handleAdminModeToggle = async (checked) => {
    if (checked) {
      const success = enableAdminMode();
      if (success) {
        setShowAdminView(true);
        setCurrentFolderId("root");
        setCurrentFolderName("Admin - Users Overview");
        await fetchAllUsersData();
      }
    } else {
      disableAdminMode();
      setShowAdminView(false);
      setCurrentFolderId("root");
      setCurrentFolderName("Media Manager");
      await fetchFolders();
    }
  };

  // Handle user selection in admin mode
  const handleSelectUser = async (user) => {
    try {
      console.log("👤 USER_SELECT: Selecting user:", user);
      console.log("👤 USER_SELECT: Calling fetchUserFolders WITHOUT force flag");
      await fetchUserFolders(user._id);
      console.log("👤 USER_SELECT: Completed fetchUserFolders for:", user.name);
      setCurrentFolderId("root");
      setCurrentFolderName(`${user.name}'s Media`);
      setShowAdminView(false);
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  // Handle back to users list
  const handleBackToUsersList = () => {
    setShowAdminView(true);
    setCurrentFolderId("root");
    setCurrentFolderName("Admin - Users Overview");
  };

  // Handle view mode change
  const handleViewModeChange = (newViewMode) => {
    const updatedViewModes = {
      ...folderViewModes,
      [currentFolderId]: newViewMode,
    };
    setFolderViewModes(updatedViewModes);
    setCurrentViewMode(newViewMode);

    // Save to localStorage
    localStorage.setItem(
      "mediaManager_viewModes",
      JSON.stringify(updatedViewModes)
    );
  };

  // Build folder hierarchy using the pre-built children arrays from backend
  const buildFolderHierarchy = useCallback((folders) => {
    console.log("🏗️ HIERARCHY: Building folder hierarchy with", folders.length, "folders");
    console.log("🏗️ HIERARCHY: Using backend children arrays instead of parentId relationships");
    console.log("🏗️ HIERARCHY: Input folders detailed:", JSON.stringify(folders.map(f => ({
      name: f.name,
      id: f._id,
      children: f.children?.map(c => ({ name: c.name, id: c._id })) || []
    })), null, 2));

    const folderMap = new Map();
    const rootFolders = [];

    // Recursive function to add folders and their children to the map
    const addFolderToMap = (folder, depth = 0) => {
      const stringId = String(folder._id);
      console.log(`🏗️ HIERARCHY: Adding folder to map: ${folder.name} (${stringId}) depth: ${depth}`);

      const folderData = {
        ...folder,
        children: folder.children || [],
        depth: depth,
      };

      folderMap.set(stringId, folderData);

      // Recursively add children
      if (folder.children && folder.children.length > 0) {
        console.log(`🏗️ HIERARCHY: ${folder.name} has ${folder.children.length} children:`, folder.children.map(c => c.name));
        folder.children.forEach(child => {
          addFolderToMap(child, depth + 1);
        });
      }

      return folderData;
    };

    // Process top-level folders and their children recursively
    folders.forEach((folder) => {
      if (!folder.parentId) { // Root level folders
        const folderData = addFolderToMap(folder, 0);
        rootFolders.push(folderData);
      }
    });

    console.log("🏗️ HIERARCHY: FolderMap keys:", Array.from(folderMap.keys()));
    console.log("🏗️ HIERARCHY: Final root folders:", rootFolders.map(f => f.name));
    console.log("🏗️ HIERARCHY: All folders in map:", Array.from(folderMap.values()).map(f => ({
      name: f.name,
      id: f._id,
      depth: f.depth,
      childrenCount: f.children?.length || 0,
      childrenNames: f.children?.map(c => c.name) || []
    })));

    return { folderMap, rootFolders };
  }, []);

  // Convert context data to Chonky file map format with hierarchy
  const fileMap = useMemo(() => {
    console.log("📊 FILEMAP: Creating fileMap, folders data:", folders);
    console.log("📊 FILEMAP: Folders count:", folders?.length || 0);
    console.log("📊 FILEMAP: AdminMode:", adminMode, "ShowAdminView:", showAdminView, "CurrentViewingUserId:", currentViewingUserId);

    // Don't show file map when in admin users view
    if (showAdminView) {
      return {
        root: {
          id: "root",
          name: "Admin - Users Overview",
          isDir: true,
          childrenIds: [],
          depth: -1,
          canDropFiles: false,
          droppable: false,
          draggable: false,
        },
      };
    }

    const { folderMap, rootFolders } = buildFolderHierarchy(folders);

    console.log("🗂️ FILEMAP: Starting fileMap creation");
    console.log("🗂️ FILEMAP: Admin mode:", adminMode, "Viewing user:", currentViewingUserId);
    console.log("🗂️ FILEMAP: Show admin view:", showAdminView);
    console.log("🗂️ FILEMAP: Folders available:", folders.length);
    console.log("🗂️ FILEMAP: Root folders:", rootFolders.length);
    console.log("🗂️ FILEMAP: filesByFolder content:", filesByFolder);
    console.log("🗂️ FILEMAP: filesByFolder keys:", Object.keys(filesByFolder));

    const newFileMap = {
      root: {
        id: "root",
        name:
          adminMode && currentViewingUserId ? `User's Media` : "Media Manager",
        isDir: true,
        childrenIds: rootFolders.map((folder) => folder._id),
        depth: -1,
        canDropFiles: false,
        droppable: false,
        draggable: false,
      },
    };

    // Add all folders to file map with proper parent-child relationships
    console.log("🗂️ FILEMAP: Processing folderMap entries:", folderMap.size);
    console.log("🗂️ FILEMAP: filesByFolder data:", filesByFolder);
    folderMap.forEach((folder, folderId) => {
      const childFiles = filesByFolder[folderId] || [];

      // Use the children array from the folder data (these are sub-folders)
      const childFolders = folder.children || [];

      console.log(`🗂️ FILEMAP: Processing folder ${folder.name} (${folderId}):`);
      console.log(`  - Child files from filesByFolder: ${childFiles.length}`);
      console.log(`  - Child folders from hierarchy: ${childFolders.length}`, childFolders.map(f => f.name));

      newFileMap[folderId] = {
        id: folderId,
        name: folder.name,
        isDir: true,
        parentId: folder.parentId || "root",
        childrenIds: [
          ...childFolders.map((f) => f._id), // Child folders from hierarchy
          ...childFiles.map((f) => f._id),   // Child files from filesByFolder
        ],
        mediaType: folder.mediaType,
        createdAt: folder.createdAt,
        depth: folder.depth || 0,
        canCreateSubfolder: (folder.depth || 0) < 2,
        canDropFiles: true,
        droppable: true,
        draggable: false,
      };
    });

    // Add files to file map for all cached folders
    Object.entries(filesByFolder).forEach(([folderId, files]) => {
      console.log(`🗂️ FILEMAP: Adding files for folder ${folderId}:`, files);
      files.forEach((file) => {
        console.log(`🗂️ FILEMAP: Processing file/item:`, {
          id: file._id,
          name: file.originalName || file.filename,
          type: file.type,
          mediaType: file.mediaType,
          isFolder: file.isFolder,
          fullItem: file
        });

        // Check if this is actually a folder that's being treated as a file
        const isActuallyFolder = file.type === 'folder' || file.isFolder === true || file.mediaType === 'folder';

        newFileMap[file._id] = {
          id: file._id,
          name: file.originalName || file.filename,
          isDir: isActuallyFolder, // Use the correct folder detection
          parentId: folderId,
          link: file.filelink,
          mediaType: file.mediaType,
          thumbnailUrl: file.thumbnailUrl || file.filelink,
          createdAt: file.createdAt,
          filename: file.filename,
          size: file.size,
          draggable: !isActuallyFolder,
          droppable: isActuallyFolder,
        };
      });
    });

    console.log("🗂️ FILEMAP: Final fileMap structure:");
    Object.entries(newFileMap).forEach(([id, item]) => {
      if (item.isDir) {
        console.log(`  📁 ${item.name} (${id}): ${item.childrenIds?.length || 0} children`, item.childrenIds);
      }
    });

    return newFileMap;
  }, [
    folders,
    filesByFolder,
    buildFolderHierarchy,
    showAdminView,
    adminMode,
    currentViewingUserId,
  ]);

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

  // Simple refresh - calls API exactly like initial user selection (no force flag for user folders)
  const refreshData = useCallback(async () => {
    console.log("🔄 REFRESH: Starting simple refresh...");

    // Clear clipboard and cache
    clearClipboard();
    clearFilesByFolderCache(); // Clear files cache to force fresh fetch

    // Reset navigation to root
    setCurrentFolderId("root");
    setLastViewedPath("root");

    if (adminMode && !currentViewingUserId) {
      // In admin users overview mode - refresh users data
      setCurrentFolderName("Admin - Users Overview");
      setShowAdminView(true);
      await fetchAllUsersData(true);
      console.log("🔄 REFRESH: Refreshed all users data");
    } else if (adminMode && currentViewingUserId) {
      // Viewing a specific user - refresh exactly like initial selection
      const currentUser = usersData?.find(user => user._id === currentViewingUserId);

      // First refresh users data to get fresh user list
      await fetchAllUsersData(true);
      console.log("🔄 REFRESH: Refreshed users data");

      // Then call fetchUserFolders WITHOUT force flag (same as initial selection)
      console.log("🔄 REFRESH: Calling fetchUserFolders WITHOUT force flag (same as handleSelectUser)");
      await fetchUserFolders(currentViewingUserId);
      console.log("🔄 REFRESH: Completed fetchUserFolders");

      if (currentUser) {
        setCurrentFolderName(`${currentUser.name}'s Media`);
      } else {
        setCurrentFolderName("User's Media");
      }
      setShowAdminView(false);
    } else {
      // Normal user mode - refresh own folders
      setCurrentFolderName("Media Manager");
      setShowAdminView(false);
      await fetchFolders(true);
      console.log("🔄 REFRESH: Refreshed own folders");
    }

    // Clear localStorage cache
    localStorage.removeItem("mediaManager_lastPath");

    // Set flag to force fresh file fetching when navigating to folders
    setForceRefreshFiles(true);
    console.log("🔄 REFRESH: Set forceRefreshFiles flag - next folder navigation will fetch fresh data");

    console.log("🔄 REFRESH: Simple refresh completed");
  }, [
    adminMode,
    currentViewingUserId,
    usersData,
    fetchAllUsersData,
    fetchUserFolders,
    fetchFolders,
    clearClipboard,
    clearFilesByFolderCache,
    setCurrentFolderId,
    setCurrentFolderName,
    setLastViewedPath,
    setShowAdminView
  ]);

  return {
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    refreshData,
    loading: loadingFolders || loadingFiles[currentFolderId] || loadingUsers,
    getCurrentDepth,
    isNameUnique,
    lastViewedPath,
    moveMediaFile,
    // View mode functionality
    currentViewMode,
    handleViewModeChange,
    // Admin specific
    isAdmin: userInfo.role === "admin",
    adminMode,
    showAdminView,
    usersData,
    currentViewingUserId,
    handleAdminModeToggle,
    handleSelectUser,
    handleBackToUsersList,
    getCurrentContext,
    // Admin tab functionality
    adminActiveTab,
    setAdminActiveTab,
    // Copy/paste functionality
    clipboardFiles,
    cutFilesToClipboard,
    pasteFilesFromClipboard,
    clearClipboard,
  };
};

export const useFiles = (fileMap, currentFolderId) => {
  return useMemo(() => {
    console.log("🗂️ FILES: Building files list for folder:", currentFolderId);
    const currentFolder = fileMap[currentFolderId];
    if (!currentFolder) {
      console.log("🗂️ FILES: No current folder found");
      return [];
    }

    console.log("🗂️ FILES: Current folder:", currentFolder.name, "Children:", currentFolder.childrenIds?.length || 0);
    const childrenIds = currentFolder.childrenIds || [];
    let files = childrenIds.map((fileId) => fileMap[fileId]).filter(Boolean);

    // Parent folder navigation removed as requested

    console.log("🗂️ FILES: Final files list:", files.map(f => ({ name: f.name, isDir: f.isDir, isParentDir: f.isParentDir })));

    // Sort: folders first, then files, all alphabetically
    return files.sort((a, b) => {
      // Folders vs files
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

// Preview Modal Component for files
const PreviewModal = ({ visible, onClose, file }) => {
  const [loading, setLoading] = useState(true);

  if (!visible || !file) return null;

  const isVideo =
    file.mediaType === "video" ||
    ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v", "mpg"].includes(
      file.name.split(".").pop()?.toLowerCase() || ""
    );

  const isImage =
    file.mediaType === "picture" ||
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"].includes(
      file.name.split(".").pop()?.toLowerCase() || ""
    );

  return (
    <ReactModal
      isOpen={visible}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 1000,
        },
        content: {
          background: "#1f1f1f",
          border: "none",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          margin: "auto",
        },
      }}
    >
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ color: "white", margin: 0 }}>{file.name}</h3>
        <CloseOutlined
          style={{
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px",
          }}
          onClick={onClose}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          position: "relative",
        }}
      >
        {isVideo ? (
          <ReactPlayer
            url={file.link}
            controls={true}
            width="100%"
            height="auto"
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
            onReady={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        ) : isImage ? (
          <>
            {loading && (
              <div
                style={{
                  position: "absolute",
                  color: "white",
                  fontSize: "16px",
                }}
              >
                Loading...
              </div>
            )}
            <img
              src={file.link}
              alt={file.name}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                display: loading ? "none" : "block",
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </>
        ) : (
          <div
            style={{
              color: "white",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <p>Preview not available for this file type.</p>
            <a
              href={file.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1890ff" }}
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>
    </ReactModal>
  );
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
  moveMediaFile,
  handleViewModeChange,
  setPreviewFile,
  setShowPreviewModal,
  cutFilesToClipboard,
  pasteFilesFromClipboard,
  clearClipboard,
  currentFolderId,
  fileMap
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

    // add that this action cannot be undone
    content += " This action cannot be undone.";

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

  // Handle file preview in popup
  const handlePreviewFile = useCallback(
    (file) => {
      if (!file || !file.link) {
        message.error("File link not available");
        return;
      }

      // Set preview file and show modal
      setPreviewFile(file);
      setShowPreviewModal(true);

      // Show notification
      openNotificationWithIcon(
        "info",
        "Opening Preview",
        `Opening ${file.name} in preview popup`
      );
    },
    [setPreviewFile, setShowPreviewModal]
  );

  // Handle cut files to clipboard
  const handleCutFiles = useCallback(
    (files) => {
      const filesToCut = files.filter((file) => !file.isDir); // Only cut files, not folders
      if (filesToCut.length === 0) {
        message.warning("No files selected to cut");
        return;
      }
      cutFilesToClipboard(filesToCut);
    },
    [cutFilesToClipboard]
  );

  // Handle paste files from clipboard
  const handlePasteFiles = useCallback(
    async (targetFolderId) => {
      try {
        await pasteFilesFromClipboard(targetFolderId);
      } catch (error) {
        console.error("Paste operation failed:", error);
      }
    },
    [pasteFilesFromClipboard]
  );

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
      if (data.id === ChonkyActions.EnableListView.id) {
        handleViewModeChange("list");
        return;
      } else if (data.id === ChonkyActions.EnableGridView.id) {
        handleViewModeChange("grid");
        return;
      } else if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];

        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          console.log("🗂️ NAVIGATION: Opening folder:", fileToOpen.name, "ID:", fileToOpen.id, "isParentDir:", fileToOpen.isParentDir);

          // Handle parent folder navigation
          if (fileToOpen.isParentDir) {
            const parentFolder = fileMap[fileToOpen.id];
            console.log("🗂️ NAVIGATION: Going to parent folder:", parentFolder ? parentFolder.name : "Media Manager");
            setCurrentFolderId(fileToOpen.id);
            setCurrentFolderName(parentFolder ? parentFolder.name : "Media Manager");
            return;
          }

          // Handle regular folder navigation
          console.log("🗂️ NAVIGATION: Entering folder:", fileToOpen.name);
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
                {
                  name: targetFile.name,
                  link: targetFile.link,
                  thumbnailUrl: targetFile.thumbnailUrl,
                },
              ]);
              showActionNotification(data);
              setRemoteMediaManagerVisible(false);
              return;
            }
            setMedia(mediaActions[2], {
              name: targetFile.name,
              link: targetFile.link,
              thumbnailUrl: targetFile.thumbnailUrl,
            });
            showActionNotification(data);
            setRemoteMediaManagerVisible(false);
            return;
          }
          setMedia({
            name: targetFile.name,
            link: targetFile.link,
            thumbnailUrl: targetFile.thumbnailUrl,
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
      } else if (data.id === "cut_files") {
        const selectedFiles = data.state.selectedFilesForAction;
        handleCutFiles(selectedFiles);
      } else if (data.id === "paste_files") {
        // For paste, we need to determine the target folder
        // If we're in a folder, paste into that folder, otherwise paste into root
        const targetFolderId =
          currentFolderId === "root" ? null : currentFolderId;
        await handlePasteFiles(targetFolderId);
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
      handleViewModeChange,
      handlePreviewFile,
      handleCutFiles,
      handlePasteFiles,
      currentFolderId,
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

// Enhanced VFSBrowser with admin support
export const VFSBrowser = React.memo((props) => {
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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
    // View mode functionality
    currentViewMode,
    handleViewModeChange,
    // Admin specific
    isAdmin,
    adminMode,
    showAdminView,
    usersData,
    currentViewingUserId,
    handleAdminModeToggle,
    handleSelectUser,
    handleBackToUsersList,
    getCurrentContext,
    // Admin tab functionality
    adminActiveTab,
    setAdminActiveTab,
    // Copy/paste functionality
    clipboardFiles,
    cutFilesToClipboard,
    pasteFilesFromClipboard,
    clearClipboard,
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
    moveMediaFile,
    handleViewModeChange,
    setPreviewFile,
    setShowPreviewModal,
    cutFilesToClipboard,
    pasteFilesFromClipboard,
    clearClipboard,
    currentFolderId,
    fileMap
  );

  // Enhanced file actions with depth-aware logic and drag and drop
  const fileActions = useMemo(() => {
    const actions = [];
    const currentDepth = getCurrentDepth();
    const canCreateSubfolder = currentDepth < 2;

    // Don't show actions in admin users view
    if (showAdminView) {
      return [];
    }

    // Add view mode actions based on current mode
    if (currentViewMode === "list") {
      actions.push(ChonkyActions.EnableGridView);
    } else {
      actions.push(ChonkyActions.EnableListView);
    }

    // Enable drag and drop only if not in admin mode
    if (!adminMode) {
      actions.push(ChonkyActions.EnableDragAndDrop);
    }

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

    // Add cut action (always available for files) - cuts/moves files
    actions.push({
      id: "cut_files",
      button: {
        name: "Cut",
        toolbar: true,
        contextMenu: true,
        group: "Actions",
        icon: ChonkyActions.CopyFiles.button.icon, // Reuse copy icon for now
      },
      hotkeys: ["ctrl+v"],
    });

    // Add custom paste action (no hotkey to avoid conflict with cut)
    actions.push({
      id: "paste_files",
      button: {
        name: "Paste (Move)",
        toolbar: true,
        contextMenu: true,
        group: "Actions",
        icon: ChonkyActions.CopyFiles.button.icon, // Reuse copy icon for now
      },
    });

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
  }, [
    currentFolderId,
    getCurrentDepth,
    showAdminView,
    adminMode,
    currentViewMode,
    clipboardFiles,
  ]);

  const thumbnailGenerator = useCallback(
    (file) => (file.thumbnailUrl ? file.thumbnailUrl : null),
    []
  );

  // Admin header component
  const AdminHeader = () => {
    const currentContext = getCurrentContext(); // Get the context first

    return (
      <Card size="small" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            {isAdmin && (
              <Tooltip title="Toggle Admin Mode">
                <Space>
                  <Text>Admin Mode:</Text>
                  <Switch
                    checked={adminMode}
                    onChange={handleAdminModeToggle}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Space>
              </Tooltip>
            )}

            {adminMode && currentViewingUserId && (
              <>
                <Divider type="vertical" />
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToUsersList}
                  size="small"
                >
                  Back to Users List
                </Button>
                <Text type="secondary">
                  Viewing: <strong>{currentContext.currentUser?.email}</strong>
                </Text>
              </>
            )}
          </Space>

          <Button
            type="primary"
            size="small"
            onClick={refreshData}
            loading={loading}
            title="Refresh all data and reset to root folder"
          >
            🔄 Refresh All
          </Button>
        </div>
      </Card>
    );
  };

  // Back to root navigation component
  const BackToRootNavigation = () => {
    if (showAdminView || currentFolderId === "root") return null;

    return (
      <Card size="small" style={{ marginBottom: "8px" }}>
        <Button
          type="link"
          icon={<HomeOutlined />}
          onClick={() => {
            setCurrentFolderId("root");
            setCurrentFolderName(
              adminMode && currentViewingUserId
                ? "User's Media"
                : "Media Manager"
            );
          }}
          style={{ padding: "0", height: "auto" }}
        >
          Back to Root
        </Button>
      </Card>
    );
  };

  return (
    <>
      <div style={{ height: "100vh", position: "relative" }}>
        {/* Admin Header */}
        {isAdmin && <AdminHeader />}

        {/* Show admin tabs view */}
        {showAdminView ? (
          <Tabs
            activeKey={adminActiveTab}
            onChange={setAdminActiveTab}
            style={{ minHeight: "60vh", color: "#fff" }}
          >
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Users & Folders
                </span>
              }
              key="users"
            >
              <AdminUsersView
                onSelectUser={handleSelectUser}
                usersData={usersData}
                loading={loading}
              />
            </TabPane>
            <TabPane
              tab={
                <span>
                  <SearchOutlined />
                  Search Files
                </span>
              }
              key="search"
            >
              <AdminSearchPanel />
            </TabPane>
          </Tabs>
        ) : (
          <>
            {/* Back to Root Navigation */}
            <BackToRootNavigation />

            {/* Regular file browser */}
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

            <PreviewModal
              visible={showPreviewModal}
              onClose={() => setShowPreviewModal(false)}
              file={previewFile}
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
              disableToolbar={false}
              disableDefaultFileActions={true}
              {...props}
            />
          </>
        )}
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

VFSBrowser.displayName = "VFSBrowser";
