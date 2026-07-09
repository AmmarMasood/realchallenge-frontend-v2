import React, { useContext, useEffect, useRef } from "react";
import "../../assets/video-player-design.css";
import "../../assets/player.css";
import ReactPlayer from "react-player";
import PlayerControls from "./PlayerControls";
import { playerStateContext } from "../../contexts/PlayerState";

/* Player for the audio workout type (meditation / breathing / mindset).
 * Structured like NonRenderedVideoPlayer: the track plays natively to its
 * end (duration = the audio file), onEnded advances/completes through the
 * same flow as the other players. The ReactPlayer instance is invisible —
 * it only drives the audio — while a static photo or a muted looping video
 * (workout.backgroundImageLink / backgroundVideoLink) fills the screen.
 * No background music here: musicList is always empty — the audio track is
 * the only sound (client-confirmed). */

var count = 0;

function AudioWorkoutPlayer({
  exercise,
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
  const bgVideoRef = useRef(null);

  // Freeze the looping background video together with the audio: pausing
  // the session should still the whole screen, not leave the visual moving.
  useEffect(() => {
    const bgVideo = bgVideoRef.current;
    if (!bgVideo) return;
    if (playerState.playing) {
      const p = bgVideo.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      bgVideo.pause();
    }
  }, [playerState.playing]);

  const visualStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const handleProgress = (changeState) => {
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
      {/* Background visual: muted looping video, static photo, or plain dark */}
      {workout.backgroundVideoLink ? (
        <video
          ref={bgVideoRef}
          src={workout.backgroundVideoLink}
          muted
          loop
          autoPlay
          playsInline
          style={visualStyle}
        />
      ) : workout.backgroundImageLink ? (
        <img src={workout.backgroundImageLink} alt="" style={visualStyle} />
      ) : (
        <div style={{ ...visualStyle, backgroundColor: "#171e27" }} />
      )}

      {/* Invisible audio engine */}
      <ReactPlayer
        ref={playerRef}
        playing={playerState.playing}
        muted={playerState.muted}
        volume={playerState.volume}
        url={exercise?.videoURL ? `${exercise.videoURL}` : ""}
        progress={playerState.progress}
        onProgress={handleProgress}
        width="0%"
        height="0%"
        style={{ display: "none" }}
        controls={false}
        onEnded={() => {
          setPlayerState({ ...playerState, playing: false });
          moveToNextExercise();
        }}
      />

      <PlayerControls
        ref={controlsRef}
        descriptionRef={descriptionRef}
        playerRef={playerRef}
        exerciseTitle={exercise?.title ? exercise.title : ""}
        exerciseLength={exercise?.exerciseLength ? exercise.exerciseLength : ""}
        breakTime={exercise?.break ? exercise.break : ""}
        playerContainerRef={playerContainerRef}
        musicList={[]}
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
    </div>
  );
}

export default AudioWorkoutPlayer;
