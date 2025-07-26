import { Modal } from "antd";
import React, { useContext, useEffect } from "react";
import "./ExerciseChooseModal.css";
import DumbellIcon from "../../../../../assets/icons/dumb-bell-icon-orange.svg";
import { duration } from "moment";
import { userInfoContext } from "../../../../../contexts/UserStore";

function ExerciseChooseModal({
  open,
  setOpen,
  exercises,
  seletedTrainers,
  onExerciseSelect,
}) {
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [filteredExercises, setFilteredExercises] = React.useState([]);
  const [selectedExercise, setSelectedExercise] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedDuration, setSelectedDuration] = React.useState("");
  const [selectedBreak, setSelectedBreak] = React.useState("");

  React.useEffect(() => {
    if (userInfo && userInfo.role === "admin") {
      setFilteredExercises(exercises);
    } else {
      if (
        exercises &&
        exercises.length > 0 &&
        seletedTrainers &&
        seletedTrainers.length > 0
      ) {
        const trainerIds = seletedTrainers.map((trainer) => trainer._id);
        const filtered = exercises.filter((exercise) => {
          return exercise.trainer && trainerIds.includes(exercise.trainer._id);
        });
        setFilteredExercises(filtered);
      }
    }
  }, [exercises, seletedTrainers]);

  useEffect(() => {
    setCurrentStep(1);
    setSelectedExercise(null);
    setSelectedDuration("");
    setSelectedBreak("");
  }, [open]);

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(
      exercise._id === selectedExercise?._id ? null : exercise
    );
  };

  const handleNext = () => {
    makDurationAndBreakEmpty();
    setCurrentStep(2);
  };

  const handleSave = () => {
    if (selectedExercise && onExerciseSelect) {
      onExerciseSelect(selectedExercise, selectedDuration, selectedBreak);
    }
    setOpen(false);
  };

  const makDurationAndBreakEmpty = () => {
    setSelectedDuration("");
    setSelectedBreak("");
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
      {currentStep === 1 && (
        <>
          <div className="exercise-selector__header">
            <img
              src={DumbellIcon}
              alt="img"
              className="exercise-selector__icon"
            />
            <h2 className="exercise-selector__title">Choose Exercise</h2>
          </div>

          <div className="exercise-selector__list">
            {filteredExercises.map((exercise, index) => (
              <div
                key={index}
                className={`exercise-selector__item ${
                  selectedExercise?._id === exercise?._id
                    ? "exercise-selector__item--selected"
                    : ""
                }`}
                onClick={() => handleExerciseSelect(exercise)}
              >
                <p>{exercise.name || exercise.title || "Unnamed Exercise"}</p>
                <span>Exercise ID: {exercise._id}</span>
              </div>
            ))}
          </div>

          <button
            className="exercise-selector__next-btn"
            onClick={handleNext}
            disabled={!selectedExercise}
          >
            Next
          </button>
        </>
      )}
      {currentStep === 2 && (
        <>
          <div className="exercise-selector__header">
            <img
              src={DumbellIcon}
              alt="img"
              className="exercise-selector__icon"
            />
            <h2 className="exercise-selector__title">Choose Exercise</h2>
          </div>

          <div className="exercise-selector__list">
            <div className={`exercise-selector__item`}>
              <p>
                {selectedExercise.name ||
                  selectedExercise.title ||
                  "Unnamed Exercise"}
              </p>
            </div>
          </div>

          <div className="exercise-selector__inputbox">
            <div>
              <div>
                <input
                  placeholder="00"
                  type="number"
                  onChange={(e) => setSelectedDuration(e.target.value)}
                />
              </div>
              <label>Duration</label>
            </div>

            <div>
              <div>
                <input
                  placeholder="00"
                  type="number"
                  onChange={(e) => setSelectedBreak(e.target.value)}
                />
              </div>
              <label>Break</label>
            </div>
          </div>
          <button
            className="exercise-selector__next-btn"
            onClick={() => setCurrentStep(1)}
            style={{ marginRight: "10px" }}
          >
            Back
          </button>
          <button
            className="exercise-selector__next-btn"
            onClick={handleSave}
            disabled={!selectedExercise || !selectedDuration || !selectedBreak}
          >
            Save
          </button>
        </>
      )}
    </Modal>
  );
}

export default ExerciseChooseModal;
