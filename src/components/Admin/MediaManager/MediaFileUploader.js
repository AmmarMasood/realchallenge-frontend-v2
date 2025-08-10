import React, { useState, useMemo } from "react";
import { Modal } from "antd";
import { LoadingOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDropzone } from "react-dropzone";
import { useMediaManager } from "../../../contexts/MediaManagerContext";
import "../../../assets/mediaManager.css";

const allowedMimeTypes = {
  picture: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
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

const MediaFileUploader = ({
  visible,
  setVisible,
  currentFolderId,
  onUpload,
}) => {
  const { folders, uploadMediaFile, fetchFiles } = useMediaManager();
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Find the current folder to get its mediaType
  const folder = useMemo(
    () => folders.find((f) => f._id === currentFolderId),
    [folders, currentFolderId]
  );
  const folderType = folder?.mediaType || "other";

  // Accept string for react-dropzone
  const acceptString = useMemo(() => {
    if (folderType === "other") return undefined;
    return (allowedMimeTypes[folderType] || []).join(",");
  }, [folderType]);

  // Validate file type
  const isFileAllowed = (file) => {
    if (folderType === "other") return true;
    return (allowedMimeTypes[folderType] || []).includes(file.type);
  };

  const onDrop = (acceptedFiles) => {
    // Filter out files that are not allowed
    const validFiles = acceptedFiles.filter(isFileAllowed);
    const invalidFiles = acceptedFiles.filter((f) => !isFileAllowed(f));
    if (invalidFiles.length > 0) {
      alert(
        `Some files were not allowed: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`
      );
    }
    setMyFiles((prev) => [...prev, ...validFiles]);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: acceptString,
    maxFiles: 5,
    onDrop,
  });

  const uploadFile = async () => {
    if (!folder) {
      alert("No folder selected.");
      return;
    }
    if (myFiles.length === 0) {
      alert("Please add files before uploading");
      return;
    }
    setLoading(true);
    try {
      for (let i = 0; i < myFiles.length; i++) {
        await uploadMediaFile(folder._id, myFiles[i]);
      }
      await fetchFiles(folder._id, true);
      setMyFiles([]);
      setVisible(false);
      if (onUpload) onUpload();
    } catch (err) {
      // Error notification handled in context
    }
    setLoading(false);
  };

  const removeFile = (file) => () => {
    setMyFiles((prev) => prev.filter((f) => f !== file));
  };

  const acceptedFileItems = myFiles.map((file) => (
    <li key={file.path || file.name} className="font-paragraph-white">
      {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
      <CloseCircleOutlined
        onClick={removeFile(file)}
        style={{ marginLeft: "10px" }}
      />
    </li>
  ));

  return (
    <Modal
      title="Upload File"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => {
        setVisible(false);
        setMyFiles([]);
      }}
      footer={false}
      width="50%"
    >
      <div className="container">
        <div
          className="dropzone"
          {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
        >
          <input {...getInputProps({ multiple: true })} />
          <p>Drag 'n' drop some files here, or click to select files</p>
          <em>(5 files are the maximum number of files you can drop here)</em>
        </div>
        <aside>
          <h4 className="font-heading-white">Files</h4>
          <ul style={{ listStyleType: "none" }}>{acceptedFileItems}</ul>
        </aside>
        {loading ? (
          <LoadingOutlined
            style={{ fontSize: "30px", color: "#ff7700", marginTop: "20px" }}
          />
        ) : (
          <button
            className="common-orange-button font-paragraph-white"
            onClick={uploadFile}
            style={{ marginTop: "20px" }}
          >
            Upload File
          </button>
        )}
      </div>
    </Modal>
  );
};

export default MediaFileUploader;
