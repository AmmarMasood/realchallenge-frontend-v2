import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllChallengeProducts() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/product`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get products", "");
    });
}
