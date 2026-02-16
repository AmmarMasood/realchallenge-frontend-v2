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
  const [dimensions, setDimensions] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    if (
      exercises &&
      exercises.length > 0 &&
      seletedTrainers &&
      seletedTrainers.length > 0
    ) {
      // console.log("seletedTrainers", seletedTrainers, exercises);
      const trainerIds = seletedTrainers.map((trainer) => trainer._id);
      const filtered = exercises.filter((exercise) => {
        return exercise.trainer && trainerIds.includes(exercise.trainer._id);
      });
      setFilteredExercises(filtered);
    }
  }, [exercises, seletedTrainers]);

  // Update dimensions on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentStep(1);
    setSelectedExercise(null);
    setSelectedDuration("");
    setSelectedBreak("");
  }, [open]);

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    const { width, height } = dimensions;

    if (width < 600) {
      return {
        width: "95vw",
        listHeight: `${height - 250}px`,
        maxListHeight: "60vh",
      };
    } else if (width < 900) {
      return {
        width: "90vw",
        listHeight: `${height - 280}px`,
        maxListHeight: "65vh",
      };
    } else if (width < 1200) {
      return {
        width: "85vw",
        listHeight: `${height - 300}px`,
        maxListHeight: "70vh",
      };
    } else {
      return {
        width: "80vw",
        listHeight: `${height - 350}px`,
        maxListHeight: "75vh",
      };
    }
  };

  const responsiveDimensions = getResponsiveDimensions();

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

  const handleDurationChange = (e) => {
    const { value } = e.target;
    // Prevent values less than 1
    if (parseInt(value) < 1) {
      return;
    }
    setSelectedDuration(value);
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
      width={responsiveDimensions.width}
      centered
      bodyStyle={{
        backgroundColor: "#171e27",
        border: "1px solid #FF950A",
        textAlign: "center",
        padding: dimensions.width < 600 ? "12px" : "24px",
      }}
      style={{
        top: dimensions.width < 600 ? 10 : undefined,
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

          {seletedTrainers.length === 0 && (
            <div className="exercise-selector__no-exercise">
              <p className="font-paragraph-white">
                Please select at least one trainer to see their exercises.
              </p>
            </div>
          )}
          {seletedTrainers.length > 0 && filteredExercises.length === 0 && (
            <div className="exercise-selector__no-exercise">
              <p className="font-paragraph-white">No exercises available </p>
            </div>
          )}

          <div
            className="exercise-selector__list"
            style={{
              height: responsiveDimensions.listHeight,
              maxHeight: responsiveDimensions.maxListHeight,
            }}
          >
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
                  min="1"
                  onChange={handleDurationChange}
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
