import React, { forwardRef, useState, useContext, useEffect, useRef } from "react";
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
  breakContext,
  breakPausedContext,
  exerciseWorkoutTimeTrackContext,
  playerFullscreenContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";
import screenfull from "screenfull";
import MusicPlayer from "./MusicPlayer";
import SkipLeftIcon from "../../assets/icons/player-play-left-icon.svg";
import SkipRightIcon from "../../assets/icons/player-play-right-icon.svg";
import PlayerPlayIcon from "../../assets/icons/player-play-icon.svg";
import PlayerPauseIcon from "../../assets/icons/player-pause-icon.svg";
import BackButton from "../../assets/icons/big-back-button.svg";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import useChromecast from "../../hooks/useChromecast";

const playerIconStyle = {
  // width: "24px",
  cursor: "pointer",
  marginRight: "10px",
};
const formatTime = (seconds) => {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
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
  const [currentBreak, setCurrentBreak] = useContext(breakContext);
  const [, setTimerVisible] = useContext(timerVisibleContext);
  const [breakPaused, setBreakPaused] = useContext(breakPausedContext);
  const { height, width } = useWindowDimensions();

  // Track current music selection for cast forwarding
  const currentMusicRef = useRef({ url: null, volume: 0.3 });

  // ─── Chromecast hook ───
  const {
    castAvailable,
    castConnected,
    receiverState,
    toggleCast,
    sendTogglePause,
    sendSkipNext,
    sendSkipPrev,
    sendChangeMusic,
    sendSetVolume,
  } = useChromecast({ workout, currentExercise });

  // Pause local player when casting starts
  useEffect(() => {
    if (castConnected) {
      setPlayerState((prev) => ({ ...prev, playing: false }));
    }
  }, [castConnected]);

  useEffect(() => {
    console.log("lworkout", exerciseWorkoutTimeTrack);
  }, [exerciseWorkoutTimeTrack]);

  useEffect(() => {
    if (
      width === playerContainerRef.current.clientWidth &&
      height === playerContainerRef.current.clientHeight
    ) {
      setFullscreen(true);
    } else {
      setFullscreen(false);
    }
  });

  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";
  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : "00:00";
  const elapsedTime = formatTime(currentTime);
  const totalDuration = formatTime(duration);

  const dismissBreak = () => {
    setCurrentBreak(false);
    setTimerVisible(false);
    setBreakPaused(false);
  };

  const onMute = () => {
    setPlayerState({ ...playerState, muted: !playerState.muted });
    // If casting, mute the TV video audio too
    if (castConnected) {
      sendSetVolume({
        videoVolume: playerState.muted ? 1 : 0,
      });
    }
  };

  const onPlayPause = () => {
    if (castConnected) {
      sendTogglePause();
      return;
    }
    if (currentBreak) {
      setBreakPaused(!breakPaused);
      return;
    }
    setPlayerState({ ...playerState, playing: !playerState.playing });
  };

  const toggleFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false);
    } else {
      setFullscreen(true);
    }

    screenfull.toggle(playerContainerRef.current);
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

  const handleCastButtonClick = () => {
    toggleCast(currentMusicRef.current.url, currentMusicRef.current.volume);
  };

  // Callback for MusicPlayer to notify about music changes (forwarded to Cast receiver)
  const handleMusicChange = (musicUrl, musicVolume) => {
    currentMusicRef.current = { url: musicUrl, volume: musicVolume };
    if (castConnected) {
      sendChangeMusic(musicUrl, musicVolume);
    }
  };

  const handleCastSkipNext = () => {
    sendSkipNext();
  };

  const handleCastSkipPrev = () => {
    sendSkipPrev();
  };

  // ─── Cast icon rendering (shared between fullscreen and non-fullscreen) ───
  const renderCastIcon = (iconSrc) => (
    <img
      src={iconSrc}
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
  );

  // ─── Casting Remote UI (replaces normal controls when casting) ───
  const renderCastingRemote = () => {
    const rs = receiverState;
    const phaseLabel = rs?.phase || "connecting";
    const castElapsed = rs?.totalElapsed || 0;
    const castTotal = rs?.totalDuration || 0;
    const castPaused = rs?.isPaused || false;
    const castProgress = castTotal > 0 ? (castElapsed / castTotal) * 100 : 0;

    return (
      <>
        <div
          className="controls-wrapper-bottom"
          style={{ position: "relative" }}
        >
          <span className="font-paragraph-white player-elasped-time-container">
            {formatTime(castElapsed)}
          </span>
          <div>
            <img
              src={SkipLeftIcon}
              alt="skip-prev"
              style={{ cursor: "pointer" }}
              onClick={handleCastSkipPrev}
            />
            <div className="player-play-pause-icon-box">
              {!castPaused ? (
                <img
                  src={PlayerPauseIcon}
                  alt="pause"
                  style={{ cursor: "pointer" }}
                  className="controls-wrapper-bottom-icons"
                  onClick={onPlayPause}
                />
              ) : (
                <img
                  src={PlayerPlayIcon}
                  alt="play"
                  style={{ cursor: "pointer" }}
                  className="controls-wrapper-bottom-icons"
                  onClick={onPlayPause}
                />
              )}
            </div>
            <img
              src={SkipRightIcon}
              alt="skip-next"
              style={{ cursor: "pointer" }}
              onClick={handleCastSkipNext}
            />
          </div>
          <span
            className="font-paragraph-white player-elasped-time-container"
            style={{ textAlign: "right" }}
          >
            {formatTime(castTotal)}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ margin: "0 30px 10px 35px", paddingBottom: "10px" }}>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                width: `${Math.min(castProgress, 100)}%`,
                height: "100%",
                background: "#FF7700",
                borderRadius: "2px",
                transition: "width 1s linear",
              }}
            />
          </div>
        </div>
        {/* Cast exercise stepper */}
        {rs && rs.totalExercises > 0 && (
          <div
            className="react-player-stepper-container"
            style={{
              gridTemplateColumns: `repeat(${rs.totalExercises}, 1fr)`,
            }}
          >
            {Array.from({ length: rs.totalExercises }).map((_, i) => (
              <div
                key={i}
                className="react-player-stepper"
                style={{
                  background:
                    i === rs.exerciseIndex
                      ? "#fff"
                      : i < rs.exerciseIndex
                      ? "#FF7700"
                      : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  // ─── Cast status info for the description area ───
  const renderCastDescription = () => {
    const rs = receiverState;
    const phaseLabel = rs?.phase;
    const exerciseName = rs?.exerciseTitle || exerciseTitle || "";
    const timeRemaining =
      phaseLabel === "exercise"
        ? rs?.exerciseTimeRemaining
        : phaseLabel === "break"
        ? rs?.breakTimeRemaining
        : null;

    return (
      <div className="controls-details" ref={descriptionRef}>
        <div className="controls-details-top-title font-paragraph-white">
          <span>
            {phaseLabel === "break" ? "Rest" : exerciseName}
          </span>
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
            Casting to TV
            {phaseLabel === "get_ready" && " - Get Ready"}
            {phaseLabel === "complete" && " - Workout Complete!"}
          </span>
          {timeRemaining != null && (
            <span style={{ marginTop: "10px" }}>
              <span style={{ fontSize: "26px", marginRight: "5px" }}>
                {Math.round(timeRemaining)}
              </span>
              Sec
            </span>
          )}
        </div>
        <div className="controls-details-bottom-title font-paragraph-white">
          {phaseLabel === "break" && rs?.exerciseIndex != null && (
            <span>
              Up next:{" "}
              {workout?.exercises?.[rs.exerciseIndex + 1]?.title || "Finish"}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Description area — cast vs local */}
      {castConnected ? (
        renderCastDescription()
      ) : (
        <div className="controls-details" ref={descriptionRef}>
          <div className="controls-details-top-title font-paragraph-white">
            <span>{exerciseTitle}</span>
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
      )}

      <div className="controls-wrapper" ref={ref} style={currentBreak && !castConnected ? { zIndex: 20 } : undefined}>
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
            onMusicChange={handleMusicChange}
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
                {renderCastIcon(PlayerChromeIcon)}
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
                {renderCastIcon(SmPlayerChromeIcon)}
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

        {/* ─── Middle & Bottom Controls ─── */}
        {castConnected ? (
          /* Casting remote controls */
          renderCastingRemote()
        ) : (
          <>
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
                    {formatTime(exerciseWorkoutTimeTrack.current)}
                  </span>
                  <div>
                    <img
                      src={SkipLeftIcon}
                      alt="skip-left-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (currentExercise && currentExercise.index !== 0) {
                          if (currentBreak) dismissBreak();
                          moveToPrevExercise();
                          setPlayerState((prev) => ({ ...prev, playing: true }));
                        }
                      }}
                    />
                    <div className="player-play-pause-icon-box">
                      {(currentBreak ? !breakPaused : playerState.playing) ? (
                        <img
                          src={PlayerPauseIcon}
                          alt="pause-icon"
                          style={{ cursor: "pointer" }}
                          className="controls-wrapper-bottom-icons"
                          onClick={onPlayPause}
                        />
                      ) : (
                        <img
                          src={PlayerPlayIcon}
                          alt="play-icon"
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
                          if (currentBreak) dismissBreak();
                          moveToNextExercise();
                          setPlayerState((prev) => ({ ...prev, playing: true }));
                        }
                      }}
                    />
                  </div>
                  <span
                    className="font-paragraph-white player-elasped-time-container"
                    style={{ textAlign: "right" }}
                  >
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
          </>
        )}
      </div>
    </div>
  );
}

export default forwardRef(PlayerControls);
