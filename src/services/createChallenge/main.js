import axios from "axios";
import { notification } from "antd";

export const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createChallenge(challenge) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/challenges/create`, challenge)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully Created", "");
      return res.data;
    })
    .catch((err) => {
      console.log("data", err.response.data);
      console.log("status", err.response.status);
      console.log("headers", err.response.headers);
      console.log(err);

      // Check for duplicate challenge name error
      if (err.response?.status === 409 && err.response?.data?.error === "DUPLICATE_CHALLENGE_NAME") {
        openNotificationWithIcon(
          "error",
          "Duplicate Challenge Name",
          err.response.data.message || "A challenge with this name already exists"
        );
        throw err;
      } else if (err.response?.data?.header) {
        openNotificationWithIcon(
          "error",
          err.response.data.header.message,
          ""
        );
        throw err;
      } else {
        openNotificationWithIcon("error", "Unable to create", "");
        throw err;
      }
    });
}

export function createExercise(e) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/exercise/create`, e)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully Created", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
      // openNotificationWithIcon("error", "Unable to create", "");
    });
}

export function updateChallenge(challenge, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/challenges/${id}`, challenge)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully updated challenge", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      // Version conflict — re-throw without notification so the component can show the modal
      if (err.response?.status === 409 && err.response?.data?.error === "VERSION_CONFLICT") {
        throw err;
      }

      // Check for duplicate challenge name error
      if (err.response?.status === 409 && err.response?.data?.error === "DUPLICATE_CHALLENGE_NAME") {
        openNotificationWithIcon(
          "error",
          "Duplicate Challenge Name",
          err.response.data.message || "A challenge with this name already exists"
        );
        throw err;
      } else {
        openNotificationWithIcon("error", "Unable to update", "");
        throw err;
      }
    });
}

export function updateExercise(e, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/exercise/${id}`, e)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully updated", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      // openNotificationWithIcon("error", "Unable to update", "");
      throw err;
    });
}

export function updateWorkoutOnBackend(workout) {
  let promises = [];
  let responses = [];

  for (let i = 0; i < workout.length; i++) {
    promises.push(
      axios.put(
        `${process.env.REACT_APP_SERVER}/api/workout/update`,
        workout[i]
      )
    );
  }

  return axios
    .all(promises)
    .then(
      axios.spread((...res) => {
        for (let i = 0; i < res.length; i++) {
          responses.push(res[i]);
        }
        openNotificationWithIcon("success", "Successfully updated workout", "");
        return responses;
        // use/access the results
      })
    )
    .catch((errors) => {
      // react on errors.
      console.log(errors);
      openNotificationWithIcon("error", "Unable to update workout", "");
    });
}

export function createWorkout(workout) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/workout/create`, workout)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully created workout", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to create workout", "");
    });
}

export function getAllChallenges(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/challenges?language=${language}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get challenges", "");
    });
}

export function getAllUserChallenges(language, includeAssigned = false) {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (includeAssigned) params.append('includeAssigned', 'true');

  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/challenges/users/all?${params.toString()}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get challenges", "");
    });
}
//
export function getAllExercises(language) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/exercise?language=${language}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get exercises", "");
    });
}

export function getAllUserExercises(language, includeAssigned = false) {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (includeAssigned) params.append('includeAssigned', 'true');

  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/exercise/user/all?${params.toString()}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to get exercises", "");
    });
}

export function removeChallenge(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/challenges/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully Deleted", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to delete", "");
    });
}

export function removeExercise(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/exercise/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully Deleted", "");
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to delete", "");
    });
}

export function getChallengeById(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/challenges/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      openNotificationWithIcon("error", "Unable to get challenge", "");
    });
}

export function getWorkoutById(workoutId) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/workout/${workoutId}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      openNotificationWithIcon("error", "Unable to get workout", "");
    });
}

export function getMusicByChallengeId(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/musics/challenge/${id}`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);

      openNotificationWithIcon(
        "error",
        "Unable to get musics for this challenge",
        ""
      );
    });
}

export function addComment(challengeId, comment) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/challenges/${challengeId}/comments`,
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

export function addChallengeReview(challengeId, rating, comment, language) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/challenges/${challengeId}/reviews`,
      { comment: comment, rating: rating, language: language }
    )
    .then((res) => {
      return { success: true, data: res.data };
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to add review", "");
      return { success: false, data: err };
    });
}

export function replaceFreeChallenge(challenge) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/replace-free-challenge`,
      { challenge: challenge }
    )
    .then((res) => {
      openNotificationWithIcon("success", "Challenge Replaced!", "");
      window.location.reload(false);
      return { success: true, data: res.data };
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to replace the challenge", "");
      return { success: false, data: err };
    });
}

export function addFreeChallenge(challenge) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/add-free-challenge`,
      { challenge: challenge }
    )
    .then((res) => {
      openNotificationWithIcon("success", "Challenge Added!", "");
      return { success: true, data: res.data };
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon("error", "Unable to add the challenge", "");
      return { success: false, data: err };
    });
}

// Lightweight version check for optimistic locking
export function getChallengeVersion(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/challenges/${id}/version`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

// Get all translations of a challenge by translationKey
export function getTranslationsByKey(translationKey, excludeLanguage = null) {
  const params = new URLSearchParams();
  if (excludeLanguage) params.append('excludeLanguage', excludeLanguage);

  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/challenges/translations/${translationKey}?${params.toString()}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { translations: [], count: 0 };
    });
}

// Get a challenge in a specific language by translationKey
export function getChallengeByTranslationKey(translationKey, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/challenges/translation/${translationKey}/${language}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

// Get intensity groups scoped to selected trainers (requires auth)
export function getIntensityGroups(trainerIds) {
  const raw = Array.isArray(trainerIds) ? trainerIds : trainerIds ? [trainerIds] : [];
  // Extract _id if trainers are objects
  const ids = raw.map((t) => (typeof t === "object" && t !== null ? t._id : t)).filter(Boolean);
  const params = ids.length > 0 ? `?trainerIds=${ids.map(encodeURIComponent).join(",")}` : "";
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/challenges/intensity-groups${params}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { groups: [] };
    });
}

// Get all challenges in an intensity group
export function getChallengesByGroup(groupId) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/challenges/group/${encodeURIComponent(groupId)}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { challenges: [] };
    });
}

// Get all translations of an exercise by translationKey
export function getExerciseTranslationsByKey(translationKey, excludeLanguage = null) {
  const params = new URLSearchParams();
  if (excludeLanguage) params.append('excludeLanguage', excludeLanguage);

  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/exercise/translations/${translationKey}?${params.toString()}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { translations: [], count: 0 };
    });
}

// Get an exercise in a specific language by translationKey
export function getExerciseByTranslationKey(translationKey, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/exercise/translation/${translationKey}/${language}`
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}
