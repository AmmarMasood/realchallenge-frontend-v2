import { useContext, useEffect, useState } from "react";
import { Modal, Input, Select, message } from "antd";
import "../../components/Admin/V2/Workout/MusicChooseModal/MusicChooseModal.css";
import ExerciseIcon from "../../assets/icons/dumb-bell-icon-orange.svg";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";
import { PreviewModal } from "../../components/Admin/MediaManager/MediaManager";
import ExericseIconWhite from "../../assets/icons/dumb-bell-icon.svg";
import WhistleIconWhite from "../../assets/icons/whitsle-icon-white.svg";
import { LanguageContext } from "../../contexts/LanguageContext";
import { userInfoContext } from "../../contexts/UserStore";
import {
  createExercise,
  openNotificationWithIcon,
  updateExercise,
} from "../../services/createChallenge/main";
import { getAllTrainers } from "../../services/trainers";
import { getUserProfileInfo } from "../../services/users";
import { get } from "lodash";

function ExerciseCreatorPopup({
  open,
  setOpen,
  onSuccess,
  selectedExerciseForEdit,
}) {
  const { language, strings } = useContext(LanguageContext);
  const userInfo = useContext(userInfoContext)[0];
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("videos");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);

  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [allTrainers, setAllTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // Fetch trainers when modal opens (for admin only)
  useEffect(() => {
    const fetchTrainers = async () => {
      if (open && userInfo.role === "admin") {
        try {
          const response = await getAllTrainers(language);
          let trainersList = response.trainers || [];

          // Get admin's profile and add them to the list if not already present
          const adminProfile = await getUserProfileInfo(userInfo.id);
          if (adminProfile && adminProfile.customer) {
            const adminExists = trainersList.find(
              (t) => t._id === adminProfile.customer._id
            );
            if (!adminExists) {
              trainersList = [...trainersList, adminProfile.customer];
            }
          }

          setAllTrainers(trainersList);
        } catch (error) {
          console.error("Error fetching trainers:", error);
        }
      }
    };
    fetchTrainers();
  }, [open, userInfo.role, userInfo.id, language]);

  useEffect(() => {
    console.log("ammar", open, selectedExerciseForEdit);
    // Reset the state when modal opens or closes
    if (open) {
      if (selectedExerciseForEdit) {
        // Edit mode - populate with existing data
        setExerciseTitle(selectedExerciseForEdit.title || "");
        setExerciseDescription(selectedExerciseForEdit.description || "");
        setVideoFile(
          selectedExerciseForEdit.videoURL
            ? { link: selectedExerciseForEdit.videoURL, thumbnailUrl: selectedExerciseForEdit.videoThumbnailURL }
            : null
        );
        setAudioFile(
          selectedExerciseForEdit.voiceOverLink
            ? { link: selectedExerciseForEdit.voiceOverLink }
            : null
        );
        // Set trainer from exercise being edited
        setSelectedTrainer(
          selectedExerciseForEdit.trainer?._id || selectedExerciseForEdit.trainer || null
        );
      } else {
        // Create mode - clear everything
        setExerciseTitle("");
        setExerciseDescription("");
        setVideoFile(null);
        setAudioFile(null);
        setMediaManagerVisible(false);
        setMediaManagerType("videos");
        setMediaManagerActions([]);
        // For trainers, auto-select themselves; for admins, clear selection
        setSelectedTrainer(userInfo.role === "trainer" ? userInfo.id : null);
      }
    } else {
      // Modal closed - clear all state
      setExerciseTitle("");
      setExerciseDescription("");
      setVideoFile(null);
      setAudioFile(null);
      setMediaManagerVisible(false);
      setMediaManagerType("videos");
      setMediaManagerActions([]);
      setSelectedTrainer(null);
      setPreviewModalVisible(false);
      setPreviewFile(null);
    }
  }, [open, selectedExerciseForEdit, userInfo]);

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
    if (!exerciseTitle || !videoFile || !selectedTrainer) {
      return;
    }
    setLoading(true);
    try {
      console.log("Creating exercise with data:", videoFile);
      const data = {
        videoURL: videoFile.link,
        voiceOverLink: audioFile?.link,
        videoThumbnailURL: videoFile?.thumbnailUrl || "",
        trainer: selectedTrainer,
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
          get(strings, "adminv2.duplicate_exercise_error", "An exercise with this name already exists for this trainer. Please choose a different name."),
          ""
        );
      } else {
        openNotificationWithIcon(
          "error",
          get(strings, "adminv2.save_exercise_error", "Failed to save exercise. Please try again."),
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
            {selectedExerciseForEdit
              ? get(strings, "adminv2.edit_exercise", "Edit Exercise")
              : get(strings, "adminv2.create_exercise", "Create Exercise")}
          </span>
        </h2>
      </div>

      <input
        type="text"
        placeholder={get(strings, "adminv2.exercise_title", "Exercise Title")}
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

      {/* Trainer Selector - Only for Admins */}
      {userInfo.role === "admin" && (
        <Select
          placeholder={get(strings, "adminv2.select_trainer", "Select Trainer")}
          value={selectedTrainer}
          onChange={(value) => setSelectedTrainer(value)}
          style={{
            width: "100%",
            marginTop: "10px",
          }}
          dropdownStyle={{
            backgroundColor: "#222935",
            border: "1px solid #FF950A",
          }}
          className="trainer-selector"
        >
          {allTrainers.map((trainer) => (
            <Select.Option
              key={trainer._id}
              value={trainer._id}
              style={{
                backgroundColor: "#222935",
                color: "#fff",
              }}
            >
              {trainer.firstName} {trainer.lastName}
            </Select.Option>
          ))}
        </Select>
      )}

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
                <span
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
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile({ link: videoFile.link, name: exerciseTitle || "Video Preview" });
                    setPreviewModalVisible(true);
                  }}
                >
                  {videoFile.link}
                </span>
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
                  title={get(strings, "adminv2.remove", "Remove")}
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
            {get(strings, "adminv2.select_video", "Select Video")}
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
                <span
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
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile({ link: audioFile.link, name: exerciseTitle || "Audio Preview" });
                    setPreviewModalVisible(true);
                  }}
                >
                  {audioFile.link}
                </span>
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
                  title={get(strings, "adminv2.remove", "Remove")}
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
            {get(strings, "adminv2.select_audio", "Select Audio")}
            <br /> {get(strings, "adminv2.optional", "(Optional)")}
          </h2>
        </div>
      </div>
      <textarea
        placeholder={get(strings, "adminv2.exercise_description_optional", "Exercise Description (Optional)")}
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
        disabled={!exerciseTitle || !videoFile || !selectedTrainer || loading}
      >
        {get(strings, "adminv2.save", "Save")}
      </button>
      <PreviewModal
        visible={previewModalVisible}
        onClose={() => setPreviewModalVisible(false)}
        file={previewFile}
      />
    </Modal>
  );
}

export default ExerciseCreatorPopup;
