// import React, { useState, useEffect } from "react";
// import { Modal, Select, Button, Upload, message } from "antd";
// import {
//   UploadOutlined,
//   CloseCircleOutlined,
//   LoadingOutlined,
// } from "@ant-design/icons";
// import {
//   uploadImage,
//   uploadVideo,
//   uploadDoc,
//   uploadVoiceOver,
//   uploadMusic,
// } from "../../../services/mediaManager";

// const Option = { Select };
// function MediaFileUploader({
//   visible,
//   setVisible,
//   getAllMedia,
//   currentFolderName,
// }) {
//   const [file, setFile] = useState(null);
//   const [folderType, setFolderType] = useState("images");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     switch (currentFolderName) {
//       case "Images":
//         setFolderType("images");
//         break;
//       case "Videos":
//         setFolderType("videos");
//         break;
//       case "Musics":
//         setFolderType("musics");
//         break;
//       case "Document":
//         setFolderType("docs");
//         break;
//       case "Voice Overs":
//         setFolderType("voiceOvers");
//         break;
//       default:
//         setFolderType("images");
//       // code block
//     }
//   }, [currentFolderName]);

//   const dummyRequest = ({ file, onSuccess }) => {
//     setFile(file);
//     setTimeout(() => {
//       onSuccess("ok");
//     }, 0);
//   };

//   function beforeUpload(file) {
//     if (folderType === "images") {
//       const isJpgOrPng =
//         file.type === "image/jpeg" || file.type === "image/png";
//       if (!isJpgOrPng) {
//         message.error("You can only upload JPG/PNG file!");
//       }

//       return isJpgOrPng;
//     } else if (folderType === "videos") {
//       var parts = file.name.split(".");
//       var ext = parts[parts.length - 1];
//       switch (ext.toLowerCase()) {
//         case "m4v":
//         case "avi":
//         case "mpg":
//         case "mp4":
//           // etc
//           return true;
//       }

//       message.error("You can only upload video file!");
//       return false;
//     } else if (folderType === "docs") {
//       const isPdf = file.type === "application/pdf";
//       if (!isPdf) {
//         message.error("You can only upload PDF file in document folder!");
//       }
//       return isPdf;
//     } else if (folderType === "voiceOvers") {
//       const isMusic = file.type === "audio/mpeg";
//       if (!isMusic) {
//         message.error("You can only upload audio file in voice over folder!");
//       }
//       return isMusic;
//     } else if (folderType === "musics") {
//       const isMusic = file.type === "audio/mpeg";
//       if (!isMusic) {
//         message.error("You can only upload audio file in music folder!");
//       }
//       return isMusic;
//     }
//   }

//   const uploadFile = async () => {
//     setLoading(true);
//     if (folderType === "images") {
//       await uploadImage(file);
//     }
//     if (folderType === "videos") {
//       await uploadVideo(file);
//     }

//     if (folderType === "docs") {
//       await uploadDoc(file);
//     }

//     if (folderType === "voiceOvers") {
//       await uploadVoiceOver(file);
//     }
//     if (folderType === "musics") {
//       await uploadMusic(file);
//     }

//     setLoading(false);
//     getAllMedia();
//     setVisible(false);
//   };
//   return (
//     <Modal
//       title="Upload File"
//       visible={visible}
//       onOk={() => setVisible(false)}
//       onCancel={() => {
//         setVisible(false);
//         setFile(null);
//       }}
//       footer={false}
//     >
//       <div style={{ margin: "10px 0" }}>
//         <span className="font-paragraph-white">Select folder:</span>
//         <Select
//           style={{ width: "100%" }}
//           onChange={(e) => setFolderType(e)}
//           defaultValue={folderType}
//           value={folderType}
//         >
//           <Option value="images">Upload to image folder</Option>
//           <Option value="videos">Upload to videos folder</Option>
//           <Option value="docs">Upload to document folder</Option>
//           <Option value="voiceOvers">Upload to voice over folder</Option>
//           <Option value="musics">Upload to musics folder</Option>
//         </Select>
//       </div>

//       <div style={{ margin: "10px 0" }}>
//         <span className="font-paragraph-white" style={{ display: "block" }}>
//           Select file:
//         </span>
//         <Upload
//           beforeUpload={beforeUpload}
//           customRequest={dummyRequest}
//           showUploadList={false}
//           className="hover-orange"
//         >
//           <Button icon={<UploadOutlined />}>Click to Upload</Button>
//         </Upload>
//         {file && (
//           <div
//             className="font-paragraph-white"
//             style={{
//               width: "100%",
//               padding: "5px 0",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               color: "#ff7700",
//             }}
//           >
//             <span>{file.name}</span>
//             <CloseCircleOutlined onClick={() => setFile(null)} />
//           </div>
//         )}
//       </div>
//       {console.log(file)}
//       {loading ? (
//         <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
//       ) : (
//         <button
//           className="common-orange-button font-paragraph-white"
//           onClick={uploadFile}
//         >
//           Upload File
//         </button>
//       )}
//     </Modal>
//   );
// }

// export default MediaFileUploader;

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Select } from "antd";
import { LoadingOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDropzone } from "react-dropzone";
import {
  uploadImage,
  uploadVideo,
  uploadDoc,
  uploadVoiceOver,
  uploadMusic,
  uploadIcons,
  uploadFood,
  uploadTemp,
  uploadRc,
} from "../../../services/mediaManager";
import "../../../assets/mediaManager.css";

const Option = { Select };

const MediaFileUploader = ({
  visible,
  setVisible,
  getAllMedia,
  currentFolderName,
}) => {
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [folderType, setFolderType] = useState("images");

  const onDrop = useCallback(
    (acceptedFiles) => {
      setMyFiles([...myFiles, ...acceptedFiles]);
    },
    [myFiles]
  );

  const {
    getRootProps,
    getInputProps,
    acceptedFiles,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: beforeUpload(), maxFiles: 5, onDrop });

  useEffect(() => {
    switch (currentFolderName) {
      case "Images":
        setFolderType("images");
        break;
      case "Videos":
        setFolderType("videos");
        break;
      case "Musics":
        setFolderType("musics");
        break;
      case "Document":
        setFolderType("docs");
        break;
      case "Voice Overs":
        setFolderType("voiceOvers");
        break;
      case "Foods":
        setFolderType("foods");
        break;
      case "Temps":
        setFolderType("temps");
        break;
      case "Icons":
        setFolderType("icons");
        break;
      case "RC001":
        setFolderType("rc1");
        break;

      case "RC002":
        setFolderType("rc2");
        break;
      case "RC003":
        setFolderType("rc3");
        break;
      case "RC004":
        setFolderType("rc4");
        break;
      case "RC005":
        setFolderType("rc5");
        break;
      case "RC006":
        setFolderType("rc6");
        break;
      case "RC007":
        setFolderType("rc7");
        break;
      case "RC008":
        setFolderType("rc8");
        break;
      case "RC009":
        setFolderType("rc9");
        break;
      case "RC010":
        setFolderType("rc10");
        break;

      default:
        setFolderType("images");
    }
  }, [currentFolderName]);

  function beforeUpload() {
    if (folderType === "images") {
      return "image/jpeg, image/png";
    } else if (folderType === "videos") {
      return "video/mp4";
    } else if (folderType === "docs") {
      return "application/pdf";
    } else if (folderType === "voiceOvers") {
      return "audio/mpeg";
    } else if (folderType === "musics") {
      return "audio/mpeg";
    } else {
      return "image/jpeg, image/png, video/mp4, application/pdf, audio/mpeg";
    }
  }

  // sends requests to backend
  async function uploadFilesToBackend(files, uploadType, foldername) {
    const responses = [];
    setLoading(true);
    if (foldername) {
      for (let i = 0; i < files.length; i++) {
        responses.push(await uploadType(files[i], foldername));
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        responses.push(await uploadType(files[i]));
      }
    }

    setLoading(false);
    getAllMedia();
    setMyFiles([]);
    setVisible(false);
    // console.log("uploadFilesToBackend", responses);
    return responses;
  }
  const uploadFile = async () => {
    console.log(myFiles);
    if (myFiles.length <= 0) {
      alert("Please add files before uploading");
    } else {
      if (folderType === "images") {
        uploadFilesToBackend(myFiles, uploadImage);
      }
      if (folderType === "videos") {
        uploadFilesToBackend(myFiles, uploadVideo);
      }
      if (folderType === "docs") {
        uploadFilesToBackend(myFiles, uploadDoc);
      }
      if (folderType === "voiceOvers") {
        uploadFilesToBackend(myFiles, uploadVoiceOver);
      }
      if (folderType === "musics") {
        uploadFilesToBackend(myFiles, uploadMusic);
      }
      if (folderType === "icons") {
        uploadFilesToBackend(myFiles, uploadIcons);
      }
      if (folderType === "foods") {
        uploadFilesToBackend(myFiles, uploadFood);
      }
      if (folderType === "temps") {
        uploadFilesToBackend(myFiles, uploadTemp);
      }
      // rc
      if (folderType === "rc1") {
        uploadFilesToBackend(myFiles, uploadRc, "rc1");
      }

      if (folderType === "rc2") {
        uploadFilesToBackend(myFiles, uploadRc, "rc2");
      }
      if (folderType === "rc3") {
        uploadFilesToBackend(myFiles, uploadRc, "rc3");
      }
      if (folderType === "rc4") {
        uploadFilesToBackend(myFiles, uploadRc, "rc4");
      }
      if (folderType === "rc5") {
        uploadFilesToBackend(myFiles, uploadRc, "rc5");
      }
      if (folderType === "rc6") {
        uploadFilesToBackend(myFiles, uploadRc, "rc6");
      }
      if (folderType === "rc7") {
        uploadFilesToBackend(myFiles, uploadRc, "rc7");
      }
      if (folderType === "rc8") {
        uploadFilesToBackend(myFiles, uploadRc, "rc8");
      }
      if (folderType === "rc9") {
        uploadFilesToBackend(myFiles, uploadRc, "rc9");
      }
      if (folderType === "rc10") {
        uploadFilesToBackend(myFiles, uploadRc, "rc10");
      }
    }
  };

  const removeFile = (file) => () => {
    const newFiles = [...myFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setMyFiles(newFiles);
  };

  const acceptedFileItems = myFiles.map((file) => (
    <li key={file.path} className="font-paragraph-white">
      {file.path} - {(file.size / (1024 * 1024)).toFixed(2)} MB
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
      }}
      footer={false}
      width="50%"
    >
      {console.log(" {console.log(acceptedFiles)}", acceptedFiles)}
      <div style={{ margin: "10px 0" }}>
        <span className="font-paragraph-white">Select folder:</span>
        <Select
          style={{ width: "100%" }}
          onChange={(e) => setFolderType(e)}
          defaultValue={folderType}
          value={folderType}
        >
          <Option value="images">Upload to image folder</Option>
          <Option value="videos">Upload to videos folder</Option>
          <Option value="docs">Upload to document folder</Option>
          <Option value="voiceOvers">Upload to voice over folder</Option>
          <Option value="musics">Upload to musics folder</Option>
          <Option value="foods">Upload to foods folder</Option>
          <Option value="icons">Upload to icons folder</Option>
          <Option value="temps">Upload to temps folder</Option>
        </Select>
      </div>

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
