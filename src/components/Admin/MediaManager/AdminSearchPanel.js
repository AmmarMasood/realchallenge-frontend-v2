import React, { useState, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Pagination,
  Typography,
  Avatar,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  UserOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  FolderOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ReactModal from "react-modal";
import ReactPlayer from "react-player";
import { useMediaManager } from "../../../contexts/MediaManagerContext";

const { Text, Title } = Typography;
const { Option } = Select;

const AdminSearchPanel = () => {
  const {
    searchFiles,
    clearSearchResults,
    loadMoreSearchResults,
    refreshSearchResults,
    searchResults,
    searchLoading,
    searchPagination,
    lastSearchCriteria,
    showSearchResults,
    usersData,
  } = useMediaManager();

  // Search form state
  const [searchForm, setSearchForm] = useState({
    filename: "",
    userId: "",
    mediaType: "all",
  });

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle search submit
  const handleSearch = useCallback(async () => {
    if (!searchForm.filename.trim() && !searchForm.userId) {
      return;
    }

    const searchParams = {
      filename: searchForm.filename.trim() || undefined,
      userId: searchForm.userId || undefined,
      mediaType:
        searchForm.mediaType === "all" ? undefined : searchForm.mediaType,
      page: 1,
      limit: 20,
    };

    try {
      await searchFiles(searchParams);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }, [searchForm, searchFiles]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchForm({
      filename: "",
      userId: "",
      mediaType: "all",
    });
    clearSearchResults();
  }, [clearSearchResults]);

  // Handle pagination change
  const handlePageChange = useCallback(
    async (page) => {
      try {
        await loadMoreSearchResults(page);
      } catch (error) {
        console.error("Failed to load page:", error);
      }
    },
    [loadMoreSearchResults]
  );

  // Handle file preview
  const handlePreview = useCallback((file) => {
    if (file && file.filelink) {
      setPreviewFile(file);
      setShowPreviewModal(true);
    }
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  }, []);

  // Get media type color
  const getMediaTypeColor = useCallback((mediaType) => {
    const colors = {
      video: "red",
      audio: "orange",
      picture: "green",
      document: "blue",
      other: "gray",
    };
    return colors[mediaType] || "gray";
  }, []);

  // Preview Modal Component for files
  const PreviewModal = ({ visible, onClose, file }) => {
    const [loading, setLoading] = useState(true);

    if (!visible || !file) return null;

    const isVideo =
      file.mediaType === "video" ||
      ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v", "mpg"].includes(
        (file.originalName || file.filename)?.split(".").pop()?.toLowerCase() || ""
      );

    const isImage =
      file.mediaType === "picture" ||
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"].includes(
        (file.originalName || file.filename)?.split(".").pop()?.toLowerCase() || ""
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
          <h3 style={{ color: "white", margin: 0 }}>
            {file.originalName || file.filename}
          </h3>
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
              url={file.filelink}
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
                src={file.filelink}
                alt={file.originalName || file.filename}
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
                href={file.filelink}
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

  // Table columns for search results
  const columns = [
    {
      title: "File",
      dataIndex: "originalName",
      key: "originalName",
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<FileOutlined />}
            style={{ backgroundColor: getMediaTypeColor(record.mediaType) }}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{text || record.filename}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatFileSize(record.size)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 150,
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
      title: "Folder",
      dataIndex: "folder",
      key: "folder",
      width: 150,
      render: (folder) => (
        <Space>
          <FolderOutlined style={{ color: "#1890ff" }} />
          <div>
            <div>{folder.name}</div>
            <Tag color={getMediaTypeColor(folder.mediaType)} size="small">
              {folder.mediaType}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "mediaType",
      key: "mediaType",
      width: 100,
      render: (mediaType) => (
        <Tag color={getMediaTypeColor(mediaType)}>
          {mediaType.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.filelink, "_blank")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      {/* Search Form */}
      <Card title="Admin File Search" style={{ marginBottom: "16px" }}>
        <Row gutter={16} style={{}}>
          <Col xs={24} sm={12} md={8}>
            <Text strong>Filename:</Text>
            <Input
              placeholder="Search by filename..."
              value={searchForm.filename}
              onChange={(e) => handleInputChange("filename", e.target.value)}
              onPressEnter={handleSearch}
              style={{ marginTop: "4px" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text strong>User:</Text>
            <Select
              placeholder="Select user..."
              value={searchForm.userId}
              onChange={(value) => handleInputChange("userId", value)}
              style={{ width: "100%", marginTop: "4px" }}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {usersData.map((userData) => (
                <Option key={userData.user._id} value={userData.user._id}>
                  {userData.user.name} ({userData.user.email})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4} xs={24} sm={12} md={8}>
            <Text strong>Media Type:</Text>
            <Select
              value={searchForm.mediaType}
              onChange={(value) => handleInputChange("mediaType", value)}
              style={{ width: "100%", marginTop: "4px" }}
            >
              <Option value="all">All Types</Option>
              <Option value="picture">Picture</Option>
              <Option value="video">Video</Option>
              <Option value="audio">Audio</Option>
              <Option value="document">Document</Option>
              <Option value="other">Other</Option>
            </Select>
          </Col>
          <Col
            span={4}
            xs={24}
            sm={12}
            md={8}
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <div style={{ marginTop: "24px" }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={searchLoading}
                  disabled={!searchForm.filename.trim() && !searchForm.userId}
                >
                  Search
                </Button>
                <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                  Clear
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Search Criteria Display */}
        {lastSearchCriteria && (
          <div
            style={{
              marginTop: "16px",
              padding: "8px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <Text type="secondary">
              <strong>Search Criteria:</strong>
              {lastSearchCriteria.filename &&
                ` Filename: "${lastSearchCriteria.filename}"`}
              {lastSearchCriteria.userId &&
                ` | User ID: ${lastSearchCriteria.userId}`}
              {lastSearchCriteria.mediaType &&
                ` | Type: ${lastSearchCriteria.mediaType}`}
            </Text>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {showSearchResults && (
        <Card
          title={
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Search Results
              </Title>
              {searchPagination && (
                <Tag color="blue">
                  {searchPagination.totalFiles} files found
                </Tag>
              )}
            </Space>
          }
          extra={
            <Button
              type="text"
              onClick={refreshSearchResults}
              loading={searchLoading}
            >
              Refresh
            </Button>
          }
        >
          <Spin spinning={searchLoading}>
            {searchResults.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  dataSource={searchResults}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: 1000 }}
                  size="middle"
                />

                {/* Pagination */}
                {searchPagination && searchPagination.totalPages > 1 && (
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <Pagination
                      current={searchPagination.currentPage}
                      total={searchPagination.totalFiles}
                      pageSize={searchPagination.filesPerPage}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} files`
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty
                description="No files found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">Try adjusting your search criteria</Text>
              </Empty>
            )}
          </Spin>
        </Card>
      )}

      {/* Preview Modal */}
      <PreviewModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={previewFile}
      />
    </div>
  );
};

export default AdminSearchPanel;
