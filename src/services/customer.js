import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createCustomerDetails(values, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/customerDetails/${id}`, {
      gender: values.gender,
      customerDetails: values,
    })
    .then((res) => ({ data: res.data, success: true }))
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update information!", "");
      console.log(err);
    });
}

export function getPhotoUploadUrl({ filename, mimeType }) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/customerDetails/photo-upload`, {
      filename,
      mimeType,
    })
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to prepare photo upload", "");
      throw err;
    });
}

// Fire-and-forget: kicks off server-side optimization (sharp for images,
// MediaConvert for videos) after the S3 PUT. The file URL stays valid either
// way, so failures are silently ignored.
export function confirmPhotoUpload({ s3Key, mimeType }) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/photo-upload/confirm`,
      { s3Key, mimeType }
    )
    .catch((err) => {
      console.log(err);
    });
}

export function addChallengeToCustomerDetail(userId, challengeId) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/auth/mollie/add/challenges`, {
      challengeId,
      userId,
    })
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Congratulations! Challenge added to your profile!",
        ""
      );
      // window.location.reload(false);
      return { data: res.data, success: true };
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to enroll you to challenge!",
        ""
      );
      console.log(err);
    });
}

// ─── Favourite Challenges ─── parallel to favouriteRecipe* in services/recipes.js
export function favouriteChallengeById(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/favouriteChallenge/${id}`,
      body,
    )
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Challenge added to favourites!",
        "",
      );
      return res.data;
    })
    .catch((err) => {
      const msg = err?.response?.data?.msg;
      openNotificationWithIcon(
        "error",
        msg || "Unable to add challenge to favourites",
        "",
      );
    });
}

export function unFavouriteChallengeById(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/unfavouriteChallenge/${id}`,
      body,
    )
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Challenge removed from favourites!",
        "",
      );
      return res.data;
    })
    .catch((err) => {
      const msg = err?.response?.data?.msg;
      openNotificationWithIcon(
        "error",
        msg || "Unable to remove challenge from favourites",
        "",
      );
    });
}

export function getAllFavouriteChallenges(id) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/favouriteChallenge/${id}`,
    )
    .then((res) => res.data)
    .catch((err) => {
      // 400 "Have not favourited any challenges yet" is expected for new users
      console.log(err);
    });
}
