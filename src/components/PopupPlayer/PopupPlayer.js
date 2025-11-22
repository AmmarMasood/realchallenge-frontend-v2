import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import {
  CaretRightOutlined,
  PauseOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Modal from "react-modal";
import SquarePT from "../../assets/icons/Square-PT.png";
// import PlayerPlayIcon from "../../assets/icons/player-play-icon.svg";
import PopupPlayIcon from "../../assets/icons/help-pop-out-play-icon.svg";
import PopupPauseIcon from "../../assets/icons/help-pop-out-pause-icon.svg";
// import PlayerPauseIcon from "../../assets/icons/player-pause-icon.svg";
import "../../assets/helpPopupPlayer.css";

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

function PopupPlayer({ open, setOpen, onCancel, video, exercise }) {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const [progress, setProgress] = useState({
    playedSeconds: 0,
    loadedSeconds: 0,
    duration: 0,
  });
  const [playing, setPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Get audio duration
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  // Handle progress from video
  const handleProgress = (changeState) => {
    setProgress((prev) => ({
      ...prev,
      ...changeState,
    }));
  };

  // Handle video duration
  const handleDuration = (duration) => {
    setProgress((prev) => ({
      ...prev,
      duration,
    }));
  };

  // Sync audio playback with video
  useEffect(() => {
    if (audioRef.current && exercise?.voiceOverLink) {
      if (playing) {
        audioRef.current.play().catch((error) => {
          console.error("Audio play failed:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, exercise?.voiceOverLink]);

  // Handle audio end - stop video after 1 second
  useEffect(() => {
    if (!audioRef.current || !playerRef.current) return;

    const handleAudioEnd = () => {
      if (audioDuration > 0) {
        // Stop video 1 second after audio ends
        setTimeout(() => {
          setPlaying(false);
          if (playerRef.current) {
            playerRef.current.seekTo(0, "seconds");
          }
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }, 1000);
      }
    };

    const audioElement = audioRef.current;
    audioElement.addEventListener("ended", handleAudioEnd);
    return () => audioElement.removeEventListener("ended", handleAudioEnd);
  }, [audioDuration]);

  // Loop video if shorter than audio
  useEffect(() => {
    if (progress.duration > 0 && audioDuration > 0) {
      if (progress.playedSeconds >= progress.duration && playing) {
        // Video finished, loop it if audio is still playing
        if (progress.playedSeconds < audioDuration) {
          if (playerRef.current) {
            playerRef.current.seekTo(0, "seconds");
          }
        }
      }
    }
  }, [progress.playedSeconds, progress.duration, audioDuration, playing]);

  // Auto-play when modal opens
  useEffect(() => {
    if (open) {
      setPlaying(true);
    }
  }, [open]);

  // Reset audio when modal closes
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, [open]);

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => {
        setPlaying(false);
        onCancel();
      }}
      contentLabel="Example Modal"
      style={{ zIndex: 3 }}
    >
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}></div>
        <CloseOutlined
          style={{ color: "#fff", fontSize: "30px", cursor: "pointer" }}
          onClick={() => {
            setPlaying(false);
            onCancel();
          }}
        />
      </div>
      <div
        className="helpPopOut-player-wrapper"
        style={{ position: "relative", backgroundColor: "#000" }}
      >
        <ReactPlayer
          ref={playerRef}
          width="100%"
          height="100%"
          url={`${video}`}
          controls={true}
          muted={false}
          playing={playing}
          stopOnUnmount={false}
          onProgress={handleProgress}
          onDuration={handleDuration}
        />
      </div>
      {exercise?.voiceOverLink && (
        <audio
          ref={audioRef}
          src={exercise.voiceOverLink}
          preload="auto"
          onLoadedMetadata={handleAudioLoadedMetadata}
        />
      )}
    </Modal>
  );
}

export default PopupPlayer;
