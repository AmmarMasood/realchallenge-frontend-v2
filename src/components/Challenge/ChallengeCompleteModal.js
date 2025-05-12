import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import ClappingIcon from "../../assets/icons/large-clapping-icon.svg";
import YelloIcon from "../../assets/icons/yellow-diamond-icon.svg";
import "../../assets/challengeCompletedModal.css";
import { Button, Input, Rate } from "antd";
import { ReactComponent as FacebookIcon } from "../../assets/icons/complete-challenge-facebook-button.svg";
import { ReactComponent as TwitterIcon } from "../../assets/icons/complete-challenge-twitter-button.svg";
import { ReactComponent as InstagramIcon } from "../../assets/icons/complete-challenge-instagram-button.svg";
import { ReactComponent as PintrestIcon } from "../../assets/icons/complete-challenge-pinterest-button.svg";
import { ReactComponent as LinkedinIcon } from "../../assets/icons/complete-challenge-linkedin-button.svg";
import { addChallengeReview } from "../../services/createChallenge/main";
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
  const [recommandedChallenges, setRecommandedChallenges] = useState([]);

  useEffect(() => {
    if (userInfo.id) {
      getNextChallenges();
    }
  }, []);

  const getNextChallenges = async () => {
    setLoading(true);
    const rc = await getRecommandedChallenges(userInfo.id, language);
    rc && setRecommandedChallenges(rc.recommendedchallenge);
    setLoading(false);
  };
  const submitReview = async () => {
    // console.log(challenge);
    // return;
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
      // console.log("ewvie", res);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onRequestClose={() => setVisible(false)}
      contentLabel="Example Modal"
    >
      {currentLayout === 1 ? (
        <div className="challenge-complete-modal-container">
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
          recommandedChallenges={recommandedChallenges}
        />
      )}
    </Modal>
  );
};
export default ChallengeCompleteModal;
