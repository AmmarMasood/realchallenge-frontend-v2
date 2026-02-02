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

  // Chromecast states
  const [castAvailable, setCastAvailable] = useState(false);
  const [castConnected, setCastConnected] = useState(false);
  const [castSession, setCastSession] = useState(null);

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

  // Initialize Chromecast
  useEffect(() => {
    const initializeCast = () => {
      try {
        // Check all required Cast SDK components are available
        if (!window.cast?.framework?.CastContext) {
          console.log("Cast framework not fully loaded yet");
          return false;
        }

        const context = window.cast.framework.CastContext.getInstance();

        // Use safe defaults - don't rely on chrome.cast being available
        const options = {
          receiverApplicationId: "CC1AD845", // Default Media Receiver
          autoJoinPolicy: "origin_scoped",
        };

        // Only use chrome.cast values if they're fully available
        if (window.chrome?.cast?.media?.DEFAULT_MEDIA_RECEIVER_APP_ID) {
          options.receiverApplicationId = window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        }
        if (window.chrome?.cast?.AutoJoinPolicy?.ORIGIN_SCOPED) {
          options.autoJoinPolicy = window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
        }

        context.setOptions(options);

        // Listen for cast availability
        context.addEventListener(
          window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
          (event) => {
            setCastAvailable(
              event.castState !==
                window.cast.framework.CastState.NO_DEVICES_AVAILABLE
            );
          }
        );

        // Listen for session changes
        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            const session = context.getCurrentSession();
            setCastSession(session);
            setCastConnected(!!session);
          }
        );

        return true;
      } catch (error) {
        console.warn("Failed to initialize Cast:", error);
        return false;
      }
    };

    // Wait for Cast SDK to load with timeout
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const checkCastSDK = setInterval(() => {
      attempts++;
      if (initializeCast() || attempts >= maxAttempts) {
        clearInterval(checkCastSDK);
        if (attempts >= maxAttempts) {
          console.log("Cast SDK not available, skipping initialization");
        }
      }
    }, 100);

    return () => clearInterval(checkCastSDK);
  }, []);
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

  // Chromecast functions
  const startCasting = () => {
    if (
      !castAvailable ||
      !workout?.exercises ||
      !currentExercise?.exercise?.videoURL
    ) {
      console.warn("Cast not available or no video to cast");
      return;
    }

    const context = window.cast.framework.CastContext.getInstance();

    if (castConnected) {
      // Already connected, just load the current exercise
      loadCurrentExerciseOnCast();
    } else {
      // Request session
      context
        .requestSession()
        .then(() => {
          console.log("Cast session started");
          loadCurrentExerciseOnCast();
        })
        .catch((error) => {
          console.error("Error starting cast session:", error);
        });
    }
  };

  const loadCurrentExerciseOnCast = () => {
    if (!castSession || !currentExercise?.exercise?.videoURL) return;

    const mediaInfo = new window.chrome.cast.media.MediaInfo(
      currentExercise.exercise.videoURL,
      "video/mp4"
    );

    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title =
      currentExercise.exercise.title || `Exercise ${currentExercise.index + 1}`;
    mediaInfo.metadata.subtitle = workout.title || "";

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    request.currentTime = playerRef.current
      ? playerRef.current.getCurrentTime()
      : 0;
    request.autoplay = playerState.playing;

    castSession
      .loadMedia(request)
      .then(() => {
        console.log("Media loaded on cast device");
        // Pause local player when casting
        setPlayerState((prev) => ({ ...prev, playing: false }));
      })
      .catch((error) => {
        console.error("Error loading media on cast device:", error);
      });
  };

  const stopCasting = () => {
    if (castSession) {
      castSession.endSession(true);
    }
  };

  // Update cast when exercise changes
  useEffect(() => {
    if (castConnected && castSession && currentExercise?.exercise?.videoURL) {
      loadCurrentExerciseOnCast();
    }
  }, [currentExercise?.index]);

  const handleCastButtonClick = () => {
    if (castConnected) {
      stopCasting();
    } else {
      startCasting();
    }
  };

  return (
    <div>
      <div className="controls-details" ref={descriptionRef}>
        <div className="controls-details-top-title font-paragraph-white">
          <span>{exerciseTitle}</span>
          {castConnected && (
            <span
              style={{
                fontSize: "12px",
                color: "#FF7700",
                marginTop: "5px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              📺 Casting to TV
            </span>
          )}
          {(exerciseSeconds || exerciseLength) && (
            <span style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "26px", marginRight: "5px" }}>
                {Math.round(exerciseSeconds)}
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
            {!inCreation && (fullscreen || width <= 768) && (
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
                  style={{
                    ...playerIconStyle,
                    opacity: castAvailable ? 1 : 0.5,
                    filter: castConnected
                      ? "brightness(1.5) sepia(1) hue-rotate(45deg)"
                      : "none",
                  }}
                  onClick={castAvailable ? handleCastButtonClick : undefined}
                  title={
                    !castAvailable
                      ? "No cast devices available"
                      : castConnected
                      ? "Disconnect from cast device"
                      : "Cast to device"
                  }
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
                  style={{
                    ...playerIconStyle,
                    opacity: castAvailable ? 1 : 0.5,
                    filter: castConnected
                      ? "brightness(1.5) sepia(1) hue-rotate(45deg)"
                      : "none",
                  }}
                  onClick={castAvailable ? handleCastButtonClick : undefined}
                  title={
                    !castAvailable
                      ? "No cast devices available"
                      : castConnected
                      ? "Disconnect from cast device"
                      : "Cast to device"
                  }
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
                <div className="player-play-pause-icon-box">
                  {playerState.playing ? (
                    // PlayerPauseIcon
                    <img
                      src={PlayerPauseIcon}
                      alt="skip-left-icon"
                      style={{ cursor: "pointer" }}
                      className="controls-wrapper-bottom-icons"
                      onClick={onPlayPause}
                    />
                  ) : (
                    <img
                      src={PlayerPlayIcon}
                      alt="skip-left-icon"
                      style={{ cursor: "pointer" }}
                      className="controls-wrapper-bottom-icons"
                      onClick={onPlayPause}
                    />
                  )}
                </div>
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
                <div className="player-play-pause-icon-box">
                  {playerState.playing ? (
                    <img
                      src={PlayerPauseIcon}
                      alt="skip-left-icon"
                      style={{ cursor: "pointer" }}
                      className="controls-wrapper-bottom-icons"
                      onClick={onPlayPause}
                    />
                  ) : (
                    <img
                      src={PlayerPlayIcon}
                      alt="skip-left-icon"
                      style={{ cursor: "pointer" }}
                      className="controls-wrapper-bottom-icons"
                      onClick={onPlayPause}
                    />
                  )}
                </div>
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
                  workout &&
                  workout.exercises.filter(
                    (ex, idx) =>
                      idx !== 0 || ex.videoURL || ex.exerciseLength > 0
                  ).length
                }, 1fr)`,
              }}
            >
              {workout &&
                workout.exercises
                  .map((ex, originalIndex) => ({ ex, originalIndex }))
                  .filter(
                    ({ ex, originalIndex }) =>
                      originalIndex !== 0 ||
                      ex.videoURL ||
                      ex.exerciseLength > 0
                  )
                  .map(({ ex, originalIndex }) => {
                    return (
                      <div
                        key={originalIndex}
                        className="react-player-stepper"
                        style={{
                          background:
                            currentExercise &&
                            currentExercise.index === originalIndex &&
                            currentExercise.index !== -1
                              ? "#fff"
                              : "#FB7600",
                        }}
                      ></div>
                    );
                  })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default forwardRef(PlayerControls);
