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
// Decompose seconds into spoken-style parts for the idle overlay:
// 42 → [42 Sec], 330 → [5 Min, 30 Sec], 3730 → [1 Hr, 2 Min, 10 Sec].
// Zero units are skipped (300 → "5 Min", not "5 Min 0 Sec").
const formatOverlayParts = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const parts = [];
  if (h > 0) parts.push({ value: h, unit: "Hr" });
  if (m > 0) parts.push({ value: m, unit: "Min" });
  if (s > 0 || parts.length === 0) parts.push({ value: s, unit: "Sec" });
  return parts;
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
  const { width } = useWindowDimensions();

  // Track current music selection for cast forwarding
  const currentMusicRef = useRef({ url: null, volume: 0.3 });
  // Loop guards for cast/local exercise sync:
  //  - tvDrivenIndexRef: the last index we set locally *because the TV moved*,
  //    so the local→TV effect knows not to echo it back.
  //  - prevLocalIndexRef: previous local index, to detect actual changes.
  const tvDrivenIndexRef = useRef(null);
  const prevLocalIndexRef = useRef(currentExercise?.index);

  // ─── Chromecast hook ───
  const {
    castAvailable,
    castConnected,
    receiverState,
    toggleCast,
    sendWorkoutToReceiver,
    sendTogglePause,
    sendSkipNext,
    sendSkipPrev,
    sendChangeMusic,
    sendSetVolume,
  } = useChromecast({ workout, currentExercise });

  // When casting starts, hand the workout off to the TV: pause the local
  // player and clear any active break overlay. The break runs on the receiver
  // now, and clearing it locally lets the cast remote controls underneath be
  // clickable (otherwise the break layout sits on top and blocks them, leaving
  // the break timer looking stuck).
  useEffect(() => {
    // Mirror cast state into the shared player state so RenderedVideoPlayer
    // can suppress local playback and the start overlay while casting.
    setPlayerState((prev) => ({
      ...prev,
      castConnected,
      ...(castConnected ? { playing: false } : {}),
    }));
    if (castConnected) {
      setCurrentBreak(false);
      setTimerVisible(false);
      setBreakPaused(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castConnected]);

  // Keep the local player in sync with the TV while casting: follow the
  // receiver's current exercise so disconnecting resumes from there. This only
  // reads receiver state and updates local position — it sends nothing to the
  // TV, so there's no reload loop. (local → TV is handled at connect time via
  // LOAD_WORKOUT's startIndex.)
  useEffect(() => {
    if (!castConnected) return;
    const tvIndex = receiverState?.exerciseIndex;
    if (
      tvIndex != null &&
      workout?.exercises?.[tvIndex] &&
      tvIndex !== currentExercise?.index
    ) {
      // Mark this as TV-driven so the local→TV effect doesn't echo it back.
      tvDrivenIndexRef.current = tvIndex;
      setCurrentExercise({
        exercise: workout.exercises[tvIndex],
        index: tvIndex,
        completed:
          workout.exercises.length > 1
            ? Math.round((tvIndex / (workout.exercises.length - 1)) * 100)
            : 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverState?.exerciseIndex, castConnected]);

  // TV → local completion: when the receiver finishes the workout it reports
  // phase "complete". Run the normal local completion flow — the local index
  // has been kept on the last exercise by the sync effect above, so
  // moveToNextExercise() hits its completion branch: progress is saved and
  // the "Well done" modal shows on this device too, instead of the phone
  // sitting silently on the cast screen. One-shot per cast session.
  const castCompleteHandledRef = useRef(false);
  useEffect(() => {
    if (!castConnected) {
      castCompleteHandledRef.current = false;
      return;
    }
    const phase = receiverState?.phase;
    if (phase === "complete" && !castCompleteHandledRef.current) {
      castCompleteHandledRef.current = true;
      moveToNextExercise();
    } else if (phase && phase !== "complete") {
      // a new run started on the TV (workout reloaded/restarted) — re-arm
      castCompleteHandledRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverState?.phase, castConnected]);

  // Local → TV: when the exercise changes locally (e.g. picked from the video
  // browser), jump the TV there. TV-driven changes are skipped (tvDrivenIndexRef)
  // so there's no reload loop with the effect above.
  useEffect(() => {
    const idx = currentExercise?.index;
    if (
      castConnected &&
      idx != null &&
      idx !== prevLocalIndexRef.current &&
      idx !== tvDrivenIndexRef.current
    ) {
      sendWorkoutToReceiver(
        currentMusicRef.current.url,
        currentMusicRef.current.volume,
      );
    }
    prevLocalIndexRef.current = idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.index, castConnected]);

  useEffect(() => {
    console.log("lworkout", exerciseWorkoutTimeTrack);
  }, [exerciseWorkoutTimeTrack]);

  // Detect fullscreen via the Fullscreen API events instead of comparing window
  // vs container dimensions on every render. The old approach (no dep array) ran
  // on every resize — and on mobile the address bar showing/hiding during scroll
  // fires `resize`, which flipped `fullscreen` and made the player jump (issue C).
  // Event-driven detection has no scroll coupling.
  useEffect(() => {
    if (!screenfull.isEnabled) return;
    const syncFullscreen = () => setFullscreen(screenfull.isFullscreen);
    syncFullscreen();
    screenfull.on("change", syncFullscreen);
    return () => screenfull.off("change", syncFullscreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";
  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : "00:00";
  const elapsedTime = formatTime(currentTime);
  const totalDuration = formatTime(duration);

  // Seconds shown on the idle overlay. Exercise workouts have a real
  // countdown (exerciseSeconds, from the rendered player); video/audio
  // players tick the remaining time of the current media file instead.
  const overlaySeconds =
    Number.isFinite(exerciseSeconds) && exerciseSeconds >= 0
      ? Math.round(exerciseSeconds)
      : Number.isFinite(duration) && duration > 0
        ? Math.max(
            0,
            Math.round(
              duration - (Number.isFinite(currentTime) ? currentTime : 0),
            ),
          )
        : null;

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
  // Cast is only offered for exercise (rendered) workouts — the receiver is
  // built around the timed-exercise flow. Video and audio workout cast
  // support is deferred to the next sprint (client-agreed scope).
  const castSupported = !!(workout?.renderWorkout || workout?.isRendered);
  const renderCastIcon = (iconSrc) =>
    castSupported && (
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
    // Total comes from the same source as the local player (the workout's
    // summed duration), so the times match exactly and never show NaN — the
    // receiver's totalDuration is only a fallback.
    const castTotal = exerciseWorkoutTimeTrack?.total || rs?.totalDuration || 0;
    const castPaused = rs?.isPaused || false;

    return (
      <>
        <div
          className="controls-wrapper-bottom"
          style={{ position: "relative", marginTop: "auto" }}
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
      {/* While casting, hide the local (frozen) player behind a cast screen —
          standard sender behaviour. The top bar + cast remote render on top of
          this; it's the lowest control layer so it dims the video only. */}
      {castConnected && (
        <div className="casting-overlay">
          <img
            src={PlayerChromeIcon}
            alt=""
            className="casting-overlay-icon"
          />
          <span className="casting-overlay-text">Casting to TV</span>
        </div>
      )}
      {/* Description area — cast vs local */}
      {castConnected ? (
        renderCastDescription()
      ) : (
        <div className="controls-details" ref={descriptionRef}>
          <div className="controls-details-top-title font-paragraph-white">
            <span>{exerciseTitle}</span>
            {overlaySeconds !== null && (
              <span style={{ marginTop: "10px" }}>
                {formatOverlayParts(overlaySeconds).map((part, idx) => (
                  <React.Fragment key={part.unit}>
                    <span
                      style={{
                        fontSize: "26px",
                        margin: idx === 0 ? "0 5px 0 0" : "0 5px",
                      }}
                    >
                      {part.value}
                    </span>
                    {part.unit}
                  </React.Fragment>
                ))}
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
        {/* No music in audio workouts — the audio track is the only sound */}
        {workout?.workoutType !== "audio" && (
          <div>
            <MusicPlayer
              musicList={musicList}
              setMusicPlayerVisible={setMusicPlayerVisible}
              visible={musicPlayerVisible}
              onMusicChange={handleMusicChange}
            />
          </div>
        )}

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
                {workout?.workoutType !== "audio" && (
                  <img
                    src={PlayerMusicIcon}
                    onClick={() => setMusicPlayerVisible(!musicPlayerVisible)}
                    alt="player-music-icon"
                    style={playerIconStyle}
                  />
                )}
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
                {workout?.workoutType !== "audio" && (
                  <img
                    src={SmPlayerMusicIcon}
                    onClick={() => setMusicPlayerVisible(!musicPlayerVisible)}
                    alt="player-music-icon"
                    style={playerIconStyle}
                  />
                )}
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
