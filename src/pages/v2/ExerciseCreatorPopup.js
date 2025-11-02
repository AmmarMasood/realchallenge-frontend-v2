import { useContext, useEffect, useState } from "react";
import { Modal, Input, Select, message } from "antd";
import "../../components/Admin/V2/Workout/MusicChooseModal/MusicChooseModal.css";
import ExerciseIcon from "../../assets/icons/dumb-bell-icon-orange.svg";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";
import ExericseIconWhite from "../../assets/icons/dumb-bell-icon.svg";
import WhistleIconWhite from "../../assets/icons/whitsle-icon-white.svg";
import { LanguageContext } from "../../contexts/LanguageContext";
import { userInfoContext } from "../../contexts/UserStore";
import {
  createExercise,
  openNotificationWithIcon,
  updateExercise,
} from "../../services/createChallenge/main";

function ExerciseCreatorPopup({
  open,
  setOpen,
  onSuccess,
  selectedExerciseForEdit,
}) {
  const { language } = useContext(LanguageContext);
  const userInfo = useContext(userInfoContext)[0];
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("videos");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);

  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ammar", open, selectedExerciseForEdit);
    // Reset the state
    if (open) {
      if (selectedExerciseForEdit) {
        setExerciseTitle(selectedExerciseForEdit.title || "");
        setExerciseDescription(selectedExerciseForEdit.description || "");
        setVideoFile(
          selectedExerciseForEdit.videoURL
            ? { link: selectedExerciseForEdit.videoURL }
            : null
        );
        setAudioFile(
          selectedExerciseForEdit.voiceOverLink
            ? { link: selectedExerciseForEdit.voiceOverLink }
            : null
        );
      } else {
        setExerciseTitle("");
        setExerciseDescription("");
        setVideoFile(null);
        setAudioFile(null);
        setMediaManagerVisible(false);
        setMediaManagerType("videos");
        setMediaManagerActions([]);
      }
    }
  }, [open]);

  const openMediaManager = (type) => {
    setMediaManagerVisible(true);
    setMediaManagerType(type);
    if (type === "videos") {
      setMediaManagerActions([videoFile, setVideoFile]);
    } else if (type === "voiceOvers") {
      setMediaManagerActions([audioFile, setAudioFile]);
    }
  };

  const onCreate = async () => {
    if (!exerciseTitle || !videoFile) {
      return;
    }
    setLoading(true);
    try {
      console.log("Creating exercise with data:", videoFile);
      const data = {
        videoURL: videoFile.link,
        voiceOverLink: audioFile?.link,
        videoThumbnailURL: videoFile?.thumbnailUrl || "",
        trainer: userInfo.id,
        language,
        title: exerciseTitle,
        description: exerciseDescription,
      };
      if (selectedExerciseForEdit) {
        await updateExercise(data, selectedExerciseForEdit._id);
      } else {
        await createExercise(data);
      }

      setLoading(false);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating exercise:", error);
      setLoading(false);

      // Handle duplicate exercise name error
      if (error.response && error.response.status === 409) {
        openNotificationWithIcon(
          "error",
          "An exercise with this name already exists. Please choose a different name.",
          ""
        );
      } else {
        openNotificationWithIcon(
          "error",
          "Failed to save exercise. Please try again.",
          ""
        );
      }
    }
  };
  return (
    <Modal
      open={open}
      footer={null}
      onCancel={() => setOpen(false)}
      title=""
      bodyStyle={{
        backgroundColor: "#171e27",
        border: "1px solid #FF950A",
        textAlign: "center",
      }}
    >
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <div className="music-selector__header">
        <img src={ExerciseIcon} alt="img" className="music-selector__icon" />
        <h2 className="music-selector__title">
          <span>
            {" "}
            {selectedExerciseForEdit ? "Edit Exercise" : "Create Exercise"}
          </span>
        </h2>
      </div>

      <input
        type="text"
        placeholder="Exercise Title"
        value={exerciseTitle}
        onChange={(e) => setExerciseTitle(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px dashed #fff",
          color: "#fff",
          fontSize: "16px",
          background: "#222935",
          outline: "none",
          width: "100%",
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => openMediaManager("videos")}
        >
          <div
            style={{
              background: "#222935",
              padding: "6px 10px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative", // Add for X positioning
            }}
          >
            {videoFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <a
                  style={{
                    textDecoration: "underline",
                    color: "#FF950A",
                    fontSize: "12px",
                    textAlign: "center",
                    width: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textWrap: "balance",
                    whiteSpace: "nowrap",
                  }}
                  href={videoFile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {videoFile.link}
                </a>
                <span
                  style={{
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginBottom: "5px",
                    marginLeft: "10px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                  }}
                  title="Remove"
                >
                  ×
                </span>
              </div>
            ) : (
              <img src={ExericseIconWhite} alt="select-video" />
            )}
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "16px",
            }}
          >
            Select Video
          </h2>
        </div>
        <div
          style={{
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => openMediaManager("voiceOvers")}
        >
          <div
            style={{
              background: "#222935",
              padding: "6px 10px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {audioFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <a
                  style={{
                    textDecoration: "underline",
                    color: "#FF950A",
                    fontSize: "12px",
                    textAlign: "center",
                    width: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textWrap: "balance",
                    whiteSpace: "nowrap",
                  }}
                  href={audioFile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {audioFile.link}
                </a>
                <span
                  style={{
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginBottom: "5px",
                    marginLeft: "10px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioFile(null);
                  }}
                  title="Remove"
                >
                  ×
                </span>
              </div>
            ) : (
              <img src={WhistleIconWhite} alt="select-audio" />
            )}
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "16px",
            }}
          >
            Select Audio
            <br /> (Optional)
          </h2>
        </div>
      </div>
      <textarea
        placeholder="Exercise Description (Optional)"
        value={exerciseDescription}
        onChange={(e) => setExerciseDescription(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px dashed #fff",
          color: "#fff",
          fontSize: "16px",
          background: "#222935",
          outline: "none",
          width: "100%",
          marginTop: "10px",
          resize: "vertical", // allows resizing
          minHeight: "100px", // optional: set a minimum height
        }}
      />
      <button
        className="music-selector__next-btn"
        onClick={onCreate}
        style={{ marginTop: "10px" }}
        disabled={!exerciseTitle || !videoFile || loading}
      >
        Save
      </button>
    </Modal>
  );
}

export default ExerciseCreatorPopup;
