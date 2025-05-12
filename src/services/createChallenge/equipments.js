import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createChallengeEquipment(values) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/equipment/create`, values)
    .then((res) =>
      openNotificationWithIcon("success", "Successfully Created", "")
    )
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to create", "");
    });
}

export function updateChallengeEquipment(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/equipment/${id}`, {
      name,
    })
    .then((res) =>
      openNotificationWithIcon("success", "Successfully updated", "")
    )
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to update", "");
    });
}

export function getAllChallengeEquipments(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/equipment?language=${language}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get equpments", "");
    });
}

export function deleteChallengeEquipment(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/equipment/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully deleted equipment", "");
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to delete equipment", "");
    });
}
