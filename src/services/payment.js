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

/**
 * Fulfils a checkout. The server re-reads the payment from Mollie and only
 * grants access if it was actually paid, so returning from a cancelled or
 * abandoned payment delivers nothing.
 */
export function completeOrder(paymentId) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/auth/mollie/complete`, {
      paymentId,
    })
    .then((res) => ({ success: true, data: res.data }))
    .catch((err) => {
      const status = err.response && err.response.status;
      if (status === 402) {
        // Payment not completed — expected when the user cancels or backs out.
        return { success: false, notPaid: true };
      }
      errorPopup(
        translate("payment.error_title"),
        translate("payment.contact_support")
      );
      console.log(err);
      return { success: false };
    });
}

/**
 * Restores billing after a failed payment.
 *
 * Three outcomes, and the caller must treat them differently:
 *  - { restored: true }            the mandate survived; nothing for the user to do
 *  - { requiresAuthorisation }     send them to `checkoutUrl` to re-authorise
 *  - { retryInProgress: true }     Mollie is still retrying — do NOT offer to pay,
 *                                  a manual payment alongside a retry can charge twice
 */
export function recoverSubscription() {
  const redirectUrl = `${process.env.REACT_APP_FRONTEND_SERVER}/mollie/create-subscribtion/redirect`;
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/auth/mollie/subscription/recover`,
      { redirectUrl }
    )
    .then((res) => ({ success: true, ...res.data }))
    .catch((err) => {
      const status = err.response && err.response.status;
      const data = (err.response && err.response.data) || {};
      if (status === 409 && data.retryInProgress) {
        return { success: false, retryInProgress: true, graceUntil: data.graceUntil };
      }
      errorPopup(
        translate("payment.error_title"),
        data.message || translate("payment.contact_support")
      );
      return { success: false };
    });
}

/**
 * Cancels the active subscription. Billing stops; access continues until the
 * end of the period already paid for.
 */
export function cancelSubscription() {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/auth/mollie/subscription/cancel`)
    .then((res) => ({ success: true, data: res.data }))
    .catch((err) => {
      const message =
        err.response && err.response.data && err.response.data.message;
      errorPopup(
        translate("payment.error_title"),
        message || translate("payment.contact_support")
      );
      return { success: false };
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
    const freeChallenges = customer.customerDetails.challenges.filter((c) =>
      c.access?.includes("FREE")
    );
    // Count intensity groups as 1 free challenge
    const counted = new Set();
    let units = 0;
    for (const c of freeChallenges) {
      if (c.intensityGroupId) {
        if (!counted.has(c.intensityGroupId)) {
          counted.add(c.intensityGroupId);
          units++;
        }
      } else {
        units++;
      }
    }
    return units > 0;
  }
};

// Default challenges allowed per package (fallback if config not provided)
const DEFAULT_CHALLENGES_ALLOWED = {
  CHALLENGE_1: 1,
  CHALLENGE_3: 2,
  CHALLENGE_12: 3,
};

// CHALLENGE_1 is a one-off purchase, not a plan: it is repeatable without limit
// and creates no membership. Only these carry a cap.
const SUBSCRIPTION_PACKAGES = ["CHALLENGE_3", "CHALLENGE_12"];

/**
 * Payment has failed but the grace period is still running: the user keeps
 * access and should see a warning.
 */
export function isInGrace(m) {
  return Boolean(
    m &&
      m.paymentStatus === "past_due" &&
      m.graceUntil &&
      Date.now() < new Date(m.graceUntil).getTime()
  );
}

/** Grace has run out with the payment still unpaid — the plan stops covering. */
export function isPaymentLocked(m) {
  return Boolean(
    m &&
      m.paymentStatus === "past_due" &&
      m.graceUntil &&
      Date.now() >= new Date(m.graceUntil).getTime()
  );
}

/**
 * Whether a plan is currently working. Mirrors `isActiveMembership` on the
 * server: Mollie's status says billing is set up, `paymentStatus` says it is
 * actually being paid, and both must be good. If these two ever disagree the UI
 * offers challenges the backend then refuses.
 */
export function isActiveMembership(m) {
  return Boolean(m && m.isValid === "active" && !isPaymentLocked(m));
}

/**
 * The user's billing state for display: null when all is well, otherwise the
 * membership plus whether they are still inside the grace window.
 */
export function getBillingAlert(customer) {
  const memberships = customer?.customerDetails?.membership || [];
  const troubled = memberships.find(
    (m) => m && SUBSCRIPTION_PACKAGES.includes(m.name) && m.paymentStatus === "past_due"
  );
  if (!troubled) return null;
  return {
    membership: troubled,
    inGrace: isInGrace(troubled),
    locked: isPaymentLocked(troubled),
    graceUntil: troubled.graceUntil || null,
  };
}

function getSubscriptionMembership(customer) {
  const memberships = customer?.customerDetails?.membership || [];
  const active = memberships.filter(
    (m) => m && SUBSCRIPTION_PACKAGES.includes(m.name) && isActiveMembership(m)
  );
  if (!active.length) return null;
  return active.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )[0];
}

/**
 * Slots a plan currently has taken. Mirrors `occupiedSlots` on the server: a
 * slot is held while the challenge is neither completed nor past its hold date,
 * so finishing frees it immediately and abandoning frees it once the programme
 * would have ended.
 */
function occupiedSlots(customer, subscription) {
  const details = customer?.customerDetails || {};
  const done = new Set(
    (details.completedChallenges || []).map((c) => (c._id || c).toString())
  );
  for (const t of details.trackChallenges || []) {
    if (t && t.challengeCompleted && t.challenge) {
      done.add((t.challenge._id || t.challenge).toString());
    }
  }

  const now = Date.now();
  return (subscription.challenges || []).filter((entry) => {
    const raw = entry.challenge || entry;
    const id = (raw._id || raw).toString();
    if (done.has(id)) return false;
    return !entry.holdUntil || now < new Date(entry.holdUntil).getTime();
  }).length;
}

/**
 * How much of the plan's allowance is in use, for display.
 *
 * Returns null when there is no active plan — one-off buyers have no allowance
 * to show, and rendering "0 of 0" would invent a limit they do not have.
 */
export function getSlotUsage(customer, packageConfigs = null) {
  const subscription = getSubscriptionMembership(customer);
  if (!subscription) return null;

  const allowed = getChallengesAllowedForPackage(
    subscription.name,
    packageConfigs
  );
  const used = occupiedSlots(customer, subscription);
  return {
    used,
    allowed,
    remaining: Math.max(0, allowed - used),
    planName: subscription.name,
  };
}

/**
 * True when the user's plan still covers another challenge at no extra cost.
 * Drives whether to offer the pricing options: a one-off buyer, or a subscriber
 * whose slots are all taken, still needs to choose how to pay.
 */
export function planCoversAnotherChallenge(customer, packageConfigs = null) {
  const subscription = getSubscriptionMembership(customer);
  if (!subscription) return false;
  const allowed = getChallengesAllowedForPackage(
    subscription.name,
    packageConfigs
  );
  return occupiedSlots(customer, subscription) < allowed;
}

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
  // A free challenge is never bought, and the one-at-a-time rule applies
  // regardless of what the user has subscribed to or purchased.
  if (challenge.access.includes("FREE")) {
    if (checkIfUserAlreadyHaveAFreeChallenge(customer)) {
      setReplaceFreeChallengePopupVisible(true);
      return { success: false };
    }
    return { success: true, message: "SUBSCRIBE" };
  }

  // Paid challenge. An active subscription covers it while the plan still has
  // room; that is the only case where access is granted without paying again.
  const subscription = getSubscriptionMembership(customer);
  if (subscription) {
    const challengesAllowed = getChallengesAllowedForPackage(
      subscription.name,
      packageConfigs
    );
    // Must use `occupiedSlots`, not the raw array length. The two disagreed:
    // the page hid the pricing options because a completed or expired slot had
    // freed up, then this path counted that same slot as still taken and sent
    // the user to a paid checkout for a challenge their plan already covered.
    const used = occupiedSlots(customer, subscription);
    if (used < challengesAllowed) {
      return { success: true, message: "SUBSCRIBE" };
    }
  }

  // Otherwise it is a one-off purchase — always available, no cap. Users with
  // no plan buy single challenges this way, and so do subscribers who have
  // used up their plan's included challenges.
  setSelectedChallenge(challenge);
  localStorage.setItem("package-type", pack || "CHALLENGE_1");
  history.push("/create-payment");
  return { success: false };
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
