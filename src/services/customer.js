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
