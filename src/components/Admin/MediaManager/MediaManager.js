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
import {
  getAllVideos,
  getAllImages,
  getAllDocs,
  getAllMusics,
  getAllVoiceOvers,
  deleteMediaFiles,
  getAllIcons,
  getAllFoods,
  getAllTemps,
  getAllRcFiles,
} from "../../../services/mediaManager";
import setAuthToken from "../../../helpers/setAuthToken";

// Hook that sets up our file map and defines functions used to mutate - `deleteFiles`,
// `moveFiles`, and so on.
const useCustomFileMap = () => {
  // Setup the React state for our file map and the current folder.
  const [fileMap, setFileMap] = useState({
    qwerty123456: {
      id: "qwerty123456",
      name: "Media Manager",
      isDir: true,
      childrenIds: [
        "images-e598a85f843c",
        "videos-s9514a3d74d57",
        "docs-e598a85f843b",
        "voiceOvers-e598a85f84gb",
        "musics-e598a85f8lgb",
        "docs-e598a85f843b",
        "icons-e598a85f843b",
        "foods-e598a85f843b",
        "temps-e598a85f843b",
        "rc1-e598a85f843b",
        "rc2-e598a85f843b",
        "rc3-e598a85f843b",
        "rc4-e598a85f843b",
        "rc5-e598a85f843b",
        "rc6-e598a85f843b",
        "rc7-e598a85f843b",
        "rc8-e598a85f843b",
        "rc9-e598a85f843b",
        "rc10-e598a85f843b",
      ],
      childrenCount: 5,
    },

    "images-e598a85f843c": {
      id: "images-e598a85f843c",
      name: "Images",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "videos-s9514a3d74d57": {
      id: "videos-s9514a3d74d57",
      name: "Videos",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "voiceOvers-e598a85f84gb": {
      id: "voiceOvers-e598a85f84gb",
      name: "Voice Overs",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "musics-e598a85f8lgb": {
      id: "musics-e598a85f8lgb",
      name: "Musics",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "docs-e598a85f843b": {
      id: "docs-e598a85f843b",
      name: "Document",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "icons-e598a85f843b": {
      id: "icons-e598a85f843b",
      name: "Icons",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "foods-e598a85f843b": {
      id: "foods-e598a85f843b",
      name: "Foods",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "temps-e598a85f843b": {
      id: "temps-e598a85f843b",
      name: "Temps",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },

    "rc1-e598a85f843b": {
      id: "rc1-e598a85f843b",
      name: "RC001",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc2-e598a85f843b": {
      id: "rc2-e598a85f843b",
      name: "RC002",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc3-e598a85f843b": {
      id: "rc3-e598a85f843b",
      name: "RC003",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc4-e598a85f843b": {
      id: "rc4-e598a85f843b",
      name: "RC004",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc5-e598a85f843b": {
      id: "rc5-e598a85f843b",
      name: "RC005",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc6-e598a85f843b": {
      id: "rc6-e598a85f843b",
      name: "RC006",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc7-e598a85f843b": {
      id: "rc7-e598a85f843b",
      name: "RC007",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc8-e598a85f843b": {
      id: "rc8-e598a85f843b",
      name: "RC008",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc9-e598a85f843b": {
      id: "rc9-e598a85f843b",
      name: "RC009",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
    "rc10-e598a85f843b": {
      id: "rc10-e598a85f843b",
      name: "RC010",
      isDir: true,
      parentId: "qwerty123456",
      childrenIds: [],
    },
  });
  const [currentFolderId, setCurrentFolderId] = useState("qwerty123456");
  const [currentFolderName, setCurrentFolderName] = useState("Media Manager");
  const currentFolderIdRef = useRef(currentFolderId);

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));
    getAllMedia();
    currentFolderIdRef.current = currentFolderId;
  }, [currentFolderId]);

  // get all videos from backend
  const getAllMedia = async () => {
    const videoFiles = await getAllVideos();
    const imageFiles = await getAllImages();
    const docFiles = await getAllDocs();
    const voiceOverFiles = await getAllVoiceOvers();
    const musicFiles = await getAllMusics();
    // new folders
    const iconFiles = await getAllIcons();
    const foodFiles = await getAllFoods();
    const tempFiles = await getAllTemps();

    // for rc folders
    const rc1Files = await getAllRcFiles("rc1");
    const rc2Files = await getAllRcFiles("rc2");
    const rc3Files = await getAllRcFiles("rc3");
    const rc4Files = await getAllRcFiles("rc4");
    const rc5Files = await getAllRcFiles("rc5");
    const rc6Files = await getAllRcFiles("rc6");
    const rc7Files = await getAllRcFiles("rc7");
    const rc8Files = await getAllRcFiles("rc8");
    const rc9Files = await getAllRcFiles("rc9");
    const rc10Files = await getAllRcFiles("rc10");

    const musicIds = musicFiles ? musicFiles.musics.map((f) => f._id) : [];
    const videoIds = videoFiles ? videoFiles.videos.map((f) => f._id) : [];
    const imageIds = imageFiles ? imageFiles.images.map((f) => f._id) : [];
    const docIds = docFiles ? docFiles.docs.map((f) => f._id) : [];
    const voiceOverIds = voiceOverFiles
      ? voiceOverFiles.voiceOvers.map((f) => f._id)
      : [];
    // new folders
    const iconIds = iconFiles ? iconFiles.files.map((f) => f._id) : [];
    const foodIds = foodFiles ? foodFiles.files.map((f) => f._id) : [];
    const tempIds = tempFiles ? tempFiles.files.map((f) => f._id) : [];
    // rc folders
    const rc1Ids = rc1Files ? rc1Files.files.map((f) => f._id) : [];
    const rc2Ids = rc2Files ? rc2Files.files.map((f) => f._id) : [];
    const rc3Ids = rc3Files ? rc3Files.files.map((f) => f._id) : [];
    const rc4Ids = rc4Files ? rc4Files.files.map((f) => f._id) : [];
    const rc5Ids = rc5Files ? rc5Files.files.map((f) => f._id) : [];
    const rc6Ids = rc6Files ? rc6Files.files.map((f) => f._id) : [];
    const rc7Ids = rc7Files ? rc7Files.files.map((f) => f._id) : [];
    const rc8Ids = rc8Files ? rc8Files.files.map((f) => f._id) : [];
    const rc9Ids = rc9Files ? rc9Files.files.map((f) => f._id) : [];
    const rc10Ids = rc10Files ? rc10Files.files.map((f) => f._id) : [];

    const musicObjects = musicIds.map((id, i) => {
      return {
        [id]: {
          name: musicFiles.musics[i].filename,
          id: id,
          link: musicFiles.musics[i].filelink,
          parent: "musics-e598a85f8lgb",
        },
      };
    });
    const docObjects = docIds.map((id, i) => {
      return {
        [id]: {
          name: docFiles.docs[i].filename,
          id: id,
          link: docFiles.docs[i].filelink,
          parent: "docs-e598a85f843b",
        },
      };
    });
    const videoObjects = videoIds.map((id, i) => {
      return {
        [id]: {
          name: videoFiles.videos[i].filename,
          id: id,
          link: videoFiles.videos[i].filelink,
          parent: "videos-s9514a3d74d57",
        },
      };
    });
    console.log("ammar", imageFiles);
    const imageObjects = imageIds.map((id, i) => {
      return {
        [id]: {
          name: imageFiles.images[i].filename,
          id: id,
          link: imageFiles.images[i].filelink,
          parent: "images-e598a85f843c",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${imageFiles.images[i].filelink}`,
        },
      };
    });

    const voiceOverObjects = voiceOverIds.map((id, i) => {
      return {
        [id]: {
          name: voiceOverFiles.voiceOvers[i].filename,
          id: id,
          link: voiceOverFiles.voiceOvers[i].filelink,
          parent: "voiceOvers-e598a85f84gb",
        },
      };
    });

    // new folder
    const iconObjects = iconIds.map((id, i) => {
      return {
        [id]: {
          name: iconFiles.files[i].filename,
          id: id,
          link: iconFiles.files[i].filelink,
          parent: "icons-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${iconFiles.files[i].filelink}`,
        },
      };
    });

    const foodObjects = foodIds.map((id, i) => {
      return {
        [id]: {
          name: foodFiles.files[i].filename,
          id: id,
          link: foodFiles.files[i].filelink,
          parent: "foods-e598a85f843b",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${foodFiles.files[i].filelink}`,
        },
      };
    });

    const tempObjects = tempIds.map((id, i) => {
      return {
        [id]: {
          name: tempFiles.files[i].filename,
          id: id,
          link: tempFiles.files[i].filelink,
          parent: "temps-e598a85f843b",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${tempFiles.files[i].filelink}`,
        },
      };
    });

    const rc1Objects = rc1Ids.map((id, i) => {
      return {
        [id]: {
          name: rc1Files.files[i].filename,
          id: id,
          link: rc1Files.files[i].filelink,
          parent: "rc1-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc1Files.files[i].filelink}`,
        },
      };
    });

    const rc2Objects = rc2Ids.map((id, i) => {
      return {
        [id]: {
          name: rc2Files.files[i].filename,
          id: id,
          link: rc2Files.files[i].filelink,
          parent: "rc2-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc2Files.files[i].filelink}`,
        },
      };
    });

    const rc3Objects = rc3Ids.map((id, i) => {
      return {
        [id]: {
          name: rc3Files.files[i].filename,
          id: id,
          link: rc3Files.files[i].filelink,
          parent: "rc3-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc3Files.files[i].filelink}`,
        },
      };
    });
    const rc4Objects = rc4Ids.map((id, i) => {
      return {
        [id]: {
          name: rc4Files.files[i].filename,
          id: id,
          link: rc4Files.files[i].filelink,
          parent: "rc4-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc4Files.files[i].filelink}`,
        },
      };
    });
    const rc5Objects = rc5Ids.map((id, i) => {
      return {
        [id]: {
          name: rc5Files.files[i].filename,
          id: id,
          link: rc5Files.files[i].filelink,
          parent: "rc5-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc5Files.files[i].filelink}`,
        },
      };
    });
    const rc6Objects = rc6Ids.map((id, i) => {
      return {
        [id]: {
          name: rc6Files.files[i].filename,
          id: id,
          link: rc6Files.files[i].filelink,
          parent: "rc6-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc6Files.files[i].filelink}`,
        },
      };
    });
    const rc7Objects = rc7Ids.map((id, i) => {
      return {
        [id]: {
          name: rc7Files.files[i].filename,
          id: id,
          link: rc7Files.files[i].filelink,
          parent: "rc7-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc7Files.files[i].filelink}`,
        },
      };
    });
    const rc8Objects = rc8Ids.map((id, i) => {
      return {
        [id]: {
          name: rc8Files.files[i].filename,
          id: id,
          link: rc8Files.files[i].filelink,
          parent: "rc8-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc8Files.files[i].filelink}`,
        },
      };
    });
    const rc9Objects = rc9Ids.map((id, i) => {
      return {
        [id]: {
          name: rc9Files.files[i].filename,
          id: id,
          link: rc9Files.files[i].filelink,
          parent: "rc9-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc9Files.files[i].filelink}`,
        },
      };
    });
    const rc10Objects = rc10Ids.map((id, i) => {
      return {
        [id]: {
          name: rc10Files.files[i].filename,
          id: id,
          link: rc10Files.files[i].filelink,
          parent: "rc10-e598a85f84gb",
          thumbnailUrl: `${process.env.REACT_APP_SERVER}/uploads/${rc10Files.files[i].filelink}`,
        },
      };
    });

    setFileMap((currentFileMap) => {
      var newFileMap = { ...currentFileMap };
      newFileMap["videos-s9514a3d74d57"] = {
        ...newFileMap["videos-s9514a3d74d57"],
        childrenIds: videoIds,
      };
      newFileMap["musics-e598a85f8lgb"] = {
        ...newFileMap["musics-e598a85f8lgb"],
        childrenIds: musicIds,
      };
      newFileMap["images-e598a85f843c"] = {
        ...newFileMap["images-e598a85f843c"],
        childrenIds: imageIds,
      };

      newFileMap["docs-e598a85f843b"] = {
        ...newFileMap["docs-e598a85f843b"],
        childrenIds: docIds,
      };
      newFileMap["voiceOvers-e598a85f84gb"] = {
        ...newFileMap["voiceOvers-e598a85f84gb"],
        childrenIds: voiceOverIds,
      };
      //new
      newFileMap["icons-e598a85f843b"] = {
        ...newFileMap["icons-e598a85f843b"],
        childrenIds: iconIds,
      };
      newFileMap["foods-e598a85f843b"] = {
        ...newFileMap["foods-e598a85f843b"],
        childrenIds: foodIds,
      };
      newFileMap["temps-e598a85f843b"] = {
        ...newFileMap["temps-e598a85f843b"],
        childrenIds: tempIds,
      };

      newFileMap["temps-e598a85f843b"] = {
        ...newFileMap["temps-e598a85f843b"],
        childrenIds: tempIds,
      };

      newFileMap["rc1-e598a85f843b"] = {
        ...newFileMap["rc1-e598a85f843b"],
        childrenIds: rc1Ids,
      };

      newFileMap["rc2-e598a85f843b"] = {
        ...newFileMap["rc2-e598a85f843b"],
        childrenIds: rc2Ids,
      };

      newFileMap["rc3-e598a85f843b"] = {
        ...newFileMap["rc3-e598a85f843b"],
        childrenIds: rc3Ids,
      };

      newFileMap["rc4-e598a85f843b"] = {
        ...newFileMap["rc4-e598a85f843b"],
        childrenIds: rc4Ids,
      };

      newFileMap["rc5-e598a85f843b"] = {
        ...newFileMap["rc5-e598a85f843b"],
        childrenIds: rc5Ids,
      };

      newFileMap["rc6-e598a85f843b"] = {
        ...newFileMap["rc6-e598a85f843b"],
        childrenIds: rc6Ids,
      };

      newFileMap["rc7-e598a85f843b"] = {
        ...newFileMap["rc7-e598a85f843b"],
        childrenIds: rc7Ids,
      };

      newFileMap["rc8-e598a85f843b"] = {
        ...newFileMap["rc8-e598a85f843b"],
        childrenIds: rc8Ids,
      };

      newFileMap["rc9-e598a85f843b"] = {
        ...newFileMap["rc9-e598a85f843b"],
        childrenIds: rc9Ids,
      };

      newFileMap["rc10-e598a85f843b"] = {
        ...newFileMap["rc10-e598a85f843b"],
        childrenIds: rc10Ids,
      };

      musicObjects.forEach((obj, i) => {
        newFileMap[musicIds[i]] = { ...obj[musicIds[i]] };
      });
      imageObjects.forEach((obj, i) => {
        newFileMap[imageIds[i]] = { ...obj[imageIds[i]] };
      });
      videoObjects.forEach((obj, i) => {
        newFileMap[videoIds[i]] = { ...obj[videoIds[i]] };
      });
      docObjects.forEach((obj, i) => {
        newFileMap[docIds[i]] = { ...obj[docIds[i]] };
      });
      voiceOverObjects.forEach((obj, i) => {
        newFileMap[voiceOverIds[i]] = { ...obj[voiceOverIds[i]] };
      });
      // new
      foodObjects.forEach((obj, i) => {
        newFileMap[foodIds[i]] = { ...obj[foodIds[i]] };
      });
      iconObjects.forEach((obj, i) => {
        newFileMap[iconIds[i]] = { ...obj[iconIds[i]] };
      });
      tempObjects.forEach((obj, i) => {
        newFileMap[tempIds[i]] = { ...obj[tempIds[i]] };
      });
      //rc
      rc1Objects.forEach((obj, i) => {
        newFileMap[rc1Ids[i]] = { ...obj[rc1Ids[i]] };
      });
      rc2Objects.forEach((obj, i) => {
        newFileMap[rc2Ids[i]] = { ...obj[rc2Ids[i]] };
      });
      rc3Objects.forEach((obj, i) => {
        newFileMap[rc3Ids[i]] = { ...obj[rc3Ids[i]] };
      });
      rc4Objects.forEach((obj, i) => {
        newFileMap[rc4Ids[i]] = { ...obj[rc4Ids[i]] };
      });
      rc5Objects.forEach((obj, i) => {
        newFileMap[rc5Ids[i]] = { ...obj[rc5Ids[i]] };
      });
      rc6Objects.forEach((obj, i) => {
        newFileMap[rc6Ids[i]] = { ...obj[rc6Ids[i]] };
      });
      rc7Objects.forEach((obj, i) => {
        newFileMap[rc7Ids[i]] = { ...obj[rc7Ids[i]] };
      });
      rc8Objects.forEach((obj, i) => {
        newFileMap[rc8Ids[i]] = { ...obj[rc8Ids[i]] };
      });
      rc9Objects.forEach((obj, i) => {
        newFileMap[rc9Ids[i]] = { ...obj[rc9Ids[i]] };
      });
      rc10Objects.forEach((obj, i) => {
        newFileMap[rc10Ids[i]] = { ...obj[rc10Ids[i]] };
      });

      return newFileMap;
    });
  };

  // Function that will be called when user deletes files either using the toolbar
  // button or `Delete` key.
  const deleteFiles = useCallback((files) => {
    console.log(files);

    setFileMap((currentFileMap) => {
      // Create a copy of the file map to make sure we don't mutate it.
      const newFileMap = { ...currentFileMap };

      files.forEach((file) => {
        // Delete file from the file map.
        delete newFileMap[file.id];

        // Update the parent folder to make sure it doesn't try to load the
        // file we just deleted.
        if (file.parentId) {
          const parent = newFileMap[file.parentId];
          const newChildrenIds = parent.childrenIds.filter(
            (id) => id !== file.id
          );
          newFileMap[file.parentId] = {
            ...parent,
            childrenIds: newChildrenIds,
            childrenCount: newChildrenIds.length,
          };
        }
      });

      return newFileMap;
    });
  }, []);

  return {
    getAllMedia,
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    deleteFiles,
  };
};

export const useFiles = (fileMap, currentFolderId) => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];
    const childrenIds = currentFolder.childrenIds;
    const files = childrenIds.map((fileId) => fileMap[fileId]);
    return files;
  }, [currentFolderId, fileMap]);
};

export const useFolderChain = (fileMap, currentFolderId) => {
  return useMemo(() => {
    const currentFolder = fileMap[currentFolderId];

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
  deleteFiles,
  moveFiles,
  createFolder,
  setOpenUploadModal,
  mediaActions,
  mediaType,
  setRemoteMediaManagerVisible,
  checkForType
) => {
  return useCallback(
    async (data) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];
        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          setCurrentFolderId(fileToOpen.id);
          setCurrentFolderName(fileToOpen.name);
          console.log("ads", fileToOpen);
          return;
        }
        const [media, setMedia] = mediaActions;
        console.log("media actions", mediaActions);
        console.log("media type", mediaType);
        console.log("target file parent", targetFile);
        // here yo
        if (checkForType(targetFile.name, mediaType)) {
          console.log(mediaType);
          if (mediaActions[2]) {
            // check if 3rd option says that there are multiple images
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
          console.log("media", mediaType);
          window.alert("Wrong media type selected");
        }
      } else if (data.id === ChonkyActions.DeleteFiles.id) {
        console.log(data.state.selectedFilesForAction);
        const deletedFiles = await deleteMediaFiles(
          data.state.selectedFilesForAction
        );
        // console.log(deletedFiles);
        if (deletedFiles.status === "success") {
          deleteFiles(deletedFiles.deleted);
        }
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        setOpenUploadModal(true);
      } else if (data.id === "open_files") {
      }
    },
    [createFolder, deleteFiles, moveFiles, setCurrentFolderId]
  );
};

function checkForType(file, fileType) {
  var parts = file.split(".");
  var ext = parts[parts.length - 1];

  if (fileType === "images") {
    switch (ext.toLowerCase()) {
      case "png":
      case "jpeg":
      case "jpg":
      case "tiff":
        // etc
        return true;
    }

    return false;
  } else if (fileType === "videos") {
    switch (ext.toLowerCase()) {
      case "m4v":
      case "avi":
      case "mpg":
      case "mp4":
        // etc
        return true;
    }

    return false;
  } else if (fileType === "docs") {
    const isPdf = ext.toLowerCase() === "pdf";
    return isPdf;
  } else if (fileType === "voiceOvers") {
    switch (ext.toLowerCase()) {
      case "mp3":
        // etc
        return true;
    }

    return false;
  } else if (fileType === "musics") {
    switch (ext.toLowerCase()) {
      case "mp3":
      case "mp4":
        // etc
        return true;
    }

    return false;
  }
}

export const VFSBrowser = React.memo((props) => {
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const {
    getAllMedia,
    fileMap,
    currentFolderId,
    setCurrentFolderId,
    setCurrentFolderName,
    currentFolderName,
    resetFileMap,
    deleteFiles,
    moveFiles,
    createFolder,
  } = useCustomFileMap();
  const files = useFiles(fileMap, currentFolderId);
  const folderChain = useFolderChain(fileMap, currentFolderId);
  const mediaActions = props.actions;
  const mediaType = props.mediaType;
  const setRemoteMediaManagerVisible = props.setRemoteMediaManagerVisible;
  const handleFileAction = useFileActionHandler(
    setCurrentFolderName,
    setCurrentFolderId,
    deleteFiles,
    moveFiles,
    createFolder,
    setOpenUploadModal,
    mediaActions,
    mediaType,
    setRemoteMediaManagerVisible,
    checkForType
  );
  const fileActions = useMemo(
    () => [
      // ChonkyActions.CreateFolder,
      ChonkyActions.DeleteFiles,
      ChonkyActions.UploadFiles,
    ],
    []
  );

  const thumbnailGenerator = useCallback(
    (file) => (file.thumbnailUrl ? file.thumbnailUrl : null),
    []
  );

  return (
    <>
      <div style={{ height: "100vh" }}>
        <MediaFileUploader
          currentFolderName={currentFolderName}
          visible={openUploadModal}
          getAllMedia={getAllMedia}
          setVisible={setOpenUploadModal}
        />
        <FullFileBrowser
          files={files}
          folderChain={folderChain}
          fileActions={fileActions}
          onFileAction={handleFileAction}
          thumbnailGenerator={thumbnailGenerator}
          {...props}
        />
      </div>
    </>
  );
});
