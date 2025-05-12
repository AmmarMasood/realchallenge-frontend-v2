import { Modal } from "antd";
import "../../assets/replaceFreeChallengePopup.css";
import { replaceFreeChallenge } from "../../services/createChallenge/main";

const ReplaceFreeChallengePopup = ({
  visible,
  setVisible,
  challenge,
  fetchData,
}) => {
  const onReplaceChallenge = async () => {
    const res = await replaceFreeChallenge(challenge);
    if (res.success) {
      fetchData();
      setVisible(false);
    }
    console.log("resds", res);
  };

  return (
    <Modal
      visible={visible}
      footer={false}
      onCancel={() => setVisible(false)}
      bodyStyle={{ background: "rgba(81, 86, 90, 0.93)" }}
    >
      <div className="replace-free-challenge-popup-container font-paragraph-white">
        <h3 className="font-paragraph-white">
          Do you want to stop current challenge?
        </h3>
        <p>
          You can only subscribe to one free challenge at a time. By starting a
          new challenge, it will replace the previous challenge in your
          dashboard. Your progress will be lost.
        </p>
        <div className="replace-free-challenge-popup-buttons font-paragraph-white">
          <span onClick={() => setVisible(false)}>Cancel</span>
          <span onClick={onReplaceChallenge}>Yes, continue</span>
        </div>
      </div>
    </Modal>
  );
};

export default ReplaceFreeChallengePopup;
