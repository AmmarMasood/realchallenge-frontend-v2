import { useContext, useEffect, useState } from "react";
import { Modal } from "antd";
import "../../components/Admin/V2/Workout/MusicChooseModal/MusicChooseModal.css";
import HeartIcon from "../../assets/icons/heart-icon.svg";
import HeartIconOrange from "../../assets/icons/heart-icon.svg";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";
import { LanguageContext } from "../../contexts/LanguageContext";
import { createTrainerGoal, updateTrainerGoal } from "../../services/trainers";
import { get } from "lodash";

function GoalCreatorPopup({ open, setOpen, onSuccess, selectedGoalForEdit }) {
  const { language, strings } = useContext(LanguageContext);
  const [goalName, setGoalName] = useState("");
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [iconFile, setIconFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (selectedGoalForEdit) {
        // Edit mode - populate with existing data
        setGoalName(selectedGoalForEdit.name || "");
        setIconFile(
          selectedGoalForEdit.icon ? { link: selectedGoalForEdit.icon } : null
        );
      } else {
        // Create mode - clear everything
        setGoalName("");
        setIconFile(null);
        setMediaManagerVisible(false);
        setMediaManagerType("images");
        setMediaManagerActions([]);
      }
    } else {
      // Modal closed - clear all state
      setGoalName("");
      setIconFile(null);
      setMediaManagerVisible(false);
      setMediaManagerType("images");
      setMediaManagerActions([]);
    }
  }, [open, selectedGoalForEdit]);

  const openMediaManager = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("images");
    setMediaManagerActions([iconFile, setIconFile]);
  };

  const onCreate = async () => {
    if (!goalName) {
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: goalName,
        icon: iconFile?.link || "",
        language,
      };

      if (selectedGoalForEdit) {
        await updateTrainerGoal(data, selectedGoalForEdit._id);
      } else {
        await createTrainerGoal(data);
      }

      setLoading(false);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving goal:", error);
      setLoading(false);
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
        <img
          src={HeartIconOrange}
          alt="img"
          className="music-selector__icon"
          style={{ width: "30px", height: "30px" }}
        />
        <h2 className="music-selector__title">
          <span>
            {selectedGoalForEdit
              ? get(strings, "adminv2.edit_interest", "Edit Interest")
              : get(strings, "adminv2.create_interest", "Create Interest")}
          </span>
        </h2>
      </div>

      <input
        type="text"
        placeholder={get(strings, "adminv2.interest_name", "Interest Name")}
        value={goalName}
        onChange={(e) => setGoalName(e.target.value)}
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
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            width: "100%",
            cursor: "pointer",
          }}
          onClick={openMediaManager}
        >
          <div
            style={{
              background: "#222935",
              padding: "6px 10px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "1px dashed #fff",
            }}
          >
            {iconFile ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={iconFile.link}
                  alt="icon-preview"
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIconFile(null);
                  }}
                  title={get(strings, "adminv2.remove", "Remove")}
                >
                  {get(strings, "adminv2.remove", "Remove")}
                </span>
              </div>
            ) : (
              <img
                src={HeartIcon}
                alt="select-icon"
                style={{ width: "40px", height: "40px", opacity: 0.7 }}
              />
            )}
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            {get(strings, "adminv2.select_icon", "Select Icon")}
            <br />
            {get(strings, "adminv2.optional", "(Optional)")}
          </h2>
        </div>
      </div>

      <button
        className="music-selector__next-btn"
        onClick={onCreate}
        style={{ marginTop: "15px" }}
        disabled={!goalName || loading}
      >
        {loading
          ? get(strings, "adminv2.saving", "Saving...")
          : get(strings, "adminv2.save", "Save")}
      </button>
    </Modal>
  );
}

export default GoalCreatorPopup;
