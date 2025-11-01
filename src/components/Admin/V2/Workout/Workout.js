import React, { useContext, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import { Button, Spin, Tag, notification } from "antd";

import BackButton from "../../../../assets/icons/Back-button.png";
import WorkoutStudio from "../../../../assets/icons/workout-studio.svg";
import DumbellIcon from "../../../../assets/icons/dumbell.svg";
import AttachIcon from "../../../../assets/icons/attach-copy.svg";
import "../../../../assets/challengePlayer.css";
import "./workout.css";
import Attachment from "./Attachment/Attachment";
import RemoteMediaManager from "../../MediaManager/RemoteMediaManager";
import EquipmentModal from "./EquipmentModal/EquipmentModal";
import {
  deleteChallengeEquipment,
  getAllChallengeEquipments,
} from "../../../../services/createChallenge/equipments";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import EditTypeName from "../../ChallengeManager/EditTypeName";
import Exercises from "./Exercise/Exercises";
import { v4 } from "uuid";
import Player from "../../../Player/Player";
import { useChallenge } from "../../../../contexts/ChallengeCreatorV2";
import {
  exerciseWorkoutTimeTrackContext,
  playerStateContext,
} from "../../../../contexts/PlayerState";
import MusicIcon from "../../../../assets/icons/music-icon-white.svg";
import MusicChooseModal from "./MusicChooseModal/MusicChooseModal";
import HelpPopupPlayer from "../../../Player/HelpPopupPlayer";
import { useRemoteMediaManager } from "../../../../contexts/RemoteMediaManagerContext";

function Workout() {
  const {
    weeks,
    selectedWorkoutForStudioId,
    setWeeks,
    setShowVideoCreator,
    musics,
    setMusics,
  } = useChallenge();
  const { language } = useContext(LanguageContext);
  const {
    setMediaManagerVisible,
    setMediaManagerType,

    setMediaManagerActions,
  } = useRemoteMediaManager();
  //
  const [introVideoFile, setIntroVideoFile] = React.useState(null);

  const [infoFile, setInfoFile] = React.useState(null);
  //
  const [allEquipments, setAllEquipments] = React.useState([]);
  const [equipmentModal, setEquipmentModal] = React.useState(false);
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    React.useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = React.useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    React.useState("");
  const [selectedExercise, setSelectedExercise] = React.useState({
    exercise: {},
    index: 0,
    completed: 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [workoutInfo, setWorkoutInfo] = React.useState({});
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const [musicChooseModalVisible, setMusicChooseModalVisible] =
    React.useState(false);
  const [exerciseForHelpModal, setExerciseForHelpModal] = React.useState({});
  const [openHelpModal, setOpenHelpModal] = React.useState(false);

  const getWorkoutInfo = () => {
    const workout = weeks.find((week) =>
      week.id === selectedWorkoutForStudioId.weekId
        ? week.workouts.find(
            (workout) => workout.id === selectedWorkoutForStudioId.workoutId
          )
        : null
    );
    return workout
      ? workout.workouts.find(
          (workout) => workout.id === selectedWorkoutForStudioId.workoutId
        )
      : null;
  };

  // Call getWorkoutInfo only when selectedWorkoutForStudioId changes
  useEffect(() => {
    const workout = getWorkoutInfo();
    setWorkoutInfo(workout);

    if (workout) {
      const infoFile = workout.infoFile;
      if (infoFile) {
        setInfoFile(infoFile);
      }
    }
  }, [selectedWorkoutForStudioId, weeks]); // Dependencies: selectedWorkoutForStudioId and weeks

  useEffect(() => {
    if (workoutInfo && workoutInfo.exercises?.length > 0) {
      setSelectedExercise({
        ...selectedExercise,
        exercise: workoutInfo.exercises[0],
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (introVideoFile) {
      setWorkoutInfo({
        ...workoutInfo,
        exercises: workoutInfo.exercises?.map((exercise, index) => {
          if (exercise.id === selectedExercise.id) {
            return {
              ...exercise,
              videoURL: introVideoFile?.link,
              videoThumbnailURL: introVideoFile?.thumbnailUrl || "",
              // Auto-populate break to 5 seconds for intro exercise (index 0)
              break: index === 0 ? 5 : exercise.break,
            };
          }
          return exercise;
        }),
      });
    }
  }, [introVideoFile]);

  useEffect(() => {
    if (infoFile) {
      setWorkoutInfo({
        ...workoutInfo,
        infoFile: infoFile,
      });
    }
  }, [infoFile]);

  const fetchData = async () => {
    setLoading(true);
    await getAllEquipments();
    setLoading(false);
  };

  const updateWorkoutInfo = (e) => {
    setWorkoutInfo({
      ...workoutInfo,
      [e.target.name]: e.target.value,
    });
  };

  const onWorkoutInfoChange = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("docs");
    setMediaManagerActions([infoFile, setInfoFile]);
  };

  const onEquipmentSelect = () => {
    setEquipmentModal(true);
  };

  const getAllEquipments = async () => {
    const data = await getAllChallengeEquipments(language);
    if (data) {
      setAllEquipments(data.equipments);
    }
  };
  const removeEquipment = async (id) => {
    await deleteChallengeEquipment(id);
    const updatedEquipments = workoutInfo.equipments.filter(
      (item) => item._id !== id
    );
    setWorkoutInfo({
      ...workoutInfo,
      equipments: updatedEquipments,
    });
    fetchData();
  };

  const handleUpdateRenderedExercise = (event, e) => {
    // stop event propagation
    event.stopPropagation();
    setSelectedExercise(e);
    setMediaManagerVisible(true);
    setMediaManagerType("videos");
    setMediaManagerActions([introVideoFile, setIntroVideoFile]);
  };

  const updateExerciseWorkoutTimer = (type, index) => {
    if (type === "next") {
      const allExercisesBeforeTheNextExercise = workoutInfo.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workoutInfo.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["break"]) || 0), 0);
      // console.log("allExercisesBeforeTheNextExercise",allExercisesBeforeTheNextExercise+allBreaksBeforeTheNextExercise)
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current:
          allExercisesBeforeTheNextExercise + allBreaksBeforeTheNextExercise,
      }));
    }

    if (type === "prev") {
      const allExercisesBeforeTheNextExercise = workoutInfo.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workoutInfo.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["break"]) || 0), 0);
      // console.log("allExercisesBeforeTheNextExercise",allExercisesBeforeTheNextExercise+allBreaksBeforeTheNextExercise)
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current:
          allExercisesBeforeTheNextExercise + allBreaksBeforeTheNextExercise,
      }));
    }
  };

  const moveToNextExercise = (playerProgress) => {
    if (workoutInfo.exercises[selectedExercise.index + 1]) {
      const nextIndex = selectedExercise.index + 1;
      const nextExercise = workoutInfo.exercises[nextIndex];

      // Validate intro exercise has duration if it has a video
      if (nextIndex === 0 && nextExercise.videoURL && (!nextExercise.exerciseLength || nextExercise.exerciseLength <= 0)) {
        notification.error({
          message: "Duration Required",
          description: "Please enter a duration for the intro exercise before playing it.",
          placement: "topRight",
        });
        setPlayerState({ ...playerState, playing: false });
        return;
      }

      const completeionRate = Math.round(
        (nextIndex / (workoutInfo.exercises.length - 1)) * 100
      );
      setSelectedExercise({
        exercise: nextExercise,
        index: nextIndex,
        completed: completeionRate,
      });

      updateExerciseWorkoutTimer("next", nextIndex);
      setPlayerState({ ...playerState, playing: false });
      return;
    } else {
      setPlayerState({ ...playerState, playing: false });
      setSelectedExercise({
        exercise: selectedExercise.exercise,
        index: -1,
        completed: 100,
      });
      // setFinishWorkoutPopupVisible(true);
    }
  };

  const moveToPrevExercise = (playerProgress) => {
    if (workoutInfo.exercises[selectedExercise.index - 1]) {
      const prevIndex = selectedExercise.index - 1;
      const prevExercise = workoutInfo.exercises[prevIndex];

      // Validate intro exercise has duration if it has a video
      if (prevIndex === 0 && prevExercise.videoURL && (!prevExercise.exerciseLength || prevExercise.exerciseLength <= 0)) {
        notification.error({
          message: "Duration Required",
          description: "Please enter a duration for the intro exercise before playing it.",
          placement: "topRight",
        });
        setPlayerState({ ...playerState, playing: false });
        return;
      }

      const completeionRate = Math.round(
        (prevIndex / (workoutInfo.exercises.length - 1)) * 100
      );
      setSelectedExercise({
        exercise: prevExercise,
        index: prevIndex,
        completed: completeionRate,
      });
      updateExerciseWorkoutTimer("prev", prevIndex);
      setPlayerState({ ...playerState, playing: true });
      return;
    } else {
      alert("nothing on backside");
    }
  };

  const openMusicAdder = () => {
    setMusicChooseModalVisible(true);
  };

  const handleCloseExerciseForHelp = () => {
    setPlayerState({ ...playerState, playing: false, muted: true });
    setOpenHelpModal(false);
    setExerciseForHelpModal({});
    if (
      localStorage.getItem("music-playing") &&
      localStorage.getItem("music-playing") === false
    ) {
      localStorage.setItem("music-playing", true);
    }
  };

  return (
    <div
      className="challenge-player-container"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {loading && (
        <div className="center-inpage">
          <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
        </div>
      )}
      {openHelpModal && (
        <HelpPopupPlayer
          open={openHelpModal}
          onCancel={handleCloseExerciseForHelp}
          setOpen={setOpenHelpModal}
          exercise={exerciseForHelpModal}
        />
      )}
      <MusicChooseModal
        open={musicChooseModalVisible}
        setOpen={setMusicChooseModalVisible}
        musics={musics}
        setMusics={setMusics}
      />
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
          opacity: 0.7,
        }}
      >
        {/* {saving ? (
          <>
            <Spin size="small" style={{ color: "#fff" }} />
            <span
              style={{
                fontSize: "14px",
                color: "#fff",
                marginLeft: "10px",
              }}
            >
              Saving...
            </span>
          </>
        ) : (
          <Button
            style={{
              backgroundColor: "#ff7700",
              color: "#fff",
              border: "none",
            }}
          >
            Save
          </Button>
        )} */}
      </div>
      <div className="fullplayer-container">
      <div className="v2challenge-player-container">
        <div className="v2workout-studio-top">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              onClick={() => {
                const updatedWeeks = weeks?.map((week) => {
                  if (week.id === selectedWorkoutForStudioId.weekId) {
                    return {
                      ...week,
                      workouts: week.workouts?.map((workout) =>
                        workout.id === selectedWorkoutForStudioId.workoutId
                          ? { ...workout, ...workoutInfo } // Update the workout with workoutInfo
                          : workout
                      ),
                    };
                  }
                  return week;
                });

                setWeeks(updatedWeeks);
                setShowVideoCreator(false); // Close the video creator
              }}
              src={BackButton}
              alt="back-button"
              style={{
                cursor: "pointer",
                marginRight: "20px",
                height: "30px",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "10px",
              }}
            >
              <input
                onChange={updateWorkoutInfo}
                name="title"
                className="v2workout-field v2workout-title"
                value={workoutInfo.title}
                type="title"
                placeholder="Type Title"
              />
              <input
                onChange={updateWorkoutInfo}
                name="subtitle"
                className="v2workout-field v2workout-subtitle"
                value={workoutInfo.subtitle}
                placeholder="Type more info"
              />
            </div>
          </div>
          <img src={WorkoutStudio} alt="workout-studio" />
        </div>

        <div className="v2workout-studio-middle">
          <button className="music-icon-button" onClick={openMusicAdder}>
            <span>Add background music</span>
            <img src={MusicIcon} alt="music-icon" />
          </button>
          <Player
            moveToNextExercise={moveToNextExercise}
            moveToPrevExercise={moveToPrevExercise}
            musics={musics}
            nextExerciseTitle={
              workoutInfo.exercises &&
              workoutInfo.exercises[selectedExercise.index + 1]
                ? workoutInfo.exercises[selectedExercise.index + 1].title
                : ""
            }
            exercise={selectedExercise.exercise}
            // challengePageAddress={`/challenge/${challengeName}/${challengeId}`}
            key={selectedExercise.exercise?.id}
            // for full screen player video browser
            workout={workoutInfo}
            setExerciseForHelpModal={setExerciseForHelpModal}
            setOpenHelpModal={setOpenHelpModal}
            setCurrentExercise={setSelectedExercise}
            currentExercise={selectedExercise}
            inCreation={true}
          />

          <div className="video-browser-container">
            {workoutInfo && workoutInfo.exercises && (
              <Exercises
                workout={workoutInfo}
                setWorkout={setWorkoutInfo}
                setCurrentExercise={setSelectedExercise}
                currentExercise={selectedExercise}
                handleUpdateRenderedExercise={handleUpdateRenderedExercise}
                setExerciseForHelpModal={setExerciseForHelpModal}
                setOpenHelpModal={setOpenHelpModal}
              />
            )}
          </div>
        </div>

        <div
          className="v2workout-studio-bottom player-download-stuff"
          style={{
            marginBottom: "50px",
          }}
        >
          <h2
            className="font-heading-white"
            style={{
              color: "#686D73",
              fontSize: "20px",
              marginBottom: "0px",
            }}
          >
            EXERCISES
          </h2>
          <h3
            className="font-paragraph-white"
            style={{
              fontSize: "15px",
              color: "#898C91",
            }}
          >
            Navigate to each exercise or hit the personal trainer button for
            audio explanation
          </h3>
          <div className="v2workout-studio-bottom-grid">
            <Attachment
              heading={"TODAY’S WORKOUT ATTACHMENT"}
              logo={AttachIcon}
              onClick={onWorkoutInfoChange}
              selectedValue={infoFile}
              setSelectedValue={setInfoFile}
            />
            <div>
              <Attachment
                heading={"TODAY’S EQUIPMENTS"}
                logo={DumbellIcon}
                onClick={onEquipmentSelect}
              />
              <div
                style={{
                  display: "flex",
                  marginTop: "5px",
                }}
              >
                {workoutInfo.equipments?.map((equipment) => (
                  <p
                    className="font-paragraph-white"
                    style={{
                      border: "1px solid #fff",
                      opacity: 0.7,
                      padding: "5px",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    {equipment.name}
                    <span
                      style={{
                        marginLeft: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const updatedEquipments = workoutInfo.equipments.filter(
                          (item) => item._id !== equipment._id
                        );
                        setWorkoutInfo({
                          ...workoutInfo,
                          equipments: updatedEquipments,
                        });
                      }}
                    >
                      X
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <EquipmentModal
        selectedEquipments={workoutInfo.equipments}
        setSelectedEquipments={(updatedEquipments) => {
          setWorkoutInfo({
            ...workoutInfo,
            equipments: updatedEquipments,
          });
        }}
        equipmentModal={equipmentModal}
        setEquipmentModal={setEquipmentModal}
        allEquipments={allEquipments}
        fethData={fetchData}
        removeItem={removeEquipment}
        setSelectedItemForUpdateTitle={setSelectedItemForUpdateTitle}
        setSelectedItemForUpdate={setSelectedItemForUpdate}
        setEditItemNameModalVisible={setEditItemNameModalVisible}
      />
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fetchData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
    </div>
  );
}

export default Workout;
