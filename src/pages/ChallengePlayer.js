import React, { useState, useContext, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import "../assets/challengePlayer.css";
import Player from "../components/Player/Player";
import HelpPopupPlayer from "../components/Player/HelpPopupPlayer";

import {
  playerStateContext,
  exerciseWorkoutTimeTrackContext,
} from "../contexts/PlayerState";
import PlayerVideoBrowser from "../components/Player/PlayerVideoBrowser";
import { withRouter } from "react-router-dom";
// import BreakTimer from "../components/Player/BreakTimer";

import {
  getMusicByChallengeId,
  getWorkoutById,
} from "../services/createChallenge/main";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import {
  getChallengeProgress,
  getUserProfileInfo,
  saveChallengeProgress,
} from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import { checkUser } from "../services/authentication";
import BackButton from "../assets/icons/Back-button.png";
import FileIcon from "../assets/icons/file-icon.png";
import DumbbellIcon from "../assets/icons/Dumbell-icon.png";
import ShopIcon from "../assets/icons/shoppingbag-icon.png";
import useWindowDimensions from "../helpers/useWindowDimensions";
import WorkoutCompleteModal from "../components/Challenge/WorkoutCompleteModal";
import { T } from "../components/Translate";

function ChallengePlayer(props) {
  // for non-rendered workouts

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState({});
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [customerDetails, setCustomerDetails] = useState("");
  const [currentExercise, setCurrentExercise] = useState({
    exercise: {},
    index: 0,
    completed: 0,
  });
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const [exerciseForHelpModal, setExerciseForHelpModal] = useState({});
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [finishWorkoutPopupVisible, setFinishWorkoutPopupVisible] =
    useState(false);
  const [musics, setMusics] = useState([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(null);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    checkUser(
      userInfo,
      setUserInfo,
      localStorage.getItem("jwtToken"),
      props.history
    );
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const workoutId = props.match.params.workoutId;
    const challengeId = props.match.params.challengeId;
    // console.log(challengeId);
    let res = await getWorkoutById(workoutId);
    // getting challenge progress start:
    let challengeProgress = await getChallengeProgress(challengeId);
    if (challengeProgress.data) {
      setChallengeProgress(challengeProgress.data);
    }
    console.log("challengeProgress", challengeProgress);
    console.log("workout", res);
    const resExercises =
      res && res.isRendered
        ? res.exercises.map((e) => ({
            break: e.break,
            createdAt: e.exerciseId.createdAt,
            exerciseGroupName: e.groupName,
            exerciseLength: e.exerciseLength,
            title: e.exerciseId.title,
            videoURL: e.exerciseId.videoURL,
            voiceOverLink: e.exerciseId.voiceOverLink,
            _id: e.exerciseId._id,
          }))
        : res.exercises.map((e) => ({
            title: e.renderedWorkoutExerciseName,
            videoURL: e.renderedWorkoutExerciseVideo,
            _id: e._id,
          }));
    res.exercises = resExercises;
    console.log("ressssssss", res);
    res &&
      res.introVideoLink &&
      res.exercises.unshift({
        break: 5,
        createdAt: "",
        exerciseGroupName: "Introduction",
        exerciseLength: res.introVideoLength,
        title: "Introduction to workout",
        videoURL: res.introVideoLink,
        voiceOverLink: "",
        _id: v4(),
      });

    const musics = await getMusicByChallengeId(challengeId);
    const cd = await getUserProfileInfo(userInfo.id);

    if (musics) {
      setMusics(musics.music);
    }
    if (cd) {
      setCustomerDetails(cd);
    }

    setWorkout(res);
    setCurrentExercise({
      exercise: res.exercises[0],
      index: 0,
      completed: 0,
    });
    setLoading(false);

    console.log("resss", res);
    console.log("customer details", customerDetails);
  };

  const updateTrackChallengeInBackend = async (
    exercise,
    completeionRate,
    workoutCompleted
  ) => {
    const cId = props.match.params.challengeId;
    const wId = props.match.params.workoutId;
    if (!workoutCompleted) {
      const p = {
        currentWorkout: wId,
        currentExercise: exercise._id,
        challenge: cId,
        completedWorkouts: challengeProgress
          ? challengeProgress.completedWorkouts
          : [],
        currentWorkoutCompletionRate: completeionRate,
        challengeCompleted: false,
        challengeReview: challengeProgress
          ? challengeProgress.challengeReview
          : undefined,
        challengePointGained: challengeProgress?.challengePointGained,
      };
      setSavingProgress(true);
      await saveChallengeProgress(p, userInfo.id);
      setSavingProgress(false);
    } else {
      const p = {
        currentWorkout: null,
        currentExercise: null,
        challenge: cId,
        completedWorkouts: challengeProgress
          ? challengeProgress.completedWorkouts.includes(wId)
            ? [...challengeProgress.completedWorkouts]
            : [...challengeProgress.completedWorkouts, wId]
          : [wId],
        currentWorkoutCompletionRate: 0,
        challengeCompleted: false,
        challengeReview: challengeProgress
          ? challengeProgress.challengeReview
          : undefined,
        challengePointGained: challengeProgress?.challengePointGained,
      };
      setSavingProgress(true);
      await saveChallengeProgress(p, userInfo.id);
      setSavingProgress(false);
    }
  };

  const updateExerciseWorkoutTimer = (type, index) => {
    if (type === "next") {
      const allExercisesBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workout.exercises
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
      const allExercisesBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workout.exercises
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
    if (workout.exercises[currentExercise.index + 1]) {
      // console.log("dasdsa", currentExercise);
      const completeionRate = Math.round(
        ((currentExercise.index + 1) / (workout.exercises.length - 1)) * 100
      );
      setCurrentExercise({
        exercise: workout.exercises[currentExercise.index + 1],
        index: currentExercise.index + 1,
        completed: completeionRate,
      });
      updateTrackChallengeInBackend(
        workout.exercises[currentExercise.index + 1],
        completeionRate,
        false
      );
      updateExerciseWorkoutTimer("next", currentExercise.index + 1);
      // setPlayerState({ ...playerState, playing: false });
      return;
    } else {
      setPlayerState({ ...playerState, playing: false });
      setCurrentExercise({
        exercise: currentExercise.exercise,
        index: -1,
        completed: 100,
      });
      setFinishWorkoutPopupVisible(true);
      updateTrackChallengeInBackend(
        workout.exercises[currentExercise.index + 1],
        0,
        true
      );
      localStorage.removeItem("music-playing");
    }
  };

  const moveToPrevExercise = (playerProgress) => {
    if (workout.exercises[currentExercise.index - 1]) {
      // console.log("dasdsa", currentExercise);
      const completeionRate = Math.round(
        ((currentExercise.index - 1) / (workout.exercises.length - 1)) * 100
      );
      setCurrentExercise({
        exercise: workout.exercises[currentExercise.index - 1],
        index: currentExercise.index - 1,
        completed: completeionRate,
      });
      workout.exercises[currentExercise.index - 2] &&
        updateTrackChallengeInBackend(
          workout.exercises[currentExercise.index - 1],
          completeionRate,
          false
        );
      updateExerciseWorkoutTimer("prev", currentExercise.index - 1);
      // setPlayerState({ ...playerState, playing: true });
      return;
    } else {
      alert("nothing on backside");
    }
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

  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div className="challenge-player-container">
      {/* open help modal */}
      {openHelpModal && (
        <HelpPopupPlayer
          open={openHelpModal}
          onCancel={handleCloseExerciseForHelp}
          setOpen={setOpenHelpModal}
          exercise={exerciseForHelpModal}
        />
      )}

      <div className="fullplayer-container">
        {width > 768 && (
          <div
            className="challenge-player-container-exercies challenge-player-container-nav"
            style={{ marginTop: "0" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link
                to={`/challenge/${props.match.params.challengeName}/${props.match.params.challengeId}`}
                style={{
                  color: "#ff7700",
                  // alignSelf: "flex-start",
                  // marginTop: "10px",
                }}
              >
                <img
                  src={BackButton}
                  alt="back-button"
                  style={{
                    cursor: "pointer",
                    marginRight: "20px",
                    height: "30px",
                  }}
                />
              </Link>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  className="font-heading-white"
                  style={{ fontSize: "25px" }}
                >
                  {workout.title}
                </span>
                <span className="font-paragraph-white">{workout.subtitle}</span>
              </div>
            </div>
            {savingProgress && (
              <LoadingOutlined
                style={{
                  fontSize: "30px",
                  color: "#ff7700",
                  marginRight: "20px",
                }}
              />
            )}
          </div>
        )}

        <Player
          moveToNextExercise={moveToNextExercise}
          moveToPrevExercise={moveToPrevExercise}
          // musics={workout.musics}
          nextExerciseTitle={
            workout.exercises && workout.exercises[currentExercise.index + 1]
              ? workout.exercises[currentExercise.index + 1].title
              : ""
          }
          musics={musics}
          exercise={currentExercise.exercise}
          challengePageAddress={`/challenge/${props.match.params.challengeName}/${props.match.params.challengeId}`}
          // key={currentExercise.exercise._id}
          // for full screen player video browser
          workout={workout}
          setExerciseForHelpModal={setExerciseForHelpModal}
          setOpenHelpModal={setOpenHelpModal}
          setCurrentExercise={setCurrentExercise}
          currentExercise={currentExercise}
        />

        <PlayerVideoBrowser
          workout={workout}
          playerState={playerState}
          setPlayerState={setPlayerState}
          setExerciseForHelpModal={setExerciseForHelpModal}
          setOpenHelpModal={setOpenHelpModal}
          setCurrentExercise={setCurrentExercise}
          currentExercise={currentExercise}
        />

        <div className="player-download-stuff">
          {workout.infoFile ? (
            <div className="workout-info">
              <p
                className="font-paragraph-white"
                style={{
                  color: "#555A61",
                  fontWeight: "500",
                  textTransform: "uppercase",
                }}
              >
                <T>player.today_woTkout_attachment</T>
              </p>

              <a
                href={`${process.env.REACT_APP_SERVER}/uploads/${workout.infoFile}`}
                target="_blank"
                download
              >
                <button className="challenge-player-attachment font-paragraph-white">
                  <img src={FileIcon} alt="" style={{ marginRight: "10px" }} />
                  {workout.infoTitle ? workout.infoTitle : "Attachment"}
                </button>
              </a>
            </div>
          ) : (
            ""
          )}
          {workout.relatedEquipments &&
            workout.relatedEquipments.length > 0 && (
              <div className="workout-info">
                <p
                  className="font-paragraph-white"
                  style={{
                    color: "#555A61",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  <T>playerTtoday_equipment</T>
                </p>
                <div>
                  {workout.relatedEquipments.map((e) => (
                    <button
                      key={e._id}
                      className="challenge-player-attachment font-paragraph-white"
                    >
                      <img
                        src={DumbbellIcon}
                        alt=""
                        style={{ marginRight: "10px" }}
                      />
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          {workout.relatedProducts && workout.relatedProducts.length > 0 && (
            <div className="workout-info">
              <p
                className="font-paragraph-white"
                style={{
                  color: "#555A61",
                  fontWeight: "500",
                  textTransform: "uppercase",
                }}
              >
                <T>player.related</T>
              </p>
              <div>
                {workout.relatedProducts.map((e) => (
                  <button
                    key={e._id}
                    className="challenge-player-attachment font-paragraph-white"
                  >
                    <img
                      src={ShopIcon}
                      alt=""
                      style={{ marginRight: "10px" }}
                    />
                    {e.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <WorkoutCompleteModal
            finishWorkoutPopupVisible={finishWorkoutPopupVisible}
            setFinishWorkoutPopupVisible={setFinishWorkoutPopupVisible}
            challengeId={props.match.params.challengeId}
            challengeSlug={props.match.params.challengeName}
            history={props.history}
          />

          {/* <div className="buy-related-products">
          <p className="font-heading-white">Related Products</p>
          {workout.relatedProducts.map((p) => (
            <div className="buy-related-products-p font-paragraph-white">
              {p.name}
            </div>
          ))}
          <button className="green-button font-paragraph-white">
            Buy Products
          </button>
        </div> */}
        </div>
      </div>
    </div>
  );
}

export default withRouter(ChallengePlayer);
