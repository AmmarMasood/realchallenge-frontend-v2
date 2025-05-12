import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createChallengeTag(name) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/tags/create`, { name })
    .then((res) =>
      openNotificationWithIcon("success", "Successfully Created", "")
    )
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to create", "");
    });
}

export function getAllChallengeTags(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/tags?language=${language}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get tags", "");
    });
}

export function deleteChallengeTag(id) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/tags/${id}/delete`)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully deleted tag", "");
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to delete tag", "");
    });
}
