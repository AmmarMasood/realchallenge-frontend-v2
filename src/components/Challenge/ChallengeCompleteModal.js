import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import ClappingIcon from "../../assets/icons/large-clapping-icon.svg";
import YelloIcon from "../../assets/icons/yellow-diamond-icon.svg";
import "../../assets/challengeCompletedModal.css";
import { Input, Rate } from "antd";
import { ReactComponent as FacebookIcon } from "../../assets/icons/complete-challenge-facebook-button.svg";
import { ReactComponent as TwitterIcon } from "../../assets/icons/complete-challenge-twitter-button.svg";
import { ReactComponent as InstagramIcon } from "../../assets/icons/complete-challenge-instagram-button.svg";
import { ReactComponent as PintrestIcon } from "../../assets/icons/complete-challenge-pinterest-button.svg";
import { ReactComponent as LinkedinIcon } from "../../assets/icons/complete-challenge-linkedin-button.svg";
import {
  addChallengeReview,
  getAllChallenges,
} from "../../services/createChallenge/main";
import { getRecommandedChallenges } from "../../services/users";
import { userInfoContext } from "../../contexts/UserStore";
import ChallengeCompleteNextModal from "./ChallengeCompleteNextModal";
import { createPost } from "../../services/communityPosts";
import slug from "elegant-slug";
import { LanguageContext } from "../../contexts/LanguageContext";

const ChallengeCompleteModal = ({
  visible,
  setVisible,
  points,
  challenge,
  challengeId,
  fetchData,
}) => {
  const userInfo = useContext(userInfoContext)[0];
  const { language } = useContext(LanguageContext);
  const [input, setInput] = useState("");
  const [rating, setRating] = useState(1);
  const [currentLayout, setCurrentLayout] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextChallenges, setNextChallenges] = useState([]);

  useEffect(() => {
    if (userInfo.id) {
      getNextChallenges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc to close (replaces react-modal's built-in keyboard handling).
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, setVisible]);

  // "What's next" after finishing a challenge is the highest-intent moment in
  // the app, so use the personalised recommender rather than the raw catalogue.
  // It also excludes challenges the customer already owns — which includes the
  // one they just completed, so we no longer suggest it back to them.
  //
  // The recommender can legitimately return nothing (no goal set, or no
  // matches), and a blank "what's next" screen is worse than an unranked one —
  // so fall back to the full list in that case, minus the completed challenge.
  const getNextChallenges = async () => {
    setLoading(true);
    // Never suggest the challenge that was just finished. The recommender
    // already drops owned challenges, which normally covers this — but only
    // once the completion has been written back, so don't depend on that race:
    // the modal knows the id, so filter it explicitly on both paths.
    const withoutCompleted = (list) =>
      (list || []).filter((c) => String(c._id) !== String(challengeId));

    try {
      const rc = await getRecommandedChallenges(userInfo.id, language);
      const recommended = withoutCompleted(
        rc && Array.isArray(rc.recommendedChallenges)
          ? rc.recommendedChallenges
          : []
      );

      if (recommended.length > 0) {
        setNextChallenges(recommended);
        return;
      }

      const all = await getAllChallenges(language);
      setNextChallenges(
        withoutCompleted(all && Array.isArray(all.challenges) ? all.challenges : [])
      );
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (input.length > 0 && rating) {
      const data = {
        title: `I have completed ${challenge?.challengeName}`,
        text: input,
        image: challenge?.thumbnailLink,
        type: "Finished Completed",
        url: `/challenge/${slug(challenge?.challengeName)}/${challenge?._id}`,
        language: language,
      };

      const res = await addChallengeReview(
        challengeId,
        rating,
        input,
        language
      );
      await createPost(data);

      if (res.success) {
        setVisible(false);
        fetchData();
      }
    }
  };

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      onClick={() => setVisible(false)}
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
      <div onClick={(e) => e.stopPropagation()}>
        {currentLayout === 1 ? (
          <div
            className="challenge-complete-modal-container"
            style={{
              width: "min(940px, calc(100vw - 32px))",
              height: "min(580px, calc(100vh - 80px))",
              border: "none",
              outline: "1px solid #4E5F70",
              outlineOffset: "-10px",
            }}
          >
            <div className="challenge-complete-modal-container--c1">
              <img src={ClappingIcon} alt="clapping-icon" />
              <h3 className="font-heading-white">Well done!</h3>
              <p className="font-paragraph-white">
                {" "}
                <img src={YelloIcon} alt="points-earned" />{" "}
                <span>{challenge?.points} points earned</span>
              </p>
              <span className="font-paragraph-white">
                You did it! Congratulations on finishing the challenge. Keep this
                momentum going and continue creating these healthy habits for a
                happy balanced healthy lifestyle
              </span>
            </div>
            <div className="challenge-complete-modal-container--c2">
              <div className="challenge-complete-modal-container--c2--r1">
                <p className="font-paragraph-white">
                  Please review this challenge.
                </p>
                <Input.TextArea
                  rows={3}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                />
                <Rate onChange={(e) => setRating(e)} value={rating} />
                <button
                  className="common-transparent-button font-paragraph-white"
                  onClick={submitReview}
                  style={{
                    border: "2px solid #ff7700",
                    display: "block",
                    marginTop: "10px",
                    padding: "10px 50px",
                    cursor: "pointer",
                  }}
                >
                  Submit
                </button>
              </div>
              <div className="challenge-complete-modal-container--c2--r2">
                <p className="font-paragraph-white">Spread the word :)</p>
                <div>
                  <FacebookIcon className="challenge-completed-icon" />
                  <TwitterIcon className="challenge-completed-icon" />
                  <InstagramIcon className="challenge-completed-icon" />
                  <LinkedinIcon className="challenge-completed-icon" />
                  <PintrestIcon className="challenge-completed-icon" />
                </div>
                <button
                  className="common-transparent-button font-paragraph-white"
                  onClick={() => setCurrentLayout(2)}
                  style={{
                    border: "2px solid #ff7700",
                    display: "block",
                    marginTop: "10px",
                    padding: "10px 50px",
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ChallengeCompleteNextModal
            goBack={() => setCurrentLayout(1)}
            loading={loading}
            challenges={nextChallenges}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
export default ChallengeCompleteModal;
