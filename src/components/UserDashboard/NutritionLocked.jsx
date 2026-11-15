import React from "react";
import { useHistory } from "react-router-dom";

import { translate } from "../Translate";

/**
 * Shown in place of the weekly plan when the user has no nutrition access.
 *
 * Three tiers produce three different messages, because "your trial ended" and
 * "your purchased days ran out" call for different next steps. Never renders an
 * empty week — an empty plan reads as a broken page.
 */
function NutritionLocked({ access }) {
  const history = useHistory();

  // We are already in the locked branch, so `freeTrialUsed` is enough to know
  // the one-off trial is gone. It cannot also test `accessUntil` being absent:
  // the backend returns the *past* expiry date for locked users, so that is
  // always truthy and the trial message never showed.
  const trialSpent = Boolean(access && access.freeTrialUsed);

  const body = trialSpent
    ? translate("nutritionLock.trial_ended")
    : translate("nutritionLock.expired");

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "48px auto",
        padding: "32px",
        textAlign: "center",
        background: "var(--mirage, #2a2f36)",
        borderRadius: "10px",
      }}
    >
      <h2
        className="font-heading-white"
        style={{ fontSize: "24px", marginBottom: "12px" }}
      >
        {translate("nutritionLock.title")}
      </h2>

      <p
        className="font-paragraph-white"
        style={{ color: "#c4c4c4", fontSize: "15px", lineHeight: 1.6 }}
      >
        {body}
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "24px",
        }}
      >
        <button
          // /pricing is the content site's; this is a logged-in upsell, so
          // it goes to the app's plan chooser and on into checkout.
          onClick={() => history.push("/new/welcome")}
          className="font-paragraph-white"
          style={{
            background: "#ff7700",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          {translate("nutritionLock.see_plans")}
        </button>

        <button
          onClick={() => history.push("/all-challenges")}
          className="font-paragraph-white"
          style={{
            background: "transparent",
            border: "1px solid #676868",
            color: "#c4c4c4",
            padding: "10px 20px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          {translate("nutritionLock.browse_challenges")}
        </button>
      </div>

      <p
        className="font-paragraph-white"
        style={{ color: "#8b8b8b", fontSize: "13px", marginTop: "20px" }}
      >
        {translate("nutritionLock.rest_still_works")}
      </p>
    </div>
  );
}

/**
 * A quiet countdown for someone whose purchased days are running out. Not shown
 * to subscribers — their access has no end date, so a countdown would be wrong.
 */
export function NutritionExpiryNotice({ access }) {
  if (!access || !access.allowed) return null;
  if (access.source !== "purchase") return null;
  if (access.daysLeft === null || access.daysLeft > 7) return null;

  return (
    <div
      role="status"
      style={{
        padding: "10px 18px",
        marginBottom: "14px",
        borderLeft: "3px solid #e6a23c",
        background: "rgba(230,162,60,.12)",
      }}
    >
      <span className="font-paragraph-white" style={{ fontSize: "14px" }}>
        {translate("nutritionLock.days_left").replace(
          "{{days}}",
          String(access.daysLeft)
        )}
      </span>
    </div>
  );
}

export default NutritionLocked;
