import React, { useContext } from "react";

import Carousel from "react-multi-carousel";
import VideoThumbnail from "react-video-thumbnail";
import {
  exerciseWorkoutTimeTrackContext,
  playerFullscreenContext,
  playerStateContext,
} from "../../../../../contexts/PlayerState";
import AddExercise from "../../../../../assets/icons/add-exercise.svg";
import AddNewExercise from "../../../../../assets/icons/add-new-exercise.svg";
import { DeleteFilled } from "@ant-design/icons";
import { v4 } from "uuid";
import { useChallenge } from "../../../../../contexts/ChallengeCreatorV2";
import ExerciseModal from "../ExerciseModal/ExerciseModal";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop3: {
    breakpoint: { max: 3000, min: 1600 },
    items: 4,
  },
  desktop2: {
    breakpoint: { max: 1600, min: 1350 },
    items: 3.5,
  },
  desktop: {
    breakpoint: { max: 1350, min: 1100 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1100, min: 850 },
    items: 2.5,
  },
  mobile2: {
    breakpoint: { max: 850, min: 600 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 600, min: 0 },
    items: 1,
  },
};

function Exercises({
  workout,
  setWorkout,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
  handleUpdateRenderedExercise,
  fromFullScreen = true,
}) {
  const { allExercises, seletedTrainers } = useChallenge();
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [fullscreen, setFullscreen] = useContext(playerFullscreenContext);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const [exerciseIdToUpdate, setExerciseIdToUpdate] = React.useState(null);

  const handleOpenExerciseForHelp = (e) => {
    setPlayerState({ ...playerState, playing: false, muted: true });
    setExerciseForHelpModal(e);
    setOpenHelpModal(true);
  };

  const handleChangeExercise = (i) => {
    setCurrentExercise({
      exercise: workout.exercises[i],
      index: i,
      completed: Math.round((i / (workout.exercises.length - 1)) * 100),
    });
    setPlayerState({ ...playerState, playing: false, muted: false });
    updateExerciseWorkoutTimer(i);
  };

  const updateExerciseWorkoutTimer = (index) => {
    if (workout.renderWorkout) {
      const allExercisesBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce(
          (a, b) => parseInt(a, 0) + (parseInt(b["exerciseLength"]) || 0),
          0
        );
      const allBreaksBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce((a, b) => parseInt(a, 0) + (parseInt(b["break"]) || 0), 0);
      // console.log("allExercisesBeforeTheNextExercise",allExercisesBeforeTheNextExercise+allBreaksBeforeTheNextExercise)
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current:
          allExercisesBeforeTheNextExercise + allBreaksBeforeTheNextExercise,
      }));
    }
  };

  const handleExerciseDuration = (e, id) => {
    e.preventDefault();
    const { value } = e.target;
    const exercise = workout.exercises.find((exercise) => exercise.id === id);
    const updatedExercise = { ...exercise, exerciseLength: value };
    const updatedExercises = workout.exercises.map((exercise) =>
      exercise.id === id ? updatedExercise : exercise
    );
    setWorkout({ ...workout, exercises: updatedExercises });

    // if current exercise is the one being updated, update the workout time track
    if (currentExercise && currentExercise?.exercise.id === id) {
      const allExercisesBeforeTheNextExercise = workout.exercises
        .slice(0, currentExercise.index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workout.exercises
        .slice(0, currentExercise.index)
        .reduce((a, b) => a + (parseInt(b["break"]) || 0), 0);
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current:
          allExercisesBeforeTheNextExercise + allBreaksBeforeTheNextExercise,
      }));
    }
  };

  const handleExerciseBreakTimer = (e, id) => {
    e.preventDefault();
    const { value } = e.target;
    const exercise = workout.exercises.find((exercise) => exercise.id === id);
    const updatedExercise = { ...exercise, break: parseInt(value) };
    const updatedExercises = workout.exercises.map((exercise) =>
      exercise.id === id ? updatedExercise : exercise
    );

    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleExerciseTitle = (e, id) => {
    e.preventDefault();
    const { value } = e.target;
    const exercise = workout.exercises.find((exercise) => exercise.id === id);
    const updatedExercise = { ...exercise, title: value };
    const updatedExercises = workout.exercises.map((exercise) =>
      exercise.id === id ? updatedExercise : exercise
    );
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleExerciseGroupName = (e, id) => {
    e.preventDefault();
    const { value } = e.target;
    const exercise = workout.exercises.find((exercise) => exercise.id === id);
    const updatedExercise = { ...exercise, exerciseGroupName: value };
    const updatedExercises = workout.exercises.map((exercise) =>
      exercise.id === id ? updatedExercise : exercise
    );
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const addNewExercise = () => {
    const newExercise = {
      break: 0,
      createdAt: "",
      exerciseGroupName: "",
      exerciseLength: 0,
      title: "",
      videoURL: "",
      voiceOverLink: "",
      id: v4(),
    };
    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  const removeExercise = (e, exercise) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedExercises = workout.exercises.filter(
      (ex) => ex.id !== exercise.id
    );
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const openExerciseModal = (e) => {
    setShowExerciseModal(true);
    setExerciseIdToUpdate(e.id);
  };

  const onSelectExercise = (exercise) => {
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseIdToUpdate) {
        return {
          ...ex,
          title: exercise.title,
          videoURL: exercise.videoURL,
          voiceOverLink: exercise.voiceOverLink,
          exerciseId: exercise._id,
        };
      }
      return ex;
    });
    setWorkout({ ...workout, exercises: updatedExercises });
    setShowExerciseModal(false);
    setExerciseIdToUpdate(null);
  };
  return (
    <>
      <ExerciseModal
        exerciseModal={showExerciseModal}
        setExerciseModal={setShowExerciseModal}
        allExercises={allExercises}
        seletedTrainers={seletedTrainers}
        onExerciseSelect={onSelectExercise}
      />
      <div
        className="challenge-player-container-exercies"
        style={{
          background: fromFullScreen && "none",
          width: fromFullScreen && "100%",
        }}
      >
        <div className="video-browser-container">
          <Carousel responsive={responsive}>
            {workout.exercises &&
              workout.exercises.map((e, i) => {
                return i === 0 ? (
                  <div
                    key={e.id || i}
                    aria-label={`Exercise ${i + 1}`}
                    className={`${
                      currentExercise.index === i
                        ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                        : "exercise-browser-card"
                    }`}
                  >
                    <div>
                      <h4 className="challenge-player-container-exercies-round font-paragraph-white">
                        {e.exerciseGroupName ? (
                          e.exerciseGroupName
                        ) : (
                          <span style={{ opacity: 0 }}>-</span>
                        )}
                      </h4>
                    </div>
                    {/* {workout.renderWorkout && e.videoURL && (
                      <img
                        src={SquarePlay}
                        onClick={() =>
                          setPlayerState({ ...playerState, playing: true })
                        }
                        alt=""
                        className="challenge-player-container-exercies-box-asktrainerbtn"
                        style={{ padding: "8px" }}
                      />
                    )} */}
                    <div
                      className="challenge-player-container-exercies-box"
                      key={e.id}
                      onClick={() => handleChangeExercise(i)}
                    >
                      <div
                        className="challenge-player-container-exercies-box-imagebox"
                        onClick={(event) =>
                          handleUpdateRenderedExercise(event, e)
                        }
                      >
                        {e.videoURL ? (
                          <VideoThumbnail
                            videoUrl={
                              e.videoURL
                                ? `${process.env.REACT_APP_SERVER}/uploads/${e.videoURL}`
                                : ""
                            }
                            width={250}
                            height={200}
                            cors={true}
                          />
                        ) : (
                          <img src={AddExercise} alt="add-exercise" />
                        )}
                      </div>
                      <div className="challenge-player-container-exercies-box-details font-paragraph-white">
                        <p style={{ lineHeight: "10px" }}>{e.title}</p>

                        {workout.renderWorkout && (
                          <input
                            onClick={(e) => e.stopPropagation()}
                            className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                            onChange={(t) => handleExerciseDuration(t, e.id)}
                            placeholder="Exercise Duration in Sec"
                            value={e.exerciseLength}
                            style={{
                              marginTop: "-10px",
                              paddingLeft: "5px",
                              width: "fit-content",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${
                      currentExercise.index === i
                        ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                        : "exercise-browser-card"
                    }`}
                  >
                    {workout.renderWorkout && (
                      <DeleteFilled
                        style={{
                          color: "#fff",
                          fontSize: "22px",
                          position: "absolute",
                          right: "10px",
                          zIndex: "10000000",
                        }}
                        onClick={(event) => removeExercise(event, e)}
                      />
                    )}
                    {workout.renderWorkout && (
                      <div>
                        <h4 className="challenge-player-container-exercies-round font-paragraph-white">
                          <input
                            className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                            onChange={(t) => handleExerciseGroupName(t, e.id)}
                            value={e.exerciseGroupName}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Group 1/3"
                            style={{
                              paddingLeft: "5px",
                              width: "160px",
                            }}
                          />
                        </h4>
                      </div>
                    )}
                    {/* {workout.renderWorkout && !fullscreen && (
                    <img
                      src={SquarePT}
                      alt=""
                      className="challenge-player-container-exercies-box-asktrainerbtn"
                      onClick={() => handleOpenExerciseForHelp(e)}
                    />
                  )} */}
                    <div
                      className="challenge-player-container-exercies-box"
                      key={e.id}
                      onClick={() => handleChangeExercise(i)}
                    >
                      <div
                        className="challenge-player-container-exercies-box-imagebox"
                        onClick={(event) => {
                          if (workout.renderWorkout) {
                            openExerciseModal(e);
                          } else {
                            handleUpdateRenderedExercise(event, e);
                          }
                        }}
                      >
                        {e.videoURL ? (
                          <VideoThumbnail
                            videoUrl={
                              e.videoURL
                                ? `${process.env.REACT_APP_SERVER}/uploads/${e.videoURL}`
                                : ""
                            }
                            width={250}
                            height={200}
                            cors={true}
                          />
                        ) : (
                          <img src={AddExercise} alt="add-exercise" />
                        )}
                      </div>
                      <div
                        className="challenge-player-container-exercies-box-details font-paragraph-white"
                        style={{
                          display: "grid",
                          gridTemplateRows: "1fr 1fr",
                        }}
                      >
                        <input
                          className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                          onChange={(t) => handleExerciseTitle(t, e.id)}
                          placeholder="Name Exercise"
                          value={e.title}
                          disabled={workout.renderWorkout}
                          style={{
                            paddingLeft: "5px",
                            width: "fit-content",
                          }}
                        />
                        {workout.renderWorkout && (
                          <input
                            onClick={(e) => e.stopPropagation()}
                            className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                            onChange={(t) => handleExerciseDuration(t, e.id)}
                            placeholder="Duration in sec"
                            value={e.exerciseLength}
                            type="number"
                            style={{
                              paddingLeft: "5px",
                              width: "fit-content",
                            }}
                          />
                        )}
                        {workout.renderWorkout && (
                          <input
                            onClick={(e) => e.stopPropagation()}
                            className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                            onChange={(t) => handleExerciseBreakTimer(t, e.id)}
                            placeholder="Exercise Break in Sec"
                            value={e.break}
                            type="number"
                            style={{
                              paddingLeft: "5px",
                              width: "fit-content",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {!workout.renderWorkout && workout.exercises?.length === 2 ? (
              <div></div>
            ) : (
              <img
                src={AddNewExercise}
                onClick={addNewExercise}
                alt="exercise"
                style={{
                  cursor: "pointer",
                  marginTop: "00px",
                }}
              />
            )}
          </Carousel>
        </div>
      </div>
    </>
  );
}

export default Exercises;
