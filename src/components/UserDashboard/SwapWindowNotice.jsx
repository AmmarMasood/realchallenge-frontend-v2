import React, { useCallback, useContext, useEffect, useState } from "react";
import { Modal, Select } from "antd";

import { userInfoContext } from "../../contexts/UserStore";
import { LanguageContext } from "../../contexts/LanguageContext";
import { getUserProfileInfo } from "../../services/users";
import {
  getAllChallenges,
  openNotificationWithIcon,
} from "../../services/createChallenge/main";
import {
  challengesInSwapWindow,
  getSwapEligibility,
  releaseChallenge,
  swapChallenge,
} from "../../services/payment";
import { translate } from "../Translate";

/**
 * The 24-hour window to swap or drop a plan-granted challenge.
 *
 * Shown as a notice rather than a control on every card, because the window is
 * short and applies to at most the last challenge or two — a permanent menu item
 * would be missed exactly when it matters, and clutter the rest of the time.
 *
 * Deliberately silent when nothing is eligible: a user who started something
 * three days ago should see no trace of this.
 */
function SwapWindowNotice({ onChanged }) {
  const [userInfo] = useContext(userInfoContext);
  const { language } = useContext(LanguageContext);
  const [candidate, setCandidate] = useState(null); // { challengeId, name, hoursRemaining }
  const [options, setOptions] = useState([]);
  const [swapTo, setSwapTo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);

  const load = useCallback(async () => {
    if (!userInfo?.id) return;
    const res = await getUserProfileInfo(userInfo.id);
    const customer = res?.customer;
    if (!customer) return;

    const recent = challengesInSwapWindow(customer);
    if (!recent.length) {
      setCandidate(null);
      return;
    }

    // The local window check is only a filter — the server also counts workouts
    // completed, which the dashboard does not have. Ask it about the newest one.
    const newest = recent[0];
    const eligibility = await getSwapEligibility(newest.challengeId);
    if (!eligibility.eligible) {
      setCandidate(null);
      return;
    }

    const owned = customer.customerDetails?.challenges || [];
    const match = owned.find(
      (c) => String(c?._id) === String(newest.challengeId)
    );
    setCandidate({
      challengeId: newest.challengeId,
      name: match?.challengeName || translate("swap_window.this_challenge"),
      hoursRemaining: Math.round(
        eligibility.hoursRemaining ?? newest.hoursRemaining
      ),
    });
  }, [userInfo]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await load();
    if (onChanged) onChanged();
  };

  const openPicker = async () => {
    setPicking(true);
    if (options.length) return;
    // The language must be passed: the endpoint filters on it, and
    // `language=undefined` comes back with an empty list rather than an error.
    const all = await getAllChallenges(language);
    const list = (all?.challenges || all || []).filter(
      (c) => c && String(c._id) !== String(candidate.challengeId)
    );
    setOptions(list);
  };

  const doSwap = async () => {
    if (!swapTo) return;
    setBusy(true);
    const res = await swapChallenge(candidate.challengeId, swapTo);
    setBusy(false);
    if (res.success) {
      openNotificationWithIcon(
        "success",
        translate("swap_window.swapped_title"),
        translate("swap_window.swapped_body")
      );
      setPicking(false);
      setSwapTo(null);
      refresh();
    } else {
      openNotificationWithIcon(
        "error",
        translate("swap_window.failed_title"),
        res.message || translate("swap_window.failed_body")
      );
    }
  };

  const confirmDrop = () => {
    Modal.confirm({
      title: (
        <div className="font-paragraph-white" style={{ color: "#fff" }}>
          {translate("swap_window.drop_title")}
        </div>
      ),
      content: (
        <div className="font-paragraph-white" style={{ color: "#fff" }}>
          {translate("swap_window.drop_confirm").replace(
            "{{name}}",
            candidate.name
          )}
        </div>
      ),
      okText: translate("swap_window.drop_action"),
      okButtonProps: { style: { background: "#c0392b", border: "none" } },
      onOk: async () => {
        const res = await releaseChallenge(candidate.challengeId);
        if (res.success) {
          openNotificationWithIcon(
            "success",
            translate("swap_window.dropped_title"),
            translate("swap_window.dropped_body")
          );
          refresh();
        } else {
          openNotificationWithIcon(
            "error",
            translate("swap_window.failed_title"),
            res.message || translate("swap_window.failed_body")
          );
        }
      },
    });
  };

  if (!candidate) return null;

  const hours = candidate.hoursRemaining;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 16px",
        margin: "0 0 14px",
        borderLeft: "4px solid #FFAE42",
        background: "rgba(255,174,66,.10)",
      }}
    >
      <span className="font-paragraph-white" style={{ fontSize: "14px" }}>
        {translate("swap_window.body")
          .replace("{{name}}", candidate.name)
          .replace("{{hours}}", String(hours))}
      </span>

      <span style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={openPicker}
          disabled={busy}
          className="font-paragraph-white"
          style={{
            border: "1px solid #FFAE42",
            background: "transparent",
            color: "#fff",
            padding: "6px 14px",
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}
        >
          {translate("swap_window.swap_action")}
        </button>
        <button
          onClick={confirmDrop}
          disabled={busy}
          className="font-paragraph-white"
          style={{
            border: "1px solid #9F9F9F",
            background: "transparent",
            color: "#9F9F9F",
            padding: "6px 14px",
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: "13px",
          }}
        >
          {translate("swap_window.drop_action")}
        </button>
      </span>

      <Modal
        open={picking}
        title={
          <span className="font-paragraph-white" style={{ color: "#fff" }}>
            {translate("swap_window.swap_title")}
          </span>
        }
        okText={translate("swap_window.swap_action")}
        onOk={doSwap}
        okButtonProps={{
          disabled: !swapTo || busy,
          style: { background: "#ff7700", border: "none" },
        }}
        onCancel={() => {
          setPicking(false);
          setSwapTo(null);
        }}
      >
        {/* The app themes modals dark, but antd's default body colour is a near
            black — unreadable against it. Everything written into a modal here
            has to set its own colour. */}
        <div
          className="font-paragraph-white"
          style={{ marginBottom: "10px", color: "#fff" }}
        >
          {translate("swap_window.swap_help").replace(
            "{{name}}",
            candidate.name
          )}
        </div>
        <Select
          showSearch
          optionFilterProp="children"
          style={{ width: "100%" }}
          placeholder={translate("swap_window.pick_placeholder")}
          value={swapTo}
          onChange={setSwapTo}
        >
          {options.map((c) => (
            <Select.Option key={c._id} value={c._id}>
              {c.challengeName}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}

export default SwapWindowNotice;
