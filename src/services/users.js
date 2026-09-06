import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

// Returns the current user's stored timezone, or null if not set yet.
export function getMyTimeZone() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/users/timezone`)
    .then((res) => res.data)
    .catch(() => ({ timeZone: null }));
}

// Manual timezone save (set-once on the backend). Used by the dashboard
// fallback picker when auto-detection failed.
export function saveMyTimeZone(timeZone) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/users/timezone`, { timeZone })
    .then((res) => res.data);
}

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

export function updateUserRoles(userId, roles) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/users/${userId}/roles`, { roles })
    .then((res) => {
      openNotificationWithIcon("success", "User roles updated successfully!");
      return res.data;
    })
    .catch((err) => {
      const message =
        err.response?.data?.message || "Unable to update user roles";
      openNotificationWithIcon("error", message);
      console.log(err);
      return null;
    });
}

export function adminResetPassword(userId) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/users/${userId}/admin-reset-password`,
    )
    .then((res) => {
      // Don't show notification here - the component will show a modal with the reset link
      return res.data;
    })
    .catch((err) => {
      const message =
        err.response?.data?.message || "Unable to send password reset email";
      openNotificationWithIcon("error", message);
      console.log(err);
      return null;
    });
}

export function adminActivateUser(userId) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/users/${userId}/admin-activate`)
    .then((res) => {
      openNotificationWithIcon(
        "success",
        res.data.message || "User activated successfully",
      );
      return res.data;
    })
    .catch((err) => {
      const message = err.response?.data?.message || "Unable to activate user";
      openNotificationWithIcon("error", message);
      console.log(err);
      return null;
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
      .put(`${process.env.REACT_APP_SERVER}/api/users/${id}`, userInfo)
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
    .delete(`${process.env.REACT_APP_SERVER}/api/users/${id}`)
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

// Returns { recommendedChallenges: [], reason: null | "no_goal" | "no_matches" }.
// Always resolves to that shape — returning the raw error object here meant the
// caller read `.recommendedChallenges` off an Error and silently rendered
// nothing, so the backend's "set your goals" message never reached the user.
export function getRecommandedChallenges(id, language) {
  const query = language ? `?language=${encodeURIComponent(language)}` : "";
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/recommendedChallenges/${id}${query}`,
    )
    .then((res) => res.data)
    .catch(() => ({ recommendedChallenges: [], reason: "error" }));
}

export function getNotifications(page = 1, limit = 10) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/notification?page=${page}&limit=${limit}`,
    )
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

export function markAllNotificationsAsRead() {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/notification/read-all`)
    .then((res) => res.data)
    .catch((err) => {
      return err;
    });
}

// REMOVED: getRecommandedWeeklyDiet.
//
// Meal plans come from the WeekPlan API (services/mealPlan.js -> /api/meal-plan),
// which is backed by services/mealPlanService on the server. The old
// /api/customerDetails/recommendedWeeklyDiet endpoint was still being called on
// every dashboard load, running a full recipe query and 7-day generation whose
// result was then discarded — nothing consumed the prop it was passed to.
//
// Do not reintroduce a client for that endpoint: it runs a separate, older copy
// of the generator that does not filter allergens.
export function swapRecipeInRecommandedNutrients(customerId, meal) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/swap/${customerId}`,
      meal,
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
      { progress: data },
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
      `${process.env.REACT_APP_SERVER}/api/customerDetails/track-challenge/${challengeId}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      // openNotificationWithIcon("error", "Unable to get challenge progress!");
      return err;
    });
}

// Fire-and-forget: mark this challenge as the user's last-played one (called
// when the player opens). Errors are ignored — it only drives the dashboard
// "Continue" sign, so a failure shouldn't disrupt playback.
export function setLastPlayedChallenge(challengeId) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/last-played/${challengeId}`,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}

export function getUserPoints(userPoints, setUserPoints) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/points/get-points`,
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

export function redeemPoints(pointsToRedeem, setUserPoints) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/customerDetails/points/redeem`, {
      pointsToRedeem,
    })
    .then((res) => {
      if (res && res.data && res.data.success) {
        setUserPoints(res.data.remainingPoints);
        return res.data;
      }
      return null;
    })
    .catch((err) => {
      console.log(err);
      openNotificationWithIcon(
        "error",
        err.response?.data?.message || "Unable to redeem points!",
      );
      return null;
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

/**
 * Saves the billing address. Required before checkout: a VAT invoice is not
 * valid without a postal address, and the country decides the VAT rate — EU
 * digital services are taxed where the customer is, not where the seller is.
 *
 * Returns { success } rather than notifying, so the caller can keep the user on
 * the checkout page and show the failure in context.
 */
export function saveBillingDetails(userId, details) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/users/${userId}`, details)
    .then((res) => ({ success: true, data: res.data }))
    .catch((err) => {
      console.log(err);
      return { success: false, error: err };
    });
}
