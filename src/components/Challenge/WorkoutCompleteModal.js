import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { SmileOutlined, CloseOutlined } from "@ant-design/icons";
import ClappingIcon from "../../assets/icons/large-clapping-icon.svg";
import { T } from "../Translate";

function WorkoutCompleteModal({
  finishWorkoutPopupVisible,
  setFinishWorkoutPopupVisible,
  challengeId,
  challengeSlug,
  history,
}) {
  // Esc to close
  useEffect(() => {
    if (!finishWorkoutPopupVisible) return;
    const onKey = (e) => {
      if (e.key === "Escape") setFinishWorkoutPopupVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finishWorkoutPopupVisible, setFinishWorkoutPopupVisible]);

  // Client spec: once the user acts on the finish screen on this device
  // (closes it or picks a rating, which navigates away), the cast session for
  // this workout ends — the TV keeps its finish screen only while this modal
  // is open. Casting can be started again from the next workout's player.
  // No-op when not casting (getCurrentSession() is null).
  useEffect(() => {
    if (!finishWorkoutPopupVisible) return;
    return () => {
      try {
        const session = window.cast?.framework?.CastContext?.getInstance?.()
          ?.getCurrentSession?.();
        if (session) session.endSession(true);
      } catch (e) {
        console.warn("Failed to end cast session on workout finish:", e);
      }
    };
  }, [finishWorkoutPopupVisible]);

  if (!finishWorkoutPopupVisible) return null;

  return ReactDOM.createPortal(
    <div
      onClick={() => setFinishWorkoutPopupVisible(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        overflow: "auto",
      }}
    >
      <div
        className="workout-complete-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(940px, calc(100vw - 32px))",
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 1) 25%, rgba(78, 95, 112, 1) 100%)",
          outline: "1px solid #4E5F70",
          outlineOffset: "-10px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // breathing room inside the inset outline; scroll instead of
          // clipping if a short phone screen can't fit everything
          padding: "28px 24px",
          overflowY: "auto",
        }}
      >
        {/* Close × — kept on this first modal per design */}
        <button
          type="button"
          onClick={() => setFinishWorkoutPopupVisible(false)}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255, 44, 44, 0.2)",
            border: "none",
            color: "#FF6C6C",
            fontSize: 18,
            cursor: "pointer",
            padding: 6,
            lineHeight: 1,
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloseOutlined />
        </button>

        <img
          src={ClappingIcon}
          alt="clapping-icon"
          style={{ height: "clamp(60px, 8vw, 100px)" }}
        />
        <h1
          className="font-heading-white"
          style={{
            fontSize: "clamp(28px, 4vw, 46px)",
            lineHeight: 1.2,
            margin: "12px 0",
          }}
        >
          <T>player.well</T>
        </h1>
        <p
          className="font-subheading-white"
          style={{ fontSize: "clamp(16px, 2vw, 22px)" }}
        >
          <T>player.congrats</T>{" "}
        </p>
        <p
          className="font-paragraph-white"
          style={{ fontSize: "clamp(14px, 1.6vw, 18px)" }}
        >
          <T>player.pls_let</T>
        </p>
        <div className="finish-workout-popup-container--reviewbox">
          <div
            onClick={() =>
              history.push(`/challenge/${challengeSlug}/${challengeId}`)
            }
          >
            <SmileOutlined style={{ fontSize: "30px" }} />
            <span className="font-paragraph-black">
              <T>player.great_exp</T>
            </span>
          </div>
          <div
            onClick={() =>
              history.push(`/challenge/${challengeSlug}/${challengeId}`)
            }
          >
            <SmileOutlined style={{ fontSize: "30px" }} />
            <span className="font-paragraph-black">
              <T>player.avg_stuff</T>
            </span>
          </div>
          <div
            onClick={() =>
              history.push(`/challenge/${challengeSlug}/${challengeId}`)
            }
          >
            <SmileOutlined style={{ fontSize: "30px" }} />
            <span className="font-paragraph-black">
              <T>player.very_diff</T>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WorkoutCompleteModal;
