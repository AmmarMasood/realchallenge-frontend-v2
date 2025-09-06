import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllUsers() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/users`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get users");
      console.log(err);
    });
}

export function createUserByAdmin(userInfo) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/users/createUser`, userInfo)
    .then((res) => {
      openNotificationWithIcon("success", "User created successfully!");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to create user");
      console.log(err);
    });
}

export function updateUserProfileByAdmin(userInfo, id, type) {
  if (type === "trainer") {
    return axios
      .put(`${process.env.REACT_APP_SERVER}/api/trainers/${id}`, userInfo)
      .then((res) => {
        openNotificationWithIcon("success", "User updated successfully!");
        return res.data;
      })
      .catch((err) => {
        openNotificationWithIcon("error", "Unable to update user");
        console.log(err);
      });
  } else {
    return axios
      .post(`${process.env.REACT_APP_SERVER}/api/users/${id}/update`, userInfo)
      .then((res) => {
        openNotificationWithIcon("success", "User updated successfully!");
        return res.data;
      })
      .catch((err) => {
        openNotificationWithIcon("error", "Unable to update user");
        console.log(err);
      });
  }
}

export function deleteUser(id) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/users/${id}/delete`)
    .then((res) => {
      openNotificationWithIcon("success", "User deleted successfully!");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to delete successfully");
      console.log(err);
    });
}
export function getUserProfileInfo(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/customerDetails/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      return err;
      // openNotificationWithIcon("error", "Unable to get user information");
    });
}

export function getRecommandedChallenges(id, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/recommendedChallenges/${id}`
    )
    .then((res) => res.data)
    .catch((err) => {
      return err;
    });
}

export function getNotifications() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/notification`)
    .then((res) => res.data)
    .catch((err) => {
      return err;
    });
}

export function markNotificationsAsRead(id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/notification/read/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      return err;
    });
}

export function getRecommandedWeeklyDiet(id) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/recommendedWeeklyDiet/${id}`
    )
    .then((res) => res.data)
    .catch((err) => {
      return err;
    });
}
export function swapRecipeInRecommandedNutrients(customerId, meal) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/swap/${customerId}`,
      meal
    )
    .then((res) => {
      openNotificationWithIcon("success", "Recipe swaped successfully!");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to swap recipe!");
      return err;
    });
}

export function saveChallengeProgress(data, customerId) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/track-challenge/${customerId}`,
      { progress: data }
    )
    .then((res) => {
      openNotificationWithIcon("success", "Progress updated");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update progress!");
      return err;
    });
}

export function getChallengeProgress(challengeId) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/track-challenge/${challengeId}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get challenge progress!");
      return err;
    });
}

export function getUserPoints(userPoints, setUserPoints) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/points/get-points`
    )
    .then((res) => {
      if (res && res.data) {
        const p = res.data.points;
        setUserPoints(p);
        return res.data;
      }
    })
    .catch((err) => {
      console.log(err);
      // openNotificationWithIcon("error", "Unable to get user points!");
      return err;
    });
}

export function availMyPoints(setUserPoints) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/points/use-points`
    )
    .then((res) => {
      // return;
      if (res && res.data) {
        const p = res.data.points;
        setUserPoints(p);
        return res.data;
      }
    })
    .catch((err) => {
      console.log(err);
      // openNotificationWithIcon("error", "Unable to use user points!");
      return err;
    });
}

export function getUsersProfile() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/users/profile`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to user");
      console.log(err);
    });
}
