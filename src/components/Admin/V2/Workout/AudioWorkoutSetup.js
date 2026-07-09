import React, { useContext, useEffect, useState } from "react";
import { get } from "lodash";
import { useRemoteMediaManager } from "../../../../contexts/RemoteMediaManagerContext";
import { LanguageContext } from "../../../../contexts/LanguageContext";

/* The audio session card in the workout studio strip — shown after the
 * intro card for audio workouts, styled like a regular exercise card.
 * The card shows the background visual as a plain thumbnail (a video is
 * NOT played here — just its first frame), with the two pickers stacked
 * as overlay buttons on top of it. No inline audio controls: clicking
 * anywhere on the card outside the buttons selects the session into the
 * main studio player, whose controls become the audio controls. */

const VIDEO_EXTS = ["m4v", "avi", "mpg", "mp4", "mov", "wmv", "flv", "webm", "mkv"];
const isVideoLink = (link) => {
  const ext = (link || "").split(".").pop()?.toLowerCase();
  return VIDEO_EXTS.includes(ext);
};

function AudioWorkoutSetup({
  workout,
  setWorkout,
  onSelectSession,
  isSessionActive,
}) {
  const { strings } = useContext(LanguageContext);
  const {
    setMediaManagerVisible,
    setMediaManagerType,
    setMediaManagerActions,
  } = useRemoteMediaManager();
  const [audioFile, setAudioFile] = useState(null);
  const [visualFile, setVisualFile] = useState(null);

  useEffect(() => {
    if (audioFile && audioFile.link) {
      setWorkout((prev) => ({ ...prev, audioLink: audioFile.link }));
    }
    // eslint-disable-next-line
  }, [audioFile]);

  useEffect(() => {
    if (visualFile && visualFile.link) {
      const video = isVideoLink(visualFile.link);
      setWorkout((prev) => ({
        ...prev,
        backgroundVideoLink: video ? visualFile.link : "",
        backgroundImageLink: video ? "" : visualFile.link,
      }));
    }
    // eslint-disable-next-line
  }, [visualFile]);

  const pickAudio = (e) => {
    e.stopPropagation();
    setMediaManagerVisible(true);
    setMediaManagerType("musics");
    setMediaManagerActions([audioFile, setAudioFile]);
  };

  const pickVisual = (e) => {
    e.stopPropagation();
    setMediaManagerVisible(true);
    // coverMedia accepts both images and videos in one dialog
    setMediaManagerType("coverMedia");
    setMediaManagerActions([visualFile, setVisualFile]);
  };

  const hasVisual = !!(
    workout.backgroundVideoLink || workout.backgroundImageLink
  );
  const hasAudio = !!workout.audioLink;

  return (
    <div
      className={`exercise-browser-card exercise-browser-card-update${
        isSessionActive
          ? " challenge-player-container-exercies-box--currentRunning"
          : ""
      }`}
      onClick={onSelectSession}
      style={{ cursor: hasAudio ? "pointer" : "default" }}
      title={
        hasAudio
          ? get(strings, "workoutStudio.play_audio_session", "Play audio session")
          : undefined
      }
    >
      <div>
        <h4 className="challenge-player-container-exercies-round font-paragraph-white">
          {get(strings, "workoutStudio.audio_session", "Audio session")}
        </h4>
      </div>
      <div className="challenge-player-container-exercies-box">
        <div
          className="challenge-player-container-exercies-box-imagebox"
          style={{ position: "relative" }}
        >
          {/* Visual thumbnail — a background video shows its first frame
              only (preload metadata, no autoplay/loop) */}
          {workout.backgroundVideoLink ? (
            <video
              src={workout.backgroundVideoLink}
              muted
              preload="metadata"
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : workout.backgroundImageLink ? (
            <img
              src={workout.backgroundImageLink}
              alt="background-visual"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}

          {/* Picker buttons overlaying the thumbnail. The wrapper is
              click-through (pointerEvents none) so clicks beside the
              buttons still select the session via the card. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              pointerEvents: "none",
            }}
          >
            <button
              type="button"
              className="audio-setup-overlay-btn"
              onClick={pickVisual}
            >
              {hasVisual
                ? get(
                    strings,
                    "workoutStudio.replace_visual",
                    "Replace photo/video",
                  )
                : get(
                    strings,
                    "workoutStudio.choose_visual",
                    "Choose photo or video",
                  )}
            </button>
            <button
              type="button"
              className="audio-setup-overlay-btn"
              onClick={pickAudio}
            >
              {hasAudio
                ? get(strings, "workoutStudio.replace_audio", "Replace audio")
                : get(
                    strings,
                    "workoutStudio.choose_audio",
                    "Choose audio file",
                  )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioWorkoutSetup;
