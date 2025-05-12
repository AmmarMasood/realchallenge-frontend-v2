import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createBodyFocus(name) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/body/create`, { name })
    .then((res) =>
      openNotificationWithIcon("success", "Successfully Created", "")
    )
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to create", "");
    });
}

export function updateBodyFocus(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/body/${id}`, { name })
    .then((res) =>
      openNotificationWithIcon("success", "Successfully Updated", "")
    )
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to update", "");
    });
}

export function getAllBodyFocus(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/body?language=${language}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get body focus", "");
    });
}

export function deleteChallengeBodyfocus(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/body/${id}`)
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Successfully deleted body focus part",
        ""
      );
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to delete body focus part", "");
    });
}
