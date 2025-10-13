import React, { useContext, useRef, useEffect, useState } from "react";
import "../../assets/video-player-design.css";
import "../../assets/player.css";
import ReactPlayer from "react-player";
import BreakTimer from "./BreakTimer";
import PlayerControls from "./PlayerControls";
import tune from "../../assets/music/break-start.wav";
import {
  breakContext,
  exerciseWorkoutTimeTrackContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";

var count = 0;

const playAudio = () => {
  new Audio(tune).play();
};

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
    }
  }, [exercise]);

  useEffect(() => {
    if (exerciseSeconds === 0 && !hasHandledEnd.current) {
      hasHandledEnd.current = true;
      if (!inCreation) {
        playAudio();
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

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    descriptionRef.current.style.visibility = "hidden";
    count = 0;
  };

  // Show timer if timerVisible is true and current exercise exists
  const shouldShowTimer =
    timerVisible &&
    workout?.exercises &&
    currentExercise.index >= 0 &&
    workout.exercises[currentExercise.index];

  // Check if current exercise is the last one
  const isLastExercise = workout?.exercises && currentExercise.index === workout.exercises.length - 1;

  // Get next exercise for preloading during break
  const nextExercise = workout?.exercises && currentExercise.index >= 0 && currentExercise.index < workout.exercises.length - 1
    ? workout.exercises[currentExercise.index + 1]
    : null;

  // During break timer, preload next exercise video if it exists
  const videoUrlToLoad = shouldShowTimer && nextExercise
    ? (nextExercise.videoURL || "")
    : (exercise?.videoURL || "");

  return (
    <div
      className="player-wrapper"
      style={{
        position: "relative",
        minHeight: "450px",
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

      {shouldShowTimer && !inCreation && (
        <BreakTimer
          moveToNextExercise={moveToNextExercise}
          nextExerciseTitle={nextExerciseTitle}
          exercise={workout.exercises[currentExercise.index]}
          timerVisible={timerVisible}
          setTimerVisible={setTimerVisible}
          isLastExercise={isLastExercise}
          onWorkoutComplete={onWorkoutComplete}
        />
      )}

      <div></div>
    </div>
  );
}

export default RenderedVideoPlayer;
