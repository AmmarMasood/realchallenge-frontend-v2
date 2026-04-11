import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getCreatorById(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/creator/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get creator");
      console.log(err);
    });
}

export function getChallengesByUserId(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/creator/${id}/challenges`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { challenges: [] };
    });
}

export function getRecipesByUserId(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/creator/${id}/recipes`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { recipes: [] };
    });
}
