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
import { CopyOutlined, DeleteFilled } from "@ant-design/icons";
import { v4 } from "uuid";
import { useChallenge } from "../../../../../contexts/ChallengeCreatorV2";
import ExerciseChooseModal from "../ExerciseChooseModal/ExerciseChooseModal";
import {
  DraggableArea,
  DraggableHandle,
  DraggableItem,
  ItemTypeExercise,
} from "../../../../../helpers/DndWrapper";
import DragAndDropIcon from "../../../../../assets/icons/drag-drop-icon-white.svg";
import SquarePT from "../../../../../assets/icons/Square-PT.png";
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
    const exercise = allExercises.find(
      (exercise) => exercise._id === e.exerciseId
    );
    setPlayerState({ ...playerState, playing: false, muted: true });
    setExerciseForHelpModal({ ...e, description: exercise?.description || "" });
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

  const removeIntroExercise = (e, exercise) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedExercises = workout.exercises.map((ex, idx) =>
      idx === 0 ? { ...ex, videoURL: "", exerciseLength: 0 } : ex
    );
    setWorkout({ ...workout, exercises: updatedExercises });
  };
  const duplicateExercise = (exercise) => {
    const newExercise = {
      id: v4(),
      title: exercise.title || "",
      videoURL: exercise.videoURL || "",
      voiceOverLink: exercise.voiceOverLink || "",
      break: exercise.break || 0,
      exerciseGroupName: exercise.exerciseGroupName || "",
      exerciseLength: exercise.exerciseLength || 0,
      exerciseId: exercise.exerciseId || "",
    };
    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  const openExerciseModal = (e) => {
    setShowExerciseModal(true);
    setExerciseIdToUpdate(e.id);
  };

  const onSelectExercise = (exercise, duration, exerciseBreak) => {
    const updatedExercises = workout.exercises.map((ex) => {
      if (ex.id === exerciseIdToUpdate) {
        return {
          ...ex,
          title: exercise.title,
          videoURL: exercise.videoURL,
          videoThumbnailURL: exercise.videoThumbnailURL,
          voiceOverLink: exercise.voiceOverLink,
          exerciseId: exercise._id,
          exerciseLength: parseInt(duration) || ex.exerciseLength,
          break: parseInt(exerciseBreak) || ex.break,
        };
      }
      return ex;
    });
    setWorkout({ ...workout, exercises: updatedExercises });
    setShowExerciseModal(false);
    setExerciseIdToUpdate(null);
  };

  const handleExerciseOrder = (newOrder) => {
    //  remove undefined ids
    const filteredOrder = newOrder.filter((id) => id !== undefined);
    const newOrderedKeys = filteredOrder.map((exercise) => exercise.key);
    const updatedExercises = newOrderedKeys.map((id) => {
      return workout.exercises.find((exercise) => exercise.id === id);
    });

    // update the order of all exercises other than the first
    const firstExercise = workout.exercises[0];

    const updatedOrderedExercises = [firstExercise, ...updatedExercises];
    setWorkout((prev) => ({
      ...prev,
      exercises: updatedOrderedExercises,
    }));
  };
  const firstExercise = workout.exercises && workout.exercises[0];
  const remainingExercises = workout.exercises && workout.exercises.slice(1);

  return (
    <>
      <ExerciseChooseModal
        open={showExerciseModal}
        setOpen={setShowExerciseModal}
        exercises={allExercises}
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
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              overflowY: "hidden",
              maxWidth: "90vw",
            }}
          >
            {firstExercise && (
              <div
                key={0}
                aria-label={`Exercise 0`}
                className={`${
                  currentExercise.index === 0
                    ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                    : "exercise-browser-card"
                }`}
              >
                {workout.renderWorkout &&
                  (firstExercise?.videoURL ||
                    firstExercise?.exerciseLength > 0) && (
                    <DeleteFilled
                      style={{
                        color: "#fff",
                        fontSize: "22px",
                        position: "absolute",
                        right: "10px",
                        zIndex: 100,
                        cursor: "pointers",
                      }}
                      onClick={(event) =>
                        removeIntroExercise(event, firstExercise)
                      }
                    />
                  )}
                <div>
                  <h4 className="challenge-player-container-exercies-round font-paragraph-white">
                    {firstExercise.exerciseGroupName ? (
                      firstExercise.exerciseGroupName
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
                  key={firstExercise.id}
                  onClick={() => handleChangeExercise(0)}
                >
                  <div
                    className="challenge-player-container-exercies-box-imagebox"
                    onClick={(event) =>
                      handleUpdateRenderedExercise(event, firstExercise)
                    }
                  >
                    {firstExercise.videoURL ? (
                      firstExercise.videoThumbnailURL ? (
                        <img
                          src={firstExercise.videoThumbnailURL}
                          alt="thumbnail"
                          style={{
                            width: 250,
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <VideoThumbnail
                          videoUrl={firstExercise.videoURL}
                          width={250}
                          height={200}
                          cors={true}
                        />
                      )
                    ) : (
                      <img src={AddExercise} alt="add-exercise" />
                    )}
                  </div>
                  <div className="challenge-player-container-exercies-box-details font-paragraph-white">
                    <p style={{ lineHeight: "10px" }}>{firstExercise.title}</p>

                    {workout.renderWorkout && (
                      <input
                        onClick={(e) => e.stopPropagation()}
                        className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                        onChange={(t) =>
                          handleExerciseDuration(t, firstExercise.id)
                        }
                        placeholder="Exercise Duration in Sec"
                        value={firstExercise.exerciseLength}
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
            )}

            <DraggableArea
              onChange={(newOrder) => handleExerciseOrder(newOrder)}
              direction="horizontal"
              itemType={ItemTypeExercise}
            >
              {remainingExercises &&
                remainingExercises.map((e, i) => {
                  i += 1; // Adjust index to match the original exercise index
                  return (
                    <DraggableItem key={e.id} id={e.id}>
                      <div
                        className={`${
                          currentExercise.index === i
                            ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                            : "exercise-browser-card"
                        }`}
                        key={e.id}
                      >
                        {workout.renderWorkout && (
                          <DeleteFilled
                            style={{
                              color: "#fff",
                              fontSize: "22px",
                              position: "absolute",
                              right: "10px",
                            }}
                            onClick={(event) => removeExercise(event, e)}
                          />
                        )}
                        {workout.renderWorkout && (
                          <DraggableHandle>
                            <img
                              src={DragAndDropIcon}
                              alt="drag"
                              style={{ transform: "rotate(90deg)" }}
                            />
                          </DraggableHandle>
                        )}
                        {workout.renderWorkout && (
                          <CopyOutlined
                            onClick={(evet) => {
                              evet.stopPropagation();
                              evet.preventDefault();
                              duplicateExercise(e);
                            }}
                            style={{
                              color: "#fff",
                              fontSize: "20px",
                              cursor: "pointer",
                              marginLeft: "10px",
                              position: "absolute",
                              top: "8px",
                              right: "35px",
                            }}
                          />
                        )}
                        {workout.renderWorkout && (
                          <div>
                            <h4 className="challenge-player-container-exercies-round font-paragraph-white">
                              <input
                                className="v2workout-field v2workout-field-withborder v2workout-subtitle"
                                onChange={(t) =>
                                  handleExerciseGroupName(t, e.id)
                                }
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
                        {workout.renderWorkout &&
                          !fullscreen &&
                          e?.videoURL && (
                            <img
                              src={SquarePT}
                              alt=""
                              className="challenge-player-container-exercies-box-asktrainerbtn"
                              style={{
                                top: "85px",
                              }}
                              onClick={() => handleOpenExerciseForHelp(e)}
                            />
                          )}
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
                              e.videoThumbnailURL ? (
                                <img
                                  src={e.videoThumbnailURL}
                                  alt="thumbnail"
                                  style={{
                                    width: 250,
                                    height: 200,
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <VideoThumbnail
                                  videoUrl={e.videoURL}
                                  width={250}
                                  height={200}
                                  cors={true}
                                />
                              )
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
                                onChange={(t) =>
                                  handleExerciseDuration(t, e.id)
                                }
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
                                onChange={(t) =>
                                  handleExerciseBreakTimer(t, e.id)
                                }
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
                    </DraggableItem>
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
            </DraggableArea>
          </div>
        </div>
      </div>
    </>
  );
}

const exercisesWithDragAndDrop = (props) => {};
const exercisesWithoutDragAndDrop = (props) => {};

export default Exercises;
