import React from "react";

import { CloseOutlined } from "@ant-design/icons";
import { Avatar, Rate } from "antd";
import Modal from "react-modal";
import "../../assets/challengeReviewModal.css";
import moment from "moment";
import TopIcon from "../../assets/icons/review-challenge-header-icon.svg";
import BackIcon from "../../assets/icons/review-challenge-icon.svg";
import useWindowDimensions from "../../helpers/useWindowDimensions";

function ChallengeReviewModal({ visible, setVisible, challenge }) {
  const { width } = useWindowDimensions();
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: width < 700 ? "90%" : "60%",
      overflow: "hidden",
    },
  };

  return (
    <Modal
      isOpen={visible}
      onRequestClose={() => setVisible(false)}
      style={customStyles}
      contentLabel="Reviews"
    >
      <>
        <div className="challenge-review-modal-header">
          <span>
            <img src={TopIcon} alt="" />
            <span
              className="font-paragraph-white"
              style={{ marginLeft: "10px" }}
            >
              REVIEWS
            </span>
          </span>
          <CloseOutlined
            style={{ color: "#fff", fontSize: "26px", cursor: "pointer" }}
            onClick={() => setVisible(false)}
          />
        </div>
        <div className="challenge-review-modal">
          {!challenge.reviews ? (
            <img src={BackIcon} alt="" />
          ) : (
            challenge.reviews.map((review) => (
              <div className="comment-container">
                <div
                  className="comment-container-c1 font-paragraph-white"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: width < 700 ? "column" : "row",
                  }}
                >
                  <Avatar src={review.user.avatarLink} shape="square" />{" "}
                  <span style={{ marginLeft: "5px" }}>
                    {review.user.username}
                  </span>
                  <div style={{ paddingLeft: width < 700 ? "0" : "20px" }}>
                    <Rate value={review.rating} />
                    <div
                      className="comment-container-c2 font-paragraph-white"
                      style={{ padding: 0 }}
                    >
                      {review.comment}
                    </div>
                    <div
                      className="font-paragraph-white comment-container-c3"
                      style={{ color: "#82868b", padding: 0 }}
                    >
                      {moment(review.createdAt).format("MMM, Do YY")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* <button
            className="common-orange-button font-paragraph-white"
            style={{ padding: "0.8rem 2rem" }}
            onClick={() => setVisible(false)}
          >
            <span className="font-paragraph-white">
              {t("challenge_profile.close")}
            </span>
          </button> */}
        </div>
      </>
    </Modal>
  );
}

export default ChallengeReviewModal;
