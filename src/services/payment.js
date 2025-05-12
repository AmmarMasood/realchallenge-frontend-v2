import axios from "axios";
import { notification } from "antd";
import { getUserProfileInfo } from "./users";
import { Modal, Button, Space } from "antd";

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
        "Error",
        <div>
          Unable to create subscribtion, please contact the realchallenge for
          more information.
        </div>
      );
      console.log(err);
    });
}

const checkIfUserAlreadyHaveAFreeChallenge = (customer) => {
  if (customer.customerDetails.challenges.length <= 0) {
    return false;
  } else {
    const c = customer.customerDetails.challenges.filter((c) =>
      c.access.includes("FREE")
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
  if (customer.customerDetails.challenges.length <= 0) {
    return false;
  } else {
    const c = customer.customerDetails.challenges.filter(
      (c) => !c.access.includes("FREE")
    );
    if (c.length >= noOfChallengesAllowed) {
      return true;
    } else {
      return false;
    }
  }
};

export function checkUserPackage(
  customer,
  challenge,
  pack,
  history,
  setSelectedChallenge,
  setReplaceFreeChallengePopupVisible
) {
  if (customer.role === "admin") {
    return {
      success: true,
      message: "SUBSCRIBE",
    };
  }
  console.log(challenge);
  console.log(customer.customerDetails.membership[0]);
  // check if user is free subscriber
  if (customer.customerDetails.membership[0] === undefined) {
    // if has not subscribed to any package. They can only have one free challenge.
    // first we if the comming challenge is free or not.
    if (challenge.access.includes("FREE")) {
      // if free we check if they already have a free challenge
      if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
        // if they already have a free challenge
        // openNotificationWithIcon(
        //   "error",
        //   `You can only subscribe to one free challenge at a time.`
        // );
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
          "Unable to subscribe",
          <div>
            You can only subscribe to free challenges. This is a paid challenge.
            Please subscribe to get this challenge.
          </div>
        );
      }
      return {
        success: false,
      };
    }
  }

  // check if user is challenge 1 subscriber
  if (
    customer.customerDetails.membership[0] &&
    customer.customerDetails.membership[0].name === "CHALLENGE_1"
  ) {
    // if has not subscribed to any package. They can only have one free challenge.
    // first we if the comming challenge is free or not.
    if (challenge.access.includes("FREE")) {
      // if free we check if they already have a free challenge
      if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
        // if they already have a free challenge
        // openNotificationWithIcon(
        //   "error",
        //   `You can only subscribe to one free challenge at a time.`
        // );
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
      // if not free we check if user is already subscirbed to 1 challenge.
      // alreadySubscribedToSpecificNumberOfChallenges function check if the user has already subscribed to specific
      // number of challenges other than free challenge. So challenge 1 wala user can subscribe to only 1 more challenge other than free
      // where are challenge 3 wala can subscribe to 2 challenges other than free, where are 12 months wala can subscribe to 3 other than free.

      if (alreadySubscribedToSpecificNumberOfChallenges(customer, 1)) {
        errorPopup(
          "Unable to subscribe",
          <div>
            You have already bought a challenge. You can only buy new challenge
            once that challenge expires.
          </div>
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

  // check if user is challenge 3 subscriber
  if (
    customer.customerDetails.membership[0] &&
    customer.customerDetails.membership[0].name === "CHALLENGE_3"
  ) {
    // if has not subscribed to any package. They can only have one free challenge.
    // first we if the comming challenge is free or not.
    if (challenge.access.includes("FREE")) {
      // if free we check if they already have a free challenge
      if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
        // if they already have a free challenge
        // openNotificationWithIcon(
        //   "error",
        //   `You can only subscribe to one free challenge at a time.`
        // );
        setReplaceFreeChallengePopupVisible(true);
        return {
          success: false,
        };
      } else {
        console.log("penis");
        // if they dont have a free challenge
        return {
          success: true,
          message: "SUBSCRIBE",
        };
      }
    } else {
      console.log("poop");
      // if not free we check if user is already subscirbed to 2 challenge.
      // alreadySubscribedToSpecificNumberOfChallenges function check if the user has already subscribed to specific
      // number of challenges other than free challenge. So challenge 1 wala user can subscribe to only 1 more challenge other than free
      // where are challenge 3 wala can subscribe to 2 challenges other than free, where are 12 months wala can subscribe to 3 other than free.

      if (alreadySubscribedToSpecificNumberOfChallenges(customer, 2)) {
        errorPopup(
          "Unable to subscribe",
          <div>
            You are already enrolled in 2 challenge. You can only enroll new
            challenge once those challenges expires.
          </div>
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

  // check if user is challenge 12 subscriber
  if (
    customer.customerDetails.membership[0] &&
    customer.customerDetails.membership[0].name === "CHALLENGE_12"
  ) {
    // if has not subscribed to any package. They can only have one free challenge.
    // first we if the comming challenge is free or not.
    if (challenge.access.includes("FREE")) {
      // if free we check if they already have a free challenge
      if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
        // if they already have a free challenge
        // openNotificationWithIcon(
        //   "error",
        //   `You can only subscribe to one free challenge at a time.`
        // );
        setReplaceFreeChallengePopupVisible(true);
        return {
          success: false,
        };
      } else {
        console.log("penis");
        // if they dont have a free challenge
        return {
          success: true,
          message: "SUBSCRIBE",
        };
      }
    } else {
      console.log("poop");
      // if not free we check if user is already subscirbed to 2 challenge.
      // alreadySubscribedToSpecificNumberOfChallenges function check if the user has already subscribed to specific
      // number of challenges other than free challenge. So challenge 1 wala user can subscribe to only 1 more challenge other than free
      // where are challenge 3 wala can subscribe to 2 challenges other than free, where are 12 months wala can subscribe to 3 other than free.

      if (alreadySubscribedToSpecificNumberOfChallenges(customer, 3)) {
        errorPopup(
          "Unable to subscibe",
          <div>
            You are already enrolled in 3 challenges. You can only enroll new
            challenge once those challenges expires.
          </div>
        );

        // openNotificationWithIcon(
        //   "error",
        //   `You are already enrolled in 3 challenges. You can only enroll new challenge once those challenges expires.`
        // );
        return { success: false };
      } else {
        return {
          success: true,
          message: "SUBSCRIBE",
        };
      }
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
