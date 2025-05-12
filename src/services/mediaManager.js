import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllVideos() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/videos/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get videos",
        "Sorry we are unable to get the video files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllImages() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/images/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get images",
        "Sorry we are unable to get the image files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllDocs() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/docs/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get docs",
        "Sorry we are unable to get the pdf files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllVoiceOvers() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/voiceOvers/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get voice overs",
        "Sorry we are unable to get the pdf files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllMusics() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/musics/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get musics",
        "Sorry we are unable to get the music files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllIcons() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/icons/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get icons",
        "Sorry we are unable to get the icon files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllTemps() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/temps/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get temp files",
        "Sorry we are unable to get the temp files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllFoods() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/foods/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get food files",
        "Sorry we are unable to get the food files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}

export function getAllRcFiles(foldername) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/media/get/rc/all/${foldername}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to get rc files",
        "Sorry we are unable to get the rc files from our database. Please try again in few moments. If the issue continues please contact us."
      );
      console.log(err);
    });
}
export function uploadImage(file) {
  var formData = new FormData();
  formData.append("image", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/uploadImage`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "Image successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload image", "");
      console.log(err);
    });
}

export function uploadRc(file, foldername) {
  var formData = new FormData();
  formData.append("file", file);
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/media/rc/${foldername}`,
      formData
    )
    .then((res) => {
      openNotificationWithIcon("success", "file successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload file", "");
      console.log(err);
    });
}

export function uploadMusic(file) {
  var formData = new FormData();
  formData.append("music", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/uploadMusic`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "Music successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload music", "");
      console.log(err);
    });
}

export function uploadDoc(file) {
  var formData = new FormData();
  formData.append("doc", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/uploadDoc`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "Document successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload document", "");
      console.log(err);
    });
}

export function uploadVideo(file) {
  var formData = new FormData();
  formData.append("video", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/uploadVideo`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "Video successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload video", "");
      console.log(err);
    });
}

export function uploadVoiceOver(file) {
  var formData = new FormData();
  formData.append("voiceOver", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/uploadVoiceOver`, formData)
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Voice over successfully uploaded",
        ""
      );
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload voice over", "");
      console.log(err);
    });
}

export function uploadTemp(file) {
  var formData = new FormData();
  formData.append("file", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/temps`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "Temps successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload temps", "");
      console.log(err);
    });
}

export function uploadFood(file) {
  var formData = new FormData();
  formData.append("file", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/foods`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "food successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload food", "");
      console.log(err);
    });
}

export function uploadIcons(file) {
  var formData = new FormData();
  formData.append("file", file);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/icons`, formData)
    .then((res) => {
      openNotificationWithIcon("success", "icons successfully uploaded", "");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to upload icons", "");
      console.log(err);
    });
}

export function deleteMediaFiles(files) {
  console.log(files);
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/media/files/delete`, {
      data: files,
    })
    .then((res) => {
      openNotificationWithIcon("success", "file deleted successfully", "");
      return res.data;
    })
    .catch((err) =>
      openNotificationWithIcon("error", "unable to delete files", "")
    );
}
