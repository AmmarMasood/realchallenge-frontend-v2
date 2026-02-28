import { ChonkyActions, FileHelper, FullFileBrowser, defineFileAction } from "chonky";
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
import { retryVideoOptimization } from "../../../services/mediaManager";
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
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { userInfoContext } from "../../../contexts/UserStore";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { get } from "lodash";

const { confirm } = Modal;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Factory function to create translated sort actions
const createSortActions = (strings) => {
  const sortByGroup = get(strings, "mediaManager.sort_by", "Sort by");

  return {
    SortFilesByName: defineFileAction({
      id: ChonkyActions.SortFilesByName.id,
      sortKeySelector: ChonkyActions.SortFilesByName.sortKeySelector,
      button: {
        name: get(strings, "mediaManager.sort_by_name", "Sort by Name"),
        toolbar: true,
        group: sortByGroup,
      },
    }),
    SortFilesBySize: defineFileAction({
      id: ChonkyActions.SortFilesBySize.id,
      sortKeySelector: ChonkyActions.SortFilesBySize.sortKeySelector,
      button: {
        name: get(strings, "mediaManager.sort_by_size", "Sort by Size"),
        toolbar: true,
        group: sortByGroup,
      },
    }),
    SortFilesByDate: defineFileAction({
      id: ChonkyActions.SortFilesByDate.id,
      sortKeySelector: ChonkyActions.SortFilesByDate.sortKeySelector,
      button: {
        name: get(strings, "mediaManager.sort_by_date", "Sort by Date"),
        toolbar: true,
        group: sortByGroup,
      },
    }),
    SortFilesByType: defineFileAction({
      id: 'sort_by_type',
      sortKeySelector: (file) => {
        if (file.isDir) return ''; // Folders come first
        const name = file.rawName || file.name || '';
        const extension = name.split('.').pop()?.toLowerCase() || '';
        return extension;
      },
      button: {
        name: get(strings, "mediaManager.sort_by_type", "Sort by Type"),
        toolbar: true,
        group: sortByGroup,
      },
    }),
  };
};

// Factory function to create translated file actions
const createTranslatedActions = (strings) => ({
  UploadFiles: defineFileAction({
    id: ChonkyActions.UploadFiles.id,
    button: {
      name: get(strings, "mediaManager.upload_files", "Upload files"),
      toolbar: true,
      contextMenu: true,
      icon: ChonkyActions.UploadFiles.button.icon,
    },
  }),
  CreateFolder: defineFileAction({
    id: ChonkyActions.CreateFolder.id,
    button: {
      name: get(strings, "mediaManager.create_folder", "Create folder"),
      toolbar: true,
      contextMenu: true,
      icon: ChonkyActions.CreateFolder.button.icon,
    },
  }),
});

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Video Processing Badge Component
const VideoProcessingBadge = ({ status, fileId, onRetrySuccess }) => {
  const [retrying, setRetrying] = useState(false);

  if (!status || status === "none") return null;

  const handleRetry = async (e) => {
    e.stopPropagation();
    if (!fileId || retrying) return;
    setRetrying(true);
    try {
      await retryVideoOptimization(fileId);
      message.success("Optimization retry started");
      if (onRetrySuccess) onRetrySuccess();
    } catch (err) {
      // notification already shown by service
    } finally {
      setRetrying(false);
    }
  };

  const config = {
    processing: {
      color: "processing",
      icon: <LoadingOutlined spin />,
      text: "Optimizing...",
    },
    completed: {
      color: "success",
      icon: <CheckCircleOutlined />,
      text: "Optimized",
    },
    failed: {
      color: "error",
      icon: <ExclamationCircleOutlined />,
      text: "Failed",
    },
  };

  const cfg = config[status];
  if (!cfg) return null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Tag color={cfg.color} icon={cfg.icon} style={{ marginLeft: 8, fontSize: 11 }}>
        {cfg.text}
      </Tag>
      {status === "failed" && (
        <Tooltip title="Retry optimization">
          <ReloadOutlined
            spin={retrying}
            onClick={handleRetry}
            style={{
              color: "#ff7700",
              fontSize: 14,
              cursor: "pointer",
            }}
          />
        </Tooltip>
      )}
    </span>
  );
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
    console.log("🌳 Building folder tree, folders:", folders);
    return folders.map((folder) => {
      console.log(
        "📁 Folder:",
        folder.name,
        "has children:",
        folder.children?.length || 0
      );
      return (
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
      );
    });
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
            <div style={{ fontWeight: "bold" }}>
              {user.firstName} {user.lastName} <span style={{ color: "#999", fontSize: "12px" }}>({user.email})</span>
            </div>
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
  const { strings } = useContext(LanguageContext);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [currentFolderName, setCurrentFolderName] = useState("Media Manager");
  const [lastViewedPath, setLastViewedPath] = useState("root");
  const [showAdminView, setShowAdminView] = useState(false);
  const [folderViewModes, setFolderViewModes] = useState({});
  const [forceRefreshFiles, setForceRefreshFiles] = useState(false); // Flag to force file refresh after main refresh
  const [currentViewMode, setCurrentViewMode] = useState("grid");
  const [adminActiveTab, setAdminActiveTab] = useState("users");
  const currentFolderIdRef = useRef(currentFolderId);

  // Search state for Chonky's built-in search
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      console.log(
        "📁 FETCH: Fetching files for folder (user mode):",
        currentFolderId,
        "Force:",
        forceRefreshFiles
      );
      fetchFiles(currentFolderId);
    } else if (
      currentFolderId !== "root" &&
      (!filesByFolder[currentFolderId] || forceRefreshFiles) &&
      adminMode &&
      currentViewingUserId
    ) {
      console.log(
        "📁 FETCH: Fetching files for folder (admin mode):",
        currentFolderId,
        "Force:",
        forceRefreshFiles
      );
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
      console.log(
        "👤 USER_SELECT: Calling fetchUserFolders WITHOUT force flag"
      );
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

  // Build folder hierarchy - supports both pre-built children and parentId-based building
  const buildFolderHierarchy = useCallback((folders) => {
    console.log(
      "🏗️ HIERARCHY: Building folder hierarchy with",
      folders.length,
      "folders"
    );
    console.log(
      "🏗️ HIERARCHY: Input folders detailed:",
      JSON.stringify(
        folders.map((f) => ({
          name: f.name,
          id: f._id,
          parentId: f.parentId,
          children: f.children?.map((c) => ({ name: c.name, id: c._id })) || [],
        })),
        null,
        2
      )
    );

    const folderMap = new Map();
    const rootFolders = [];

    // First pass: Add all folders to map with empty/existing children arrays
    folders.forEach((folder) => {
      const stringId = String(folder._id);
      folderMap.set(stringId, {
        ...folder,
        children: folder.children || [], // Preserve existing or create empty
        depth: folder.depth || 0,
      });
    });

    console.log("🏗️ HIERARCHY: First pass - Added all folders to map");

    // Second pass: Build children arrays using parentId for folders without pre-built children
    folders.forEach((folder) => {
      if (folder.parentId) {
        const parentId = String(folder.parentId);
        const childId = String(folder._id);
        const parent = folderMap.get(parentId);
        const child = folderMap.get(childId);

        if (parent && child) {
          // Check if this folder already has pre-built children (admin mode)
          const hasPrebuiltChildren =
            folder.children && folder.children.length > 0;

          // Only add if not already in children array
          const childExists = parent.children.some(
            (c) => String(c._id) === childId
          );

          if (!childExists) {
            console.log(
              `🏗️ HIERARCHY: Adding ${child.name} as child of ${parent.name}`
            );
            parent.children.push(child);
          }
        }
      }
    });

    console.log(
      "🏗️ HIERARCHY: Second pass - Built children arrays from parentId"
    );

    // Third pass: Recursively process folders to set proper depth
    const setDepthRecursively = (folder, depth = 0) => {
      folder.depth = depth;
      if (folder.children && folder.children.length > 0) {
        folder.children.forEach((child) => {
          setDepthRecursively(child, depth + 1);
        });
      }
    };

    // Fourth pass: Collect root folders and set depths
    folders.forEach((folder) => {
      if (!folder.parentId) {
        const rootFolder = folderMap.get(String(folder._id));
        if (rootFolder) {
          setDepthRecursively(rootFolder, 0);
          rootFolders.push(rootFolder);
        }
      }
    });

    console.log("🏗️ HIERARCHY: FolderMap keys:", Array.from(folderMap.keys()));
    console.log(
      "🏗️ HIERARCHY: Final root folders:",
      rootFolders.map((f) => f.name)
    );
    console.log(
      "🏗️ HIERARCHY: All folders in map:",
      Array.from(folderMap.values()).map((f) => ({
        name: f.name,
        id: f._id,
        depth: f.depth,
        childrenCount: f.children?.length || 0,
        childrenNames: f.children?.map((c) => c.name) || [],
      }))
    );

    return { folderMap, rootFolders };
  }, []);

  // Convert context data to Chonky file map format with hierarchy
  const fileMap = useMemo(() => {
    console.log("📊 FILEMAP: Creating fileMap, folders data:", folders);
    console.log("📊 FILEMAP: Folders count:", folders?.length || 0);
    console.log(
      "📊 FILEMAP: AdminMode:",
      adminMode,
      "ShowAdminView:",
      showAdminView,
      "CurrentViewingUserId:",
      currentViewingUserId
    );

    // Don't show file map when in admin users view
    if (showAdminView) {
      return {
        root: {
          id: "root",
          name: "Admin - Users Overview",
          isDir: true,
          childrenIds: [],
          depth: -1,
          size: 0,
          modDate: null,
          canDropFiles: false,
          droppable: false,
          draggable: false,
        },
      };
    }

    const { folderMap, rootFolders } = buildFolderHierarchy(folders);

    console.log("🗂️ FILEMAP: Starting fileMap creation");
    console.log(
      "🗂️ FILEMAP: Admin mode:",
      adminMode,
      "Viewing user:",
      currentViewingUserId
    );
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
        size: 0,
        modDate: null,
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

      console.log(
        `🗂️ FILEMAP: Processing folder ${folder.name} (${folderId}):`
      );
      console.log(`  - Child files from filesByFolder: ${childFiles.length}`);
      console.log(
        `  - Child folders from hierarchy: ${childFolders.length}`,
        childFolders.map((f) => f.name)
      );

      newFileMap[folderId] = {
        id: folderId,
        name: folder.name,
        isDir: true,
        parentId: folder.parentId || "root",
        childrenIds: [
          ...childFolders.map((f) => f._id), // Child folders from hierarchy
          ...childFiles.map((f) => f._id), // Child files from filesByFolder
        ],
        mediaType: folder.mediaType,
        createdAt: folder.createdAt,
        modDate: folder.createdAt ? new Date(folder.createdAt) : null, // For Chonky date sorting
        size: 0, // Folders have size 0
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
          fullItem: file,
        });

        // Check if this is actually a folder that's being treated as a file
        const isActuallyFolder =
          file.type === "folder" ||
          file.isFolder === true ||
          file.mediaType === "folder";

        const baseName = file.originalName || file.filename;
        const status = file.processingStatus || "none";
        const statusPrefix =
          status === "processing" ? "⏳ "
          : status === "completed" ? "✅ "
          : status === "failed" ? "❌ "
          : "";

        newFileMap[file._id] = {
          id: file._id,
          name: statusPrefix + baseName,
          rawName: baseName, // Keep original name for operations
          isDir: isActuallyFolder,
          parentId: folderId,
          link: file.filelink,
          mediaType: file.mediaType,
          thumbnailUrl: file.thumbnailUrl || file.filelink,
          createdAt: file.createdAt,
          modDate: file.createdAt ? new Date(file.createdAt) : null,
          filename: file.filename,
          size: file.size || 0,
          processingStatus: status,
          draggable: !isActuallyFolder,
          droppable: isActuallyFolder,
        };
      });
    });

    console.log("🗂️ FILEMAP: Final fileMap structure:");
    Object.entries(newFileMap).forEach(([id, item]) => {
      if (item.isDir) {
        console.log(
          `  📁 ${item.name} (${id}): ${
            item.childrenIds?.length || 0
          } children`,
          item.childrenIds
        );
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
      const currentUser = usersData?.find(
        (user) => user._id === currentViewingUserId
      );

      // First refresh users data to get fresh user list
      await fetchAllUsersData(true);
      console.log("🔄 REFRESH: Refreshed users data");

      // Then call fetchUserFolders WITHOUT force flag (same as initial selection)
      console.log(
        "🔄 REFRESH: Calling fetchUserFolders WITHOUT force flag (same as handleSelectUser)"
      );
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
    console.log(
      "🔄 REFRESH: Set forceRefreshFiles flag - next folder navigation will fetch fresh data"
    );

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
    setShowAdminView,
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
    fetchFiles,
  };
};

export const useFiles = (fileMap, currentFolderId, allSearchableItems = []) => {
  return useMemo(() => {
    // Build current folder's children
    console.log("🗂️ FILES: Building files list for folder:", currentFolderId);
    const currentFolder = fileMap[currentFolderId];
    if (!currentFolder) {
      console.log("🗂️ FILES: No current folder found");
      return [];
    }

    console.log(
      "🗂️ FILES: Current folder:",
      currentFolder.name,
      "Children:",
      currentFolder.childrenIds?.length || 0
    );
    const childrenIds = currentFolder.childrenIds || [];
    let files = childrenIds.map((fileId) => fileMap[fileId]).filter(Boolean);

    console.log(
      "🗂️ FILES: Final files list (current folder only):",
      files.map((f) => ({
        name: f.name,
        isDir: f.isDir,
      }))
    );

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
export const PreviewModal = ({ visible, onClose, file, onRetrySuccess }) => {
  const [loading, setLoading] = useState(true);

  console.log("ammar", file);
  if (!visible || !file) return null;

  // Helper function to check if URL is a video link
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v", "mpg"];
    try {
      const urlPath = new URL(url).pathname.toLowerCase();
      return videoExtensions.some(ext => urlPath.endsWith(`.${ext}`));
    } catch {
      // If URL parsing fails, check as string
      const lowerUrl = url.toLowerCase();
      return videoExtensions.some(ext => lowerUrl.includes(`.${ext}`));
    }
  };

  // Helper function to check if URL is an image link
  const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"];
    try {
      const urlPath = new URL(url).pathname.toLowerCase();
      return imageExtensions.some(ext => urlPath.endsWith(`.${ext}`));
    } catch {
      // If URL parsing fails, check as string
      const lowerUrl = url.toLowerCase();
      return imageExtensions.some(ext => lowerUrl.includes(`.${ext}`));
    }
  };

  // Helper function to check if URL is an audio link
  const isAudioUrl = (url) => {
    if (!url) return false;
    const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac", "wma", "webm"];
    try {
      const urlPath = new URL(url).pathname.toLowerCase();
      return audioExtensions.some(ext => urlPath.endsWith(`.${ext}`));
    } catch {
      // If URL parsing fails, check as string
      const lowerUrl = url.toLowerCase();
      return audioExtensions.some(ext => lowerUrl.includes(`.${ext}`));
    }
  };

  const fileName = file.rawName || file.name;

  // Check video: first by link URL, then by mediaType, finally by filename extension
  const isVideo =
    isVideoUrl(file.link) ||
    file.mediaType === "video" ||
    (fileName && ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v", "mpg"].includes(
      fileName.split(".").pop()?.toLowerCase() || ""
    ));

  // Check image: first by link URL, then by mediaType, finally by filename extension
  const isImage =
    isImageUrl(file.link) ||
    file.mediaType === "picture" ||
    (fileName && ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"].includes(
      fileName.split(".").pop()?.toLowerCase() || ""
    ));

  // Check audio: first by link URL, then by mediaType, finally by filename extension
  const isAudio =
    isAudioUrl(file.link) ||
    file.mediaType === "audio" ||
    (fileName && ["mp3", "wav", "ogg", "m4a", "aac", "flac", "wma", "webm"].includes(
      fileName.split(".").pop()?.toLowerCase() || ""
    ));

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h3 style={{ color: "white", margin: 0 }}>{file.rawName || file.name}</h3>
          <VideoProcessingBadge status={file.processingStatus} fileId={file.id} onRetrySuccess={onRetrySuccess} />
        </div>
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
        ) : isAudio ? (
          <div style={{ width: "100%", minWidth: "500px", maxWidth: "1200px" }}>
            <ReactPlayer
              url={file.link}
              controls={true}
              width="100%"
              height="80px"
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
              onReady={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
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
  fileMap,
  setSearchMode,
  fetchFiles
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
      console.log("🎬 Preview file clicked:", file);
      console.log("🎬 File link:", file?.link);
      console.log("🎬 File properties:", Object.keys(file || {}));

      if (!file || !file.link) {
        console.error("🎬 Preview failed - no file link:", file);
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
          console.log(
            "🗂️ NAVIGATION: Opening folder:",
            fileToOpen.name,
            "ID:",
            fileToOpen.id,
            "isParentDir:",
            fileToOpen.isParentDir
          );

          // Disable search mode when entering a folder
          if (setSearchMode) {
            setSearchMode(false);
          }

          // Handle parent folder navigation
          if (fileToOpen.isParentDir) {
            const parentFolder = fileMap[fileToOpen.id];
            console.log(
              "🗂️ NAVIGATION: Going to parent folder:",
              parentFolder ? parentFolder.name : "Media Manager"
            );
            setCurrentFolderId(fileToOpen.id);
            setCurrentFolderName(
              parentFolder ? parentFolder.name : "Media Manager"
            );
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
      } else if (data.id === "retry_optimization") {
        const item = data.state.selectedFilesForAction[0];
        if (item && item.processingStatus === "failed") {
          try {
            await retryVideoOptimization(item.id);
            message.success("Optimization retry started");
            if (fetchFiles) fetchFiles(currentFolderId, true);
          } catch (err) {
            // notification already shown by service
          }
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
      handleViewModeChange,
      handlePreviewFile,
      handleCutFiles,
      handlePasteFiles,
      currentFolderId,
      fetchFiles,
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
    case "coverMedia":
      // Allow both images and videos for cover/thumbnail selection
      return [
        // Images
        "png", "jpeg", "jpg", "tiff", "gif", "bmp", "webp", "svg",
        // Videos
        "m4v", "avi", "mpg", "mp4", "mov", "wmv", "flv", "webm", "mkv",
      ].includes(ext);
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
      setNewName(target.rawName || target.name);
    }
  }, [target]);

  const handleRename = async () => {
    if (!newName.trim()) {
      message.warning("Please enter a name");
      return;
    }

    if (newName === (target.rawName || target.name)) {
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
  const { strings } = useContext(LanguageContext);

  // Track window width for responsive grid sizing
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive grid view action — smaller entries on mobile
  const responsiveGridAction = useMemo(() => {
    let entryWidth = 165;
    let entryHeight = 130;
    if (windowWidth <= 480) {
      entryWidth = 100;
      entryHeight = 100;
    } else if (windowWidth <= 768) {
      entryWidth = 130;
      entryHeight = 110;
    }
    return defineFileAction({
      id: "responsive_grid_view",
      fileViewConfig: { entryWidth, entryHeight },
    });
  }, [windowWidth]);

  // Search mode toggle - enables searching across all folders and files
  const [searchMode, setSearchMode] = useState(false);

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
    fetchFiles,
  } = useCustomFileMap();

  const files = useFiles(fileMap, currentFolderId);
  const folderChain = useFolderChain(fileMap, currentFolderId);

  // When search mode is enabled, redirect to root folder
  useEffect(() => {
    if (searchMode && currentFolderId !== "root") {
      setCurrentFolderId("root");
      setCurrentFolderName(
        adminMode && currentViewingUserId ? "User's Media" : "Media Manager"
      );
    }
  }, [
    searchMode,
    currentFolderId,
    adminMode,
    currentViewingUserId,
    setCurrentFolderId,
    setCurrentFolderName,
  ]);

  // State for all searchable files (fetched from backend when search mode is enabled)
  const [allSearchableItems, setAllSearchableItems] = useState([]);

  // Fetch all searchable files and folders when search mode is enabled
  useEffect(() => {
    const fetchAllSearchableItems = async () => {
      if (!searchMode || showAdminView) {
        // Clear items when search mode is disabled
        setAllSearchableItems([]);
        return;
      }

      try {
        console.log("🔍 SEARCH: Fetching all searchable items from backend");

        let result;

        // If admin viewing specific user, use admin search API with userId
        if (adminMode && currentViewingUserId) {
          const { searchMediaFiles } = await import(
            "../../../services/mediaManager"
          );
          result = await searchMediaFiles({
            userId: currentViewingUserId,
            page: 1,
            limit: 10000, // Get all items
          });
        } else {
          // Regular user or admin in their own view
          const { searchMyMediaFiles } = await import(
            "../../../services/mediaManager"
          );
          result = await searchMyMediaFiles({});
        }

        console.log("🔍 SEARCH: Backend returned:", result);

        const searchableFiles = [];

        // Add folders with display names
        result.folders?.forEach((folder) => {
          searchableFiles.push({
            id: folder._id,
            _id: folder._id,
            name: folder.name,
            isDir: true,
            parentId: folder.parentId,
            mediaType: folder.mediaType,
            createdAt: folder.createdAt,
            depth: folder.depth,
            searchPath: folder.folderPath,
            displayName: folder.folderPath
              ? `${folder.name} (in ${folder.folderPath})`
              : folder.name,
          });
        });

        // Add files with display names
        result.files?.forEach((file) => {
          searchableFiles.push({
            id: file._id,
            _id: file._id,
            name: file.originalName,
            isDir: false,
            parentId: file.folderId,
            link: file.filelink,
            mediaType: file.mediaType,
            thumbnailUrl: file.thumbnailUrl,
            createdAt: file.createdAt,
            filename: file.filename,
            size: file.size,
            processingStatus: file.processingStatus || "none",
            searchPath: file.folderPath,
            displayName: file.folderPath
              ? `${file.originalName} (in ${file.folderPath})`
              : file.originalName,
          });
        });

        console.log(
          `🔍 SEARCH: Processed ${searchableFiles.length} searchable items`
        );
        setAllSearchableItems(searchableFiles);
      } catch (error) {
        console.error("🔍 SEARCH: Error fetching searchable items:", error);
      }
    };

    fetchAllSearchableItems();
  }, [searchMode, showAdminView, adminMode, currentViewingUserId]);

  // Combine files based on search mode
  const filesForBrowser = useMemo(() => {
    if (!searchMode) {
      // When NOT in search mode, only show current folder files
      return files;
    }

    // When in search mode, combine current folder files with all searchable items
    const combinedFiles = [...files];
    const existingIds = new Set(files.map((f) => f.id));

    allSearchableItems.forEach((item) => {
      if (!existingIds.has(item.id)) {
        combinedFiles.push({
          ...item,
          name: item.displayName || item.name,
        });
      }
    });

    return combinedFiles;
  }, [files, allSearchableItems, searchMode]);
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
    fileMap,
    setSearchMode,
    fetchFiles
  );

  // Enhanced file actions with depth-aware logic and drag and drop
  const fileActions = useMemo(() => {
    const actions = [];
    const currentDepth = getCurrentDepth();
    const canCreateSubfolder = currentDepth < 2;

    // Create translated actions
    const sortActions = createSortActions(strings);
    const translatedActions = createTranslatedActions(strings);
    const actionsGroup = get(strings, "mediaManager.actions", "Actions");

    // Don't show actions in admin users view
    if (showAdminView) {
      return [];
    }

    // Add responsive grid sizing action (applies entryWidth/entryHeight for current screen size)
    actions.push(responsiveGridAction);

    // Add view mode actions based on current mode
    if (currentViewMode === "list") {
      actions.push(ChonkyActions.EnableGridView);
    } else {
      actions.push(ChonkyActions.EnableListView);
    }

    // Add sorting actions with custom "Sort by" group
    actions.push(sortActions.SortFilesByName);
    actions.push(sortActions.SortFilesBySize);
    actions.push(sortActions.SortFilesByDate);
    actions.push(sortActions.SortFilesByType);

    // Enable drag and drop only if not in admin mode
    if (!adminMode) {
      actions.push(ChonkyActions.EnableDragAndDrop);
    }

    if (currentFolderId === "root") {
      // Root level actions
      actions.push({
        id: "delete_folders",
        button: {
          name: get(strings, "mediaManager.delete_folder", "Delete Folder"),
          toolbar: false,
          contextMenu: true,
          group: actionsGroup,
          icon: ChonkyActions.DeleteFiles.button.icon,
        },
        hotkeys: ["Delete"],
      });

      if (canCreateSubfolder) {
        actions.push(translatedActions.CreateFolder);
      }

      // Add preview action for search mode (when at root but showing files)
      if (searchMode) {
        actions.push({
          id: "preview_file",
          button: {
            name: get(strings, "mediaManager.preview", "Preview"),
            toolbar: false,
            contextMenu: true,
            group: actionsGroup,
          },
          fileFilter: (file) => !file.isDir, // Only show for files, not folders
        });
      }
    } else {
      // Inside folder actions
      actions.push({
        id: "delete_files",
        button: {
          name: get(strings, "mediaManager.delete_items", "Delete Items"),
          toolbar: false,
          contextMenu: true,
          group: actionsGroup,
          icon: ChonkyActions.DeleteFiles.button.icon,
        },
        hotkeys: ["Delete"],
      });

      actions.push(translatedActions.UploadFiles);

      if (canCreateSubfolder) {
        actions.push(translatedActions.CreateFolder);
      }

      // Add preview action for files only
      actions.push({
        id: "preview_file",
        button: {
          name: get(strings, "mediaManager.preview", "Preview"),
          toolbar: false,
          contextMenu: true,
          group: actionsGroup,
        },
        fileFilter: (file) => !file.isDir, // Only show for files, not folders
      });
    }

    // Add cut action (always available for files) - cuts/moves files
    actions.push({
      id: "cut_files",
      button: {
        name: get(strings, "mediaManager.cut", "Cut"),
        toolbar: true,
        contextMenu: true,
        group: actionsGroup,
        icon: ChonkyActions.CopyFiles.button.icon, // Reuse copy icon for now
      },
      hotkeys: ["ctrl+v"],
    });

    // Add custom paste action (no hotkey to avoid conflict with cut)
    actions.push({
      id: "paste_files",
      button: {
        name: get(strings, "mediaManager.paste_move", "Paste (Move)"),
        toolbar: true,
        contextMenu: true,
        group: actionsGroup,
        icon: ChonkyActions.CopyFiles.button.icon, // Reuse copy icon for now
      },
    });

    // Add retry optimization action (only for failed video files)
    actions.push({
      id: "retry_optimization",
      button: {
        name: get(strings, "mediaManager.retry_optimization", "Retry Optimization"),
        toolbar: false,
        contextMenu: true,
        group: actionsGroup,
      },
      fileFilter: (file) => !file.isDir && file.processingStatus === "failed",
    });

    // Add rename action (always available)
    actions.push({
      id: "rename_item",
      button: {
        name: get(strings, "mediaManager.rename", "Rename"),
        toolbar: false,
        contextMenu: true,
        group: actionsGroup,
      },
      hotkeys: ["F2"],
    });

    return actions;
  }, [
    strings,
    currentFolderId,
    getCurrentDepth,
    showAdminView,
    adminMode,
    currentViewMode,
    clipboardFiles,
    searchMode,
    responsiveGridAction,
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
              <Tooltip title={get(strings, "mediaManager.toggle_admin_mode", "Toggle Admin Mode")}>
                <Space>
                  <Text>{get(strings, "mediaManager.admin_mode", "Admin Mode")}:</Text>
                  <Switch
                    checked={adminMode}
                    onChange={handleAdminModeToggle}
                    checkedChildren={get(strings, "mediaManager.on", "ON")}
                    unCheckedChildren={get(strings, "mediaManager.off", "OFF")}
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
                  {get(strings, "mediaManager.back_to_users_list", "Back to Users List")}
                </Button>
                <Text type="secondary">
                  {get(strings, "mediaManager.viewing", "Viewing")}: <strong>{currentContext.currentUser?.email}</strong>
                </Text>
              </>
            )}
          </Space>

          <Space>
            {!showAdminView && (
              <Tooltip
                title={
                  searchMode
                    ? get(strings, "mediaManager.exit_search_mode", "Exit search mode to browse folders normally")
                    : get(strings, "mediaManager.enable_search_mode", "Enable search mode to search across all folders and files")
                }
              >
                <Space>
                  <Text>{get(strings, "mediaManager.search_mode", "Search Mode")}:</Text>
                  <Switch
                    checked={searchMode}
                    onChange={(checked) => setSearchMode(checked)}
                    checkedChildren={get(strings, "mediaManager.on", "ON")}
                    unCheckedChildren={get(strings, "mediaManager.off", "OFF")}
                  />
                </Space>
              </Tooltip>
            )}
            <Button
              type="primary"
              size="small"
              onClick={refreshData}
              loading={loading}
              title={get(strings, "mediaManager.refresh_all_tooltip", "Refresh all data and reset to root folder")}
            >
              🔄 {get(strings, "mediaManager.refresh_all", "Refresh All")}
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  // User header component (for non-admin users)
  const UserHeader = () => {
    return (
      <Card size="small" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text strong>{get(strings, "mediaManager.title", "Media Manager")}</Text>

          <Space>
            <Tooltip
              title={
                searchMode
                  ? get(strings, "mediaManager.exit_search_mode", "Exit search mode to browse folders normally")
                  : get(strings, "mediaManager.enable_search_mode", "Enable search mode to search across all folders and files")
              }
            >
              <Space>
                <Text>{get(strings, "mediaManager.search_mode", "Search Mode")}:</Text>
                <Switch
                  checked={searchMode}
                  onChange={(checked) => setSearchMode(checked)}
                  checkedChildren={get(strings, "mediaManager.on", "ON")}
                  unCheckedChildren={get(strings, "mediaManager.off", "OFF")}
                />
              </Space>
            </Tooltip>
            <Button
              type="primary"
              size="small"
              onClick={refreshData}
              loading={loading}
              title={get(strings, "mediaManager.refresh_all_tooltip", "Refresh all folders and files")}
            >
              🔄 {get(strings, "mediaManager.refresh_all", "Refresh All")}
            </Button>
          </Space>
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
      <div
        style={{
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header - Admin or User */}
        {isAdmin ? <AdminHeader /> : <UserHeader />}

        {/* Show admin tabs view */}
        {showAdminView ? (
          <div style={{ flex: 1, overflow: "auto" }}>
            <Tabs
              activeKey={adminActiveTab}
              onChange={setAdminActiveTab}
              style={{ height: "100%", color: "#fff" }}
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
                {usersData &&
                  usersData.length > 0 &&
                  console.log("👥 Admin usersData:", usersData)}
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
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              onRetrySuccess={() => fetchFiles(currentFolderId, true)}
            />

            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner">Loading...</div>
              </div>
            )}

            {/* Video optimization status legend */}
            {filesForBrowser.some(f => f.processingStatus && f.processingStatus !== "none") && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "4px 12px",
                background: "#f5f5f5",
                borderBottom: "1px solid #e8e8e8",
                fontSize: "12px",
                color: "#666",
              }}>
                <span style={{ fontWeight: 500 }}>Video optimization:</span>
                <span>⏳ Optimizing</span>
                <span>✅ Optimized</span>
                <span>❌ Failed</span>
              </div>
            )}

            <div style={{ flex: 1, overflow: "auto" }}>
              <FullFileBrowser
                files={filesForBrowser}
                folderChain={folderChain}
                fileActions={fileActions}
                onFileAction={handleFileAction}
                thumbnailGenerator={thumbnailGenerator}
                disableSelection={loading}
                disableToolbar={false}
                disableDefaultFileActions={true}
                defaultFileViewActionId={responsiveGridAction.id}
                {...props}
              />
            </div>
          </div>
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

        /* Mobile responsive - smaller Chonky folder icons on phones */
        @media (max-width: 768px) {
          /* Toolbar responsive adjustments */
          .chonky-toolbarContainer {
            flex-wrap: wrap;
            gap: 8px;
          }

          .chonky-toolbarLeft {
            flex: 1 1 100%;
            min-width: 0;
          }

          .chonky-toolbarRight {
            flex: 1 1 100%;
            flex-wrap: wrap;
            justify-content: flex-start !important;
            gap: 4px;
          }

          /* Hide button text, show only icons */
          .chonky-toolbarRight .chonky-baseButton span:not(.MuiTouchRipple-root):not(.MuiButton-label) {
            display: none;
          }

          /* Make buttons smaller */
          .chonky-toolbarRight .chonky-baseButton {
            min-width: 36px !important;
            padding: 4px 8px !important;
          }

          /* Hide info text on small screens */
          .chonky-infoContainer .chonky-extraInfoSpan {
            display: none;
          }

          /* Smaller search field */
          .chonky-searchFieldContainer {
            max-width: 150px;
          }
        }

        @media (max-width: 480px) {
          /* Even more compact toolbar */
          .chonky-toolbarRight .chonky-baseButton {
            min-width: 32px !important;
            padding: 2px 6px !important;
            font-size: 12px !important;
          }

          .chonky-toolbarRight .chonky-baseButton svg {
            width: 14px !important;
            height: 14px !important;
          }

          /* Smaller search */
          .chonky-searchFieldContainer {
            max-width: 120px;
          }

          .chonky-searchFieldInput {
            font-size: 12px !important;
          }

          /* Hide item count text */
          .chonky-infoText {
            font-size: 11px !important;
          }
        }

        /* Custom controls card responsive */
        @media (max-width: 768px) {
          .ant-card.ant-card-small .ant-card-body > div {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-space {
            flex-wrap: wrap;
          }

          .ant-card.ant-card-small .ant-card-body .ant-typography {
            font-size: 12px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-btn {
            font-size: 12px !important;
            padding: 2px 8px !important;
          }
        }

        @media (max-width: 480px) {
          .ant-card.ant-card-small .ant-card-body > div {
            gap: 8px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-space {
            gap: 4px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-typography {
            font-size: 11px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-switch {
            min-width: 40px !important;
          }

          .ant-card.ant-card-small .ant-card-body .ant-btn {
            font-size: 11px !important;
            padding: 2px 6px !important;
          }
        }
      `}</style>
    </>
  );
});

VFSBrowser.displayName = "VFSBrowser";
