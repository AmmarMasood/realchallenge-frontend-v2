import React from "react";
import { SmileOutlined, FireOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import { T } from "../Translate";

function WorkoutCompleteModal({
  finishWorkoutPopupVisible,
  setFinishWorkoutPopupVisible,
  challengeId,
  challengeSlug,
  history,
}) {
  const { width } = useWindowDimensions();
  return (
    <Modal
      visible={finishWorkoutPopupVisible}
      onCancel={(e) => setFinishWorkoutPopupVisible(false)}
      footer={false}
      className="finish-workout-popup-container"
      width={width <= 600 ? "100%" : "50%"}
      bodyStyle={{
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 0) 10.94%,  rgba(5, 8, 13, 0.78) 100%)",
      }}
    >
      <FireOutlined
        style={{ color: "var(--color-orange)", fontSize: "60px" }}
      />
      {console.log(width)}
      <h1 className="font-heading-white">
        <T>player.well</T>
      </h1>
      <p className="font-subheading-white">
        <T>player.congrats</T>{" "}
      </p>
      <p className="font-paragraph-white">
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
    </Modal>
  );
}

export default WorkoutCompleteModal;
