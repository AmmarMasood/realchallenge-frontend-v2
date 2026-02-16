import React, { useContext, useRef } from "react";
import "../../assets/video-player-design.css";
import "../../assets/player.css";
import ReactPlayer from "react-player";
import PlayerControls from "./PlayerControls";
import { playBreakStart } from "../../utils/audioHelper";
import { playerStateContext } from "../../contexts/PlayerState";

var count = 0;
function NonRenderedVideoPlayer({
  exercise,
  musics,
  moveToNextExercise,
  moveToPrevExercise,
  // for full screen player video browser
  workout,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
  challengePageAddress,
}) {
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleProgress = (changeState) => {
    if (
      playerState.progress.loadedSeconds === playerState.progress.playedSeconds
    ) {
      setPlayerState({ ...playerState, loading: true });
      // setPlayerState({ ...playerState, playing: false });
    } else {
      setPlayerState({ ...playerState, loading: false });
      // setPlayerState({ ...playerState, playing: true });
    }
    if (count > 1) {
      controlsRef.current.style.visibility = "hidden";
      descriptionRef.current.style.visibility = "visible";
      count = 0;
    }
    if (controlsRef.current.style.visibility === "visible") {
      count += 1;
    }
    setPlayerState({ ...playerState, progress: changeState });
  };

  const handleMouseMove = () => {
    controlsRef.current.style.visibility = "visible";
    descriptionRef.current.style.visibility = "hidden";
    count = 0;
  };

  return (
    <div
      className="player-wrapper"
      style={{ position: "relative" }}
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
    >
      <ReactPlayer
        ref={playerRef}
        className="react-player"
        playing={playerState.playing}
        muted={playerState.muted}
        volume={playerState.volume}
        url={exercise?.videoURL ? `${exercise.videoURL}` : ""}
        progress={playerState.progress}
        onProgress={handleProgress}
        width="100%"
        height="100%"
        controls={false}
        onEnded={() => {
          // this will not work when the video is on loop, because onEnded doesnt work on videos that are looping.
          playBreakStart();
          if (workout.exercises[currentExercise.index + 1]) {
            // this was how it was originall
            setPlayerState({ ...playerState, playing: false });
            // setTimerVisible(true);
            // these are new stuff
            // setPlayerState({ ...playerState, playing: false });
            moveToNextExercise();
            // setTimerVisible(true);
          } else {
            moveToNextExercise();
            // setPlayerState({ ...playerState, playing: true });
          }
        }}
      />
      {console.log("teging", exercise)}
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
        // for full screen player video browser
        workout={workout}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        moveToNextExercise={moveToNextExercise}
        moveToPrevExercise={moveToPrevExercise}
      />

      <div></div>
    </div>
  );
}

export default NonRenderedVideoPlayer;
