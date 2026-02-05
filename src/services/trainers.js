import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllTrainers() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/trainers/all`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get trainers");
      console.log(err);
    });
}

export function getAllTrainerGoals(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals/all?language=${language}`
    )
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get trainer goals");
      console.log(err);
    });
}

export function createTrainerGoal(body) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals`, body)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get trainer goals");
      console.log(err);
    });
}

export function updateTrainerGoal(body, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals/${id}`, body)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update trainer goal");
      console.log(err);
    });
}

export function deleteTrainerGoals(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get delete trainer goals");
      console.log(err);
    });
}

// Public endpoint - get all trainer goals in database
export function getAllTrainerGoalsPublic(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals/public/all?language=${language}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { goals: [] };
    });
}

// Public endpoint - get goals for a specific trainer (for viewing their profile)
export function getTrainerGoalsByTrainerId(trainerId, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/trainers/trainerGoals/trainer/${trainerId}?language=${language}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { goals: [] };
    });
}

export function getTrainerById(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/trainers/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get trainers");
      console.log(err);
    });
}

export function updateTrainerById(id, data) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/trainers/${id}`, data)
    .then((res) => {
      openNotificationWithIcon("success", "Profile updated successfully");
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update profile");
      console.log(err);
      throw err;
    });
}

export function addCommentToTrainer(trainerId, comment) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/trainers/${trainerId}/comments`,
      { text: comment }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      openNotificationWithIcon("error", "Unable to add comment", "");
    });
}
