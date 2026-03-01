import React, { useContext, useRef, useEffect, useState } from "react";
import "../../assets/video-player-design.css";
import "../../assets/player.css";
import ReactPlayer from "react-player";
import BreakTimer from "./BreakTimer";
import PlayerControls from "./PlayerControls";
import { playBreakStart, unlockAudio } from "../../utils/audioHelper";
import PlayerPlayIcon from "../../assets/icons/player-play-icon.svg";
import { T } from "../Translate";
import {
  breakContext,
  exerciseWorkoutTimeTrackContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";

var count = 0;

function RenderedVideoPlayer({
  exercise,
  musics,
  moveToNextExercise,
  moveToPrevExercise,
  nextExerciseTitle,
  completed,
  // for full screen player video browser
  workout,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
  challengePageAddress,
  inCreation,
  onWorkoutComplete,
}) {
  const [timerVisible, setTimerVisible] = useContext(timerVisibleContext);
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [currentBreak, setCurrentBreak] = useContext(breakContext);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const [exerciseSeconds, setExerciseSeconds] = useState(-1);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [waitingForTap, setWaitingForTap] = useState(true);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const descriptionRef = useRef(null);
  const hasHandledEnd = useRef(false);

  useEffect(() => {
    if (workout) {
      const sumAllBreakTime = workout.exercises?.reduce(
        (a, b) => a + (b["break"] || 0),
        0
      );
      const sumAllExerciseDuration = workout.exercises?.reduce(
        (a, b) => a + (parseInt(b["exerciseLength"]) || 0),
        0
      );
      const d = sumAllExerciseDuration + sumAllBreakTime;
      setExerciseWorkoutTimeTrack((prev) => ({ ...prev, total: d }));
    }
  }, [workout]);

  useEffect(() => {
    if (exercise) {
      if (exercise.exerciseLength) {
        setExerciseSeconds(parseInt(exercise.exerciseLength));
      } else if (playerRef.current && playerRef.current.getDuration) {
        setExerciseSeconds(Math.round(playerRef.current.getDuration()));
      }

      // Reset video to beginning when exercise changes
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(0);
      }

      // Show start countdown on first load, reset timer on subsequent exercise changes
      if (!workoutStarted && !inCreation) {
        setTimerVisible(true);
      } else {
        setTimerVisible(false);
      }
      hasHandledEnd.current = false;
    }
  }, [exercise]);

  useEffect(() => {
    if (exerciseSeconds === 0 && !hasHandledEnd.current) {
      hasHandledEnd.current = true;
      if (!inCreation) {
        playBreakStart();
      }

      // Get current exercise data
      const currentExerciseData = workout?.exercises?.[currentExercise.index];
      const isCurrentlyLastExercise = workout?.exercises && currentExercise.index === workout.exercises.length - 1;
      
      // Show break timer if current exercise has break > 0
      if (currentExerciseData && currentExerciseData.break > 0) {
        setPlayerState((prev) => ({ ...prev, playing: false }));
        setTimeout(() => {
          setTimerVisible(true);
        }, 500);
      } else {
        // No break time
        if (isCurrentlyLastExercise && onWorkoutComplete) {
          // Last exercise with no break - update progress first, then show success popup
          setPlayerState((prev) => ({ ...prev, playing: false }));
          moveToNextExercise(); // This updates backend progress
          setTimeout(() => {
            onWorkoutComplete();
          }, 100);
        } else {
          // Move to next exercise
          moveToNextExercise();
        }
      }
    }

    // reset the flag if we're in a new exercise
    if (exerciseSeconds > 0 && hasHandledEnd.current) {
      hasHandledEnd.current = false;
    }
  }, [exerciseSeconds]);


  const handleProgress = (changeState) => {
    if (count > 1) {
      controlsRef.current.style.visibility = "hidden";
      descriptionRef.current.style.visibility = "visible";
      count = 0;
    }
    if (controlsRef.current.style.visibility === "visible") {
      count += 1;
    }

    if (exerciseSeconds > 0 && playerState.playing && !playerState.loading) {
      setExerciseSeconds(exerciseSeconds - 1);
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current: prev.current + 1,
      }));
    }

    setPlayerState((prev) => ({ ...prev, progress: changeState }));
  };

  const hideTimeoutRef = useRef(null);

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    descriptionRef.current.style.visibility = "hidden";
    count = 0;

    // Auto-hide after 3 seconds of no interaction
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.style.visibility = "hidden";
        descriptionRef.current.style.visibility = "visible";
      }
    }, 3000);
  };

  // Show timer if timerVisible is true and current exercise exists
  const shouldShowTimer =
    timerVisible &&
    workout?.exercises &&
    currentExercise.index >= 0 &&
    !!workout.exercises[currentExercise.index];

  // Check if current exercise is the last one
  const isLastExercise = workout?.exercises && currentExercise.index === workout.exercises.length - 1;

  // Get next exercise for preloading during break
  const nextExercise = workout?.exercises && currentExercise.index >= 0 && currentExercise.index < workout.exercises.length - 1
    ? workout.exercises[currentExercise.index + 1]
    : null;

  // During break timer, preload next exercise video (but not during start countdown)
  const videoUrlToLoad = shouldShowTimer && workoutStarted && nextExercise
    ? (nextExercise.videoURL || "")
    : (exercise?.videoURL || "");

  return (
    <div
      className="player-wrapper"
      style={{
        position: "relative",
      }}
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
    >
      <ReactPlayer
        key={`${exercise?.id || 'default'}-${currentExercise.index}`}
        ref={playerRef}
        className="react-player"
        onBuffer={() => {
          setPlayerState((prev) => ({ ...prev, loading: true }));
        }}
        onBufferEnd={() => {
          setPlayerState((prev) => ({ ...prev, loading: false }));
        }}
        playing={playerState.playing}
        muted={playerState.muted}
        loop={true}
        volume={playerState.volume}
        url={videoUrlToLoad}
        progress={playerState.progress}
        onProgress={handleProgress}
        width="100%"
        height="100%"
        controls={false}
      />

      <PlayerControls
        ref={controlsRef}
        descriptionRef={descriptionRef}
        playerRef={playerRef}
        exerciseTitle={exercise?.title ? exercise.title : ""}
        exerciseLength={exercise?.exerciseLength ? exercise.exerciseLength : ""}
        breakTime={exercise?.break ? exercise.break : ""}
        playerContainerRef={playerContainerRef}
        musicList={musics}
        challengePageAddress={challengePageAddress}
        exerciseSeconds={exerciseSeconds}
        // for full screen player video browser
        workout={workout}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        moveToNextExercise={moveToNextExercise}
        moveToPrevExercise={moveToPrevExercise}
        inCreation={inCreation}
      />

      {shouldShowTimer && !inCreation && !workoutStarted && waitingForTap && (
        <div
          className="break-layout-for-player"
          onClick={() => { unlockAudio(); setWaitingForTap(false); }}
          style={{ cursor: "pointer", justifyContent: "center", alignItems: "center" }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}>
            <img
              src={PlayerPlayIcon}
              alt="Start"
              style={{ width: "80px", height: "80px", transition: "transform 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>
              <T>player.start_exercise</T>
            </span>
          </div>
        </div>
      )}

      {shouldShowTimer && !inCreation && !workoutStarted && !waitingForTap && (
        <BreakTimer
          moveToNextExercise={() => setWorkoutStarted(true)}
          nextExerciseTitle={exercise?.title || ""}
          exercise={{ break: 5, exerciseGroupName: "Get Ready" }}
          timerVisible={timerVisible}
          setTimerVisible={setTimerVisible}
          isLastExercise={false}
          isFirstExercise={currentExercise.index === 0}
        />
      )}

      {shouldShowTimer && !inCreation && workoutStarted && (
        <BreakTimer
          moveToNextExercise={moveToNextExercise}
          nextExerciseTitle={nextExerciseTitle}
          exercise={workout.exercises[currentExercise.index]}
          timerVisible={timerVisible}
          setTimerVisible={setTimerVisible}
          isLastExercise={isLastExercise}
          onWorkoutComplete={onWorkoutComplete}
          isFirstExercise={false}
        />
      )}

      <div></div>
    </div>
  );
}

export default RenderedVideoPlayer;
