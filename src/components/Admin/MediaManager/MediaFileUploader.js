import React, { useState, useMemo } from "react";
import { Modal, Progress } from "antd";
import {
  LoadingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDropzone } from "react-dropzone";
import { useMediaManager } from "../../../contexts/MediaManagerContext";
import axios from "axios";
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
  const [uploadProgress, setUploadProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(new Set());
  const [simulateSlowUpload, setSimulateSlowUpload] = useState(false);
  const [useBackendProgress, setUseBackendProgress] = useState(true);
  const [progressMessages, setProgressMessages] = useState({});

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
    setUploadProgress({});
    setOverallProgress(0);
    setCompletedFiles(new Set());
    setProgressMessages({});

    try {
      const totalFiles = myFiles.length;
      let completedCount = 0;

      for (let i = 0; i < myFiles.length; i++) {
        const file = myFiles[i];
        const fileId = file.name + file.size; // unique identifier for each file

        // Start upload for this file
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { progress: 0, status: "uploading" },
        }));

        try {
          // Create progress callbacks for this specific file
          let lastProgressUpdate = 0;

          const onProgress = (progressPercent, stage, message) => {
            const now = Date.now();
            // Throttle updates to every 100ms for smoother animation
            if (
              now - lastProgressUpdate > 100 ||
              progressPercent === 0 ||
              progressPercent === 100
            ) {
              lastProgressUpdate = now;
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: {
                  progress: progressPercent,
                  status: "uploading",
                  stage: stage || "uploading",
                },
              }));
            }
          };

          const onMessage = (message) => {
            setProgressMessages((prev) => ({
              ...prev,
              [fileId]: message,
            }));
          };

          if (simulateSlowUpload) {
            await simulateUploadWithProgress(folder._id, file, onProgress);
          } else if (useBackendProgress) {
            await uploadMediaFileWithEnhancedProgress(
              folder._id,
              file,
              onProgress,
              onMessage
            );
          } else {
            await uploadMediaFileWithProgress(folder._id, file, onProgress);
          }

          // Mark file as completed
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { progress: 100, status: "completed" },
          }));

          setCompletedFiles((prev) => new Set([...prev, fileId]));
          completedCount++;

          // Update overall progress
          setOverallProgress(Math.round((completedCount / totalFiles) * 100));
        } catch (fileErr) {
          // Mark file as failed
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { progress: 0, status: "error" },
          }));
          console.error(`Failed to upload ${file.name}:`, fileErr);
        }
      }

      await fetchFiles(folder._id, true);

      // Small delay to show completion before closing
      setTimeout(() => {
        setMyFiles([]);
        setUploadProgress({});
        setOverallProgress(0);
        setCompletedFiles(new Set());
        setProgressMessages({});
        setVisible(false);
        if (onUpload) onUpload();
      }, 1000);
    } catch (err) {
      // Error notification handled in context
      console.error("Upload error:", err);
    }
    setLoading(false);
  };

  // Enhanced axios upload function with both client-side and backend progress tracking
  const uploadMediaFileWithEnhancedProgress = async (
    folderId,
    file,
    onProgress,
    onMessage
  ) => {
    const uploadId = `upload-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log(
      `Starting enhanced axios upload for ${file.name} with ID: ${uploadId}`
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadId", uploadId);

    let clientProgress = 0;
    let backendProgress = 0;
    let useBackendProgress = false;

    try {
      // Establish SSE connection for backend progress if available
      const token = localStorage.getItem("jwtToken");
      const eventSource = new EventSource(
        `${process.env.REACT_APP_SERVER}/api/media/progress/${uploadId}?token=${token}`
      );

      let uploadCompleted = false;
      let sseConnected = false;

      const ssePromise = new Promise((sseResolve, sseReject) => {
        eventSource.onopen = () => {
          console.log(
            `SSE connection established for enhanced upload ${uploadId}`
          );
          sseConnected = true;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`SSE message for enhanced upload ${uploadId}:`, data);

            switch (data.type) {
              case "connected":
                console.log(`SSE connected for enhanced upload ${uploadId}`);
                useBackendProgress = true;
                break;

              case "progress":
                useBackendProgress = true;
                backendProgress = data.progress;
                onProgress(data.progress, data.stage, data.message);
                if (onMessage) onMessage(data.message);
                break;

              case "complete":
                console.log(
                  `Enhanced upload completed for ${uploadId}:`,
                  data.result
                );
                uploadCompleted = true;
                eventSource.close();
                sseResolve(data.result);
                break;

              case "error":
                console.error(
                  `Enhanced upload error for ${uploadId}:`,
                  data.error
                );
                eventSource.close();
                sseReject(new Error(data.error));
                break;
            }
          } catch (parseError) {
            console.error(`Error parsing SSE message:`, parseError);
          }
        };

        eventSource.onerror = (error) => {
          console.error(`SSE error for enhanced upload ${uploadId}:`, error);
          if (!uploadCompleted) {
            eventSource.close();
            if (sseConnected) {
              sseReject(new Error("SSE connection failed"));
            } else {
              // If SSE never connected, fall back to axios-only progress
              console.log(
                `SSE connection failed, falling back to axios-only progress for ${uploadId}`
              );
              sseReject(new Error("SSE_FALLBACK"));
            }
          }
        };

        // SSE timeout
        setTimeout(() => {
          if (!uploadCompleted && sseConnected) {
            console.log(`Enhanced upload ${uploadId} SSE timed out`);
            eventSource.close();
            sseReject(new Error("SSE timed out"));
          }
        }, 10 * 60 * 1000);
      });

      // Start the axios upload
      const axiosPromise = axios.post(
        `${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}/with-progress`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Upload-Id": uploadId,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              clientProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              // Use client progress if backend progress not available
              if (!useBackendProgress) {
                console.log(
                  `Enhanced axios client progress for ${file.name}: ${clientProgress}%`
                );
                onProgress(clientProgress);
              }
            }
          },
          timeout: 300000, // 5 minute timeout
        }
      );

      // Wait for either SSE completion or axios completion
      try {
        const result = await Promise.race([
          ssePromise,
          axiosPromise.then((res) => res.data),
        ]);
        eventSource.close();
        return result;
      } catch (error) {
        eventSource.close();

        // If SSE failed to connect, fall back to axios result
        if (error.message === "SSE_FALLBACK") {
          console.log(`Falling back to axios-only upload for ${file.name}`);
          try {
            const axiosResult = await axiosPromise;
            onProgress(100); // Show completion
            return axiosResult.data;
          } catch (axiosError) {
            throw axiosError;
          }
        }

        throw error;
      }
    } catch (error) {
      console.error(`Enhanced axios upload error for ${file.name}:`, error);

      if (error.code === "ECONNABORTED") {
        throw new Error("Upload timed out");
      } else if (error.response) {
        throw new Error(
          `Upload failed: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        throw new Error("Network error during upload");
      } else {
        throw new Error(error.message || "Upload failed");
      }
    }
  };

  // Axios-based upload function with client-side progress callback
  const uploadMediaFileWithProgress = async (folderId, file, onProgress) => {
    console.log(`Starting axios upload for ${file.name} (${file.size} bytes)`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      onProgress(0); // Initialize progress

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER}/api/media/folders/${folderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(
                `Axios upload progress for ${file.name}: ${percentComplete}%`
              );
              onProgress(percentComplete);
            }
          },
          timeout: 300000, // 5 minute timeout
        }
      );

      onProgress(100); // Ensure we show 100% on completion
      console.log(`Axios upload completed for ${file.name}`);
      return response.data;
    } catch (error) {
      console.error(`Axios upload error for ${file.name}:`, error);

      if (error.code === "ECONNABORTED") {
        throw new Error("Upload timed out");
      } else if (error.response) {
        // Server responded with error status
        throw new Error(
          `Upload failed: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        // Network error
        throw new Error("Network error during upload");
      } else {
        // Other error
        throw new Error(error.message || "Upload failed");
      }
    }
  };

  // Simulated upload function for testing progress (when real uploads are too fast)
  const simulateUploadWithProgress = async (folderId, file, onProgress) => {
    console.log(`Simulating slow upload for ${file.name}`);

    // Simulate progress from 0 to 100
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
      onProgress(progress);
    }

    // Then do the actual upload
    return uploadMediaFileWithProgress(folderId, file, () => {});
  };

  const removeFile = (file) => () => {
    setMyFiles((prev) => prev.filter((f) => f !== file));
  };

  const acceptedFileItems = myFiles.map((file) => {
    const fileId = file.name + file.size;
    const fileProgress = uploadProgress[fileId];
    const progressMessage = progressMessages[fileId];
    const isCompleted = completedFiles.has(fileId);

    return (
      <li
        key={file.path || file.name}
        className="font-paragraph-white"
        style={{ marginBottom: "12px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
            {isCompleted && (
              <CheckCircleOutlined
                style={{ marginLeft: "8px", color: "#52c41a" }}
              />
            )}
          </span>
          {!loading && (
            <CloseCircleOutlined
              onClick={removeFile(file)}
              style={{ marginLeft: "10px", cursor: "pointer" }}
            />
          )}
        </div>
        {fileProgress && (
          <div style={{ marginTop: "4px" }}>
            <Progress
              percent={fileProgress.progress}
              size="small"
              status={
                fileProgress.status === "completed"
                  ? "success"
                  : fileProgress.status === "error"
                  ? "exception"
                  : "active"
              }
              showInfo={true}
            />
            {progressMessage && (
              <div
                style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}
              >
                {progressMessage} - {fileProgress.progress}%
              </div>
            )}
          </div>
        )}
      </li>
    );
  });

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

        {loading && myFiles.length > 1 && (
          <div style={{ marginTop: "20px" }}>
            <h4 className="font-heading-white">Overall Upload Progress</h4>
            <Progress
              percent={overallProgress}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              format={(percent) => `${percent}%`}
            />
            <p
              className="font-paragraph-white"
              style={{ marginTop: "8px", fontSize: "14px" }}
            >
              Uploading {myFiles.length} files...
            </p>
          </div>
        )}

        {loading && myFiles.length === 1 && (
          <div style={{ marginTop: "20px" }}>
            <p
              className="font-paragraph-white"
              style={{ fontSize: "14px", textAlign: "center" }}
            >
              Uploading {myFiles[0].name}...
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
          </div>
        ) : (
          <button
            className="common-orange-button font-paragraph-white"
            onClick={uploadFile}
            style={{ marginTop: "20px" }}
            disabled={myFiles.length === 0}
          >
            Upload{" "}
            {myFiles.length > 0
              ? `${myFiles.length} File${myFiles.length > 1 ? "s" : ""}`
              : "Files"}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default MediaFileUploader;
