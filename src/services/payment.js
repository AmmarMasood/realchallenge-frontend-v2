import axios from "axios";
import { notification } from "antd";
import { getUserProfileInfo } from "./users";
import { Modal, Button, Space } from "antd";
import { translate } from "../components/Translate";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

function errorPopup(title, text) {
  Modal.info({
    title: <div className="font-paragraph-white">{title}</div>,
    content: <div className="font-paragraph-white">{text}</div>,
    icon: null,
    okButtonProps: {
      style: { background: "#ff7700", border: "none" },
    },
    onOk() {},
  });
}

export function mollieAuthUser() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/auth/mollie/oauth2/authorize`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to access mollie server at the moment."
      );
      console.log(err);
    });
}

export function createPayment(values) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/auth/mollie/create/first/payment`,
      values
    )
    .then((res) => res.data)
    .catch((err) => {
      if (err.response && err.response.data) {
        console.log(err.response.data.message);
        openNotificationWithIcon("error", `${err.response.data.message}`);
      } else {
        openNotificationWithIcon(
          "error",
          "Unable to access mollie server at the moment."
        );
        console.log(err);
      }
    });
}

export function createSubscribtion(values) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/auth/mollie/create/subscription`,
      values
    )
    .then((res) => res.data)
    .catch((err) => {
      errorPopup(
        translate("payment.error_title"),
        translate("payment.contact_support")
      );
      console.log(err);
    });
}

const checkIfUserAlreadyHaveAFreeChallenge = (customer) => {
  if (!customer?.customerDetails?.challenges || customer.customerDetails.challenges.length <= 0) {
    return false;
  } else {
    const c = customer.customerDetails.challenges.filter((c) =>
      c.access?.includes("FREE")
    );
    if (c.length > 0) {
      return true;
    } else {
      return false;
    }
  }
};

const alreadySubscribedToSpecificNumberOfChallenges = (
  customer,
  noOfChallengesAllowed
) => {
  if (!customer?.customerDetails?.challenges || customer.customerDetails.challenges.length <= 0) {
    return false;
  } else {
    const c = customer.customerDetails.challenges.filter(
      (c) => !c.access?.includes("FREE")
    );
    if (c.length >= noOfChallengesAllowed) {
      return true;
    } else {
      return false;
    }
  }
};

// Default challenges allowed per package (fallback if config not provided)
const DEFAULT_CHALLENGES_ALLOWED = {
  CHALLENGE_1: 1,
  CHALLENGE_3: 2,
  CHALLENGE_12: 3,
};

/**
 * Get the number of challenges allowed for a package
 * @param {string} packageName - The package name (CHALLENGE_1, CHALLENGE_3, CHALLENGE_12)
 * @param {Object} packageConfigs - Package configurations from context (optional)
 * @returns {number} - Number of challenges allowed
 */
export function getChallengesAllowedForPackage(packageName, packageConfigs = null) {
  if (packageConfigs && packageConfigs[packageName]) {
    return packageConfigs[packageName].challengesAllowed;
  }
  return DEFAULT_CHALLENGES_ALLOWED[packageName] || 1;
}

/**
 * Check if user can subscribe to a challenge based on their package
 * @param {Object} customer - Customer object with customerDetails
 * @param {Object} challenge - Challenge object
 * @param {string} pack - Selected package type
 * @param {Object} history - Router history
 * @param {Function} setSelectedChallenge - Function to set selected challenge
 * @param {Function} setReplaceFreeChallengePopupVisible - Function to show replace popup
 * @param {Object} packageConfigs - Package configurations from context (optional)
 */
export function checkUserPackage(
  customer,
  challenge,
  pack,
  history,
  setSelectedChallenge,
  setReplaceFreeChallengePopupVisible,
  packageConfigs = null
) {
  if (customer.role === "admin") {
    return {
      success: true,
      message: "SUBSCRIBE",
    };
  }
  console.log(challenge);

  // Get membership safely with null checks
  const membership = customer?.customerDetails?.membership?.[0];
  console.log(membership);

  // check if user is free subscriber
  if (membership === undefined) {
    // if has not subscribed to any package. They can only have one free challenge.
    // first we if the comming challenge is free or not.
    if (challenge.access.includes("FREE")) {
      // if free we check if they already have a free challenge
      if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
        // if they already have a free challenge
        setReplaceFreeChallengePopupVisible(true);
        return {
          success: false,
        };
      } else {
        // if they dont have a free challenge
        return {
          success: true,
          message: "SUBSCRIBE",
        };
      }
    } else {
      // if not free
      if (pack) {
        setSelectedChallenge(challenge);
        localStorage.setItem("package-type", pack);
        history.push("/create-payment");
      } else {
        errorPopup(
          translate("payment.unable_to_subscribe"),
          translate("payment.free_only")
        );
      }
      return {
        success: false,
      };
    }
  }

  // Get challenges allowed for the user's membership package
  const membershipName = membership.name;
  const challengesAllowed = getChallengesAllowedForPackage(membershipName, packageConfigs);

  // Check if challenge is free
  if (challenge.access.includes("FREE")) {
    // if free we check if they already have a free challenge
    if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
      setReplaceFreeChallengePopupVisible(true);
      return {
        success: false,
      };
    } else {
      return {
        success: true,
        message: "SUBSCRIBE",
      };
    }
  } else {
    // if not free we check if user has already reached their limit
    if (alreadySubscribedToSpecificNumberOfChallenges(customer, challengesAllowed)) {
      // Get the appropriate error message based on package
      const errorKey = `payment.${membershipName.toLowerCase()}_limit`;
      errorPopup(
        translate("payment.unable_to_subscribe"),
        translate(errorKey) || translate("payment.challenge_limit_reached")
      );
      return { success: false };
    } else {
      return {
        success: true,
        message: "SUBSCRIBE",
      };
    }
  }
}

export function getSubscribtionInformation(customerId) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/auth/mollie/subscription/customer/${customerId}`
    )
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => console.log(err));
}
