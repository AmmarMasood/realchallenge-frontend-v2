import React, { forwardRef, useState, useContext, useEffect } from "react";
import FullScreenPlayerVideosBrowser from "./FullScreenPlayerVideosBrowser";
import { VideoSeekSlider } from "react-video-seek-slider";
import { Link } from "react-router-dom";
import "react-video-seek-slider/lib/ui-video-seek-slider.css";
import { PauseOutlined, LoadingOutlined } from "@ant-design/icons";
import PlayerAudioIcon from "../../assets/icons/player-audio-icon.svg";
import PlayerAudioMuteIcon from "../../assets/icons/player-audio-mute-icon.svg";
import PlayerChromeIcon from "../../assets/icons/chrome-tv-icon.svg";
import PlayerMusicIcon from "../../assets/icons/player-music-icon.svg";
import PlayerSmallFullscreenIcon from "../../assets/icons/player-fullscreen-small-icon.svg";
import SmPlayerAudioIcon from "../../assets/icons/sm-player-audio-icon.svg";
import SmPlayerAudioMuteIcon from "../../assets/icons/sm-player-audio-mute-icon.svg";
import SmPlayerChromeIcon from "../../assets/icons/sm-chrome-tv-icon.svg";
import SmPlayerMusicIcon from "../../assets/icons/sm-player-music-icon.svg";
import SmPlayerFullscreenIcon from "../../assets/icons/sm-player-fullscreen-icon.svg";
import {
  exerciseWorkoutTimeTrackContext,
  playerFullscreenContext,
  playerStateContext,
} from "../../contexts/PlayerState";
import screenfull from "screenfull";
import MusicPlayer from "./MusicPlayer";
import SkipLeftIcon from "../../assets/icons/player-play-left-icon.svg";
import SkipRightIcon from "../../assets/icons/player-play-right-icon.svg";
import PlayerPlayIcon from "../../assets/icons/player-play-icon.svg";
import PlayerPauseIcon from "../../assets/icons/player-pause-icon.svg";
import BackButton from "../../assets/icons/big-back-button.svg";
import useWindowDimensions from "../../helpers/useWindowDimensions";

const playerIconStyle = {
  // width: "24px",
  cursor: "pointer",
  marginRight: "10px",
};
const formatTime = (seconds) => {
  if (isNaN(seconds)) {
    return "00:00";
    // return "0 sec";
  }

  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
  // return `${Math.round(seconds)} sec`;
};

function PlayerControls(
  {
    playerRef,
    playerContainerRef,
    descriptionRef,
    exerciseTitle,
    exerciseLength,
    breakTime,
    musicList,
    exerciseSeconds,
    // for full screen player video browser
    resumeSecondsCounter,
    pauseSecondsCounter,
    workout,
    setExerciseForHelpModal,
    setOpenHelpModal,
    setCurrentExercise,
    currentExercise,
    moveToNextExercise,
    moveToPrevExercise,
    challengePageAddress,
    inCreation,
  },
  ref
) {
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
  const [fullscreen, setFullscreen] = useContext(playerFullscreenContext);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    console.log("lworkout", exerciseWorkoutTimeTrack);
  }, [exerciseWorkoutTimeTrack]);
  useEffect(() => {
    if (
      width === playerContainerRef.current.clientWidth &&
      height === playerContainerRef.current.clientHeight
    ) {
      setFullscreen(true);
      console.log("in full screen");
    } else {
      setFullscreen(false);
    }
  });
  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";
  // const currentTime = playerRef.current
  //   ? playerRef.current.getCurrentTime()
  //   : "0 sec";
  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : "00:00";
  // const duration = playerRef.current
  //   ? playerRef.current.getDuration()
  //   : "0 sec";
  const elapsedTime = formatTime(currentTime);
  const totalDuration = formatTime(duration);

  const onMute = () => {
    setPlayerState({ ...playerState, muted: !playerState.muted });
  };

  const onPlayPause = () => {
    setPlayerState({ ...playerState, playing: !playerState.playing });
  };

  const toggleFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false);
    } else {
      setFullscreen(true);
    }

    screenfull.toggle(playerContainerRef.current);
    console.log(screenfull.isFullscreen, playerContainerRef.current);
  };

  const onSeek = (e) => {
    setPlayerState({
      ...playerState,
      progress: { ...playerState.progress, played: parseFloat(e / 100) },
    });
    playerRef.current.seekTo(e / 100);
  };

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 15);
  };

  const handleFastforward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 15);
  };

  return (
    <div>
      <div className="controls-details" ref={descriptionRef}>
        <div className="controls-details-top-title font-paragraph-white">
          <span>{exerciseTitle}</span>
          {exerciseLength && (
            <span style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "26px", marginRight: "5px" }}>
                {exerciseLength || Math.round(exerciseSeconds)}
              </span>
              Sec
            </span>
          )}
        </div>
        {console.log(workout, currentExercise)}
        <div className="controls-details-bottom-title font-paragraph-white">
          {breakTime && (
            <span>
              Up next: Rest
              <span style={{ fontSize: "26px", margin: "0 5px" }}>
                {breakTime}
              </span>
              sec
            </span>
          )}
        </div>
      </div>
      <div className="controls-wrapper" ref={ref}>
        {fullscreen && (
          <FullScreenPlayerVideosBrowser
            showVideos={true}
            workout={workout}
            setExerciseForHelpModal={setExerciseForHelpModal}
            setOpenHelpModal={setOpenHelpModal}
            setCurrentExercise={setCurrentExercise}
            currentExercise={currentExercise}
          />
        )}
        <div>
          <MusicPlayer
            musicList={musicList}
            setMusicPlayerVisible={setMusicPlayerVisible}
            visible={musicPlayerVisible}
          />
        </div>

        <div className="controls-wrapper-top">
          <div>
            {(fullscreen || width <= 768) && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  to={challengePageAddress}
                  style={{
                    color: "#ff7700",
                    alignSelf: "flex-start",
                    marginTop: "10px",
                  }}
                >
                  <img
                    src={BackButton}
                    alt="back-button"
                    className="player-back-button"
                  />
                </Link>
                <div className="player-back-text">
                  <span className="font-heading-white">{workout.title}</span>
                  <span className="font-paragraph-white">
                    {workout.subtitle}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="player-top-icons">
            {fullscreen ? (
              <>
                {playerState.muted ? (
                  <img
                    src={PlayerAudioMuteIcon}
                    alt="player-audio-icon"
                    style={playerIconStyle}
                    onClick={onMute}
                  />
                ) : (
                  <img
                    onClick={onMute}
                    src={PlayerAudioIcon}
                    alt="player-audio-icon"
                    style={playerIconStyle}
                  />
                )}
                <img
                  src={PlayerChromeIcon}
                  alt="player-chrome-icon"
                  style={playerIconStyle}
                />
                <img
                  src={PlayerMusicIcon}
                  onClick={() => setMusicPlayerVisible(!musicPlayerVisible)}
                  alt="player-music-icon"
                  style={playerIconStyle}
                />
                <img
                  src={PlayerSmallFullscreenIcon}
                  alt="player-fullscreen-icon"
                  style={playerIconStyle}
                  onClick={toggleFullscreen}
                />
              </>
            ) : (
              <>
                {playerState.muted ? (
                  <img
                    src={SmPlayerAudioMuteIcon}
                    alt="player-audio-icon"
                    style={playerIconStyle}
                    onClick={onMute}
                  />
                ) : (
                  <img
                    onClick={onMute}
                    src={SmPlayerAudioIcon}
                    alt="player-audio-icon"
                    style={playerIconStyle}
                  />
                )}
                <img
                  src={SmPlayerChromeIcon}
                  alt="player-chrome-icon"
                  style={playerIconStyle}
                />
                <img
                  src={SmPlayerMusicIcon}
                  onClick={() => setMusicPlayerVisible(!musicPlayerVisible)}
                  alt="player-music-icon"
                  style={playerIconStyle}
                />
                {!inCreation && (
                  <img
                    src={SmPlayerFullscreenIcon}
                    alt="player-fullscreen-icon"
                    style={playerIconStyle}
                    onClick={toggleFullscreen}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* middle controls */}
        {playerState.loading ? (
          <span
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingOutlined
              style={{
                color: "var(--color-orange)",
              }}
              className="middle-player-icons"
            />
          </span>
        ) : (
          <div className="controls-wrapper-middle">
            <span className="controls-wrapper-middle-icons"></span>

            <span className="controls-wrapper-middle-icons"></span>
          </div>
        )}

        {!workout.renderWorkout ? (
          <>
            <div
              className="controls-wrapper-bottom"
              style={{ position: "relative" }}
            >
              <span className="font-paragraph-white player-elasped-time-container">
                {elapsedTime}
              </span>
              <div>
                <img
                  src={SkipLeftIcon}
                  alt="skip-left-icon"
                  style={{ cursor: "pointer" }}
                  onClick={handleRewind}
                />
                <span className="font-paragraph-white">15</span>
                {playerState.playing ? (
                  // PlayerPauseIcon
                  <img
                    src={PlayerPauseIcon}
                    alt="skip-left-icon"
                    style={{ cursor: "pointer", margin: "0 20px 0 35px" }}
                    className="controls-wrapper-bottom-icons"
                    onClick={onPlayPause}
                  />
                ) : (
                  <img
                    src={PlayerPlayIcon}
                    alt="skip-left-icon"
                    style={{ cursor: "pointer", margin: "0 20px 0 35px" }}
                    className="controls-wrapper-bottom-icons"
                    onClick={onPlayPause}
                  />
                )}
                <span className="font-paragraph-white">15</span>
                <img
                  src={SkipRightIcon}
                  alt="skip-left-icon"
                  style={{ cursor: "pointer" }}
                  onClick={handleFastforward}
                />
              </div>
              <span
                className="font-paragraph-white player-elasped-time-container"
                style={{ textAlign: "right" }}
              >
                {totalDuration}
              </span>
            </div>
            <div style={{ margin: "0 30px 0 35px", paddingBottom: "20px" }}>
              <VideoSeekSlider
                max={100}
                currentTime={playerState.progress.played * 100}
                progress={playerState.progress.loaded * 100}
                onChange={onSeek}
                offset={0}
                limitTimeTooltipBySides={true}
                hideSeekTimes={false}
                secondsPrefix="00:00:"
                minutesPrefix="00:"
                tipFormatter={(v) => `${elapsedTime}`}
              />
            </div>
          </>
        ) : (
          <>
            <div
              className="controls-wrapper-bottom"
              style={{ position: "relative" }}
            >
              <span className="font-paragraph-white player-elasped-time-container">
                {/* {elapsedTime} */}
                {formatTime(exerciseWorkoutTimeTrack.current)}
              </span>
              <div>
                <img
                  src={SkipLeftIcon}
                  alt="skip-left-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (currentExercise && currentExercise.index !== 0) {
                      const s =
                        parseInt(exerciseLength) - parseInt(exerciseSeconds);
                      // console.log("exerciseSeconds",totalDurationTimer,s, parseInt(workout.exercises[currentExercise.index - 1].exerciseLength))
                      // setTotalDurationTimer(totalDurationTimer - s - parseInt(workout.exercises[currentExercise.index - 1].exerciseLength));
                      moveToPrevExercise();
                    }
                  }}
                />
                {/* PlayerPlayIcon */}
                {playerState.playing ? (
                  <img
                    src={PlayerPauseIcon}
                    alt="skip-left-icon"
                    style={{ cursor: "pointer", margin: "0 30px 0 30px" }}
                    className="controls-wrapper-bottom-icons"
                    onClick={onPlayPause}
                  />
                ) : (
                  <img
                    src={PlayerPlayIcon}
                    alt="skip-left-icon"
                    style={{ cursor: "pointer", margin: "0 25px 0 35px" }}
                    className="controls-wrapper-bottom-icons"
                    onClick={onPlayPause}
                  />
                )}
                <img
                  src={SkipRightIcon}
                  alt="skip-left-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (
                      currentExercise &&
                      currentExercise.index !== workout.exercises.length - 1
                    ) {
                      // const s = parseInt(exerciseLength);
                      // console.log("exerciseSeconds",totalDurationTimer,s)
                      // setTotalDurationTimer(totalDurationTimer + s);
                      moveToNextExercise();
                    }
                  }}
                />
              </div>
              <span
                className="font-paragraph-white player-elasped-time-container"
                style={{ textAlign: "right" }}
              >
                {/* {totalDuration} */}
                {formatTime(exerciseWorkoutTimeTrack.total)}
              </span>
            </div>
            <div
              className="react-player-stepper-container"
              style={{
                gridTemplateColumns: `repeat(${
                  workout && workout.exercises.length
                }, 1fr)`,
              }}
            >
              {workout &&
                workout.exercises.map((j, i) => (
                  <div
                    className="react-player-stepper"
                    style={{
                      background:
                        currentExercise &&
                        currentExercise.index === i &&
                        currentExercise.index !== -1
                          ? "#fff"
                          : "#FB7600",
                    }}
                  ></div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default forwardRef(PlayerControls);
