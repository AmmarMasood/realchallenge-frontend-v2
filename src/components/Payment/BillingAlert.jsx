import React, { useContext, useEffect, useState } from "react";
import moment from "moment";

import { userInfoContext } from "../../contexts/UserStore";
import { getUserProfileInfo } from "../../services/users";
import { getBillingAlert, recoverSubscription } from "../../services/payment";
import { translate } from "../Translate";
import { openNotificationWithIcon } from "../../services/createChallenge/main";

/**
 * Warns a subscriber whose payment has failed.
 *
 * Two states, deliberately different in tone:
 *  - inside the grace period, they still have access, so this is a heads-up and
 *    it does NOT offer a payment link — a manual payment alongside Mollie's
 *    automatic retry can charge them twice.
 *  - once grace has run out, access is withheld and we send them to settings to
 *    set their payment up again.
 */
function BillingAlert() {
  const [userInfo] = useContext(userInfoContext);
  const [alert, setAlert] = useState(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userInfo?.id) return;
      const res = await getUserProfileInfo(userInfo.id);
      if (cancelled || !res?.customer) return;
      setAlert(getBillingAlert(res.customer));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userInfo]);

  /**
   * Ask the server to restore billing. It decides which route is possible:
   * sometimes nothing is needed, sometimes the user must re-authorise, and
   * sometimes a retry is still running and we must NOT invite a payment.
   */
  const onFixPayment = async () => {
    setWorking(true);
    setNotice(null);
    const res = await recoverSubscription();
    setWorking(false);

    if (res.retryInProgress) {
      setNotice(translate("billing.retry_running"));
      return;
    }
    if (res.requiresAuthorisation && res.checkoutUrl) {
      window.location = res.checkoutUrl;
      return;
    }
    if (res.success) {
      // Say what happened before the banner vanishes. When a mandate is still
      // valid the fix is instant and invisible, so without this the user clicks
      // a payment button and the warning silently disappears — with no way to
      // tell whether they were just charged.
      openNotificationWithIcon(
        "success",
        translate("billing.restored_title"),
        translate("billing.restored_body"),
      );
      // Re-read rather than assuming, so the banner reflects what actually
      // happened server-side.
      const profile = await getUserProfileInfo(userInfo.id);
      setAlert(profile?.customer ? getBillingAlert(profile.customer) : null);
    }
  };

  if (!alert) return null;

  // DD/MM/YYYY to match the rest of the app. `toLocaleDateString()` follows the
  // browser locale, so a Dutch page was rendering "8/30/2026".
  const until = alert.graceUntil
    ? moment(alert.graceUntil).format("DD/MM/YYYY")
    : null;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 20px",
        margin: "0 0 16px",
        borderLeft: `4px solid ${alert.locked ? "#c0392b" : "#e6a23c"}`,
        background: alert.locked ? "rgba(192,57,43,.12)" : "rgba(230,162,60,.12)",
      }}
    >
      <span className="font-paragraph-white" style={{ fontSize: "14px" }}>
        {alert.locked
          ? translate("billing.locked")
          : `${translate("billing.retrying")}${until ? ` ${translate("billing.access_until")} ${until}.` : ""}`}
        {notice ? (
          <span style={{ display: "block", marginTop: "6px", color: "#e6a23c" }}>
            {notice}
          </span>
        ) : null}
      </span>

      {alert.locked ? (
        <button
          onClick={onFixPayment}
          disabled={working}
          className="font-paragraph-white"
          style={{
            border: "1px solid #c0392b",
            background: "transparent",
            // Explicit, not `inherit`: an inline colour beats the
            // `font-paragraph-white` class, and `inherit` resolved to antd's
            // default near-black — unreadable on the dark red banner.
            color: working ? "rgba(255,255,255,.55)" : "#fff",
            padding: "6px 14px",
            cursor: working ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}
        >
          {working
            ? translate("billing.working")
            : translate("billing.fix_payment")}
        </button>
      ) : null}
    </div>
  );
}

export default BillingAlert;
