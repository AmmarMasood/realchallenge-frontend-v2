import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import {
  CaretRightOutlined,
  PauseOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import Modal from "react-modal";
import SquarePT from "../../assets/icons/Square-PT.png";
import PopupPlayIcon from "../../assets/icons/help-pop-out-play-icon.svg";
import PopupPauseIcon from "../../assets/icons/help-pop-out-pause-icon.svg";
import "../../assets/helpPopupPlayer.css";

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "00:00";
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
};

function HelpPopupPlayer({ open, setOpen, onCancel, exercise }) {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const [progress, setProgress] = useState({
    playedSeconds: 0,
    loadedSeconds: 0,
    duration: 0,
  });
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Loader for buffering
  const handleBuffer = () => setBuffering(true);
  const handleBufferEnd = () => setBuffering(false);

  // Progress handler
  const handleProgress = (changeState) => {
    setProgress((prev) => ({
      ...prev,
      ...changeState,
    }));
  };

  // Duration handler
  const handleDuration = (duration) => {
    setProgress((prev) => ({
      ...prev,
      duration,
    }));
  };

  // Timer values
  const elapsedTime = formatTime(progress.playedSeconds);
  const totalDuration = formatTime(progress.duration);
  const remainingTime = formatTime(progress.duration - progress.playedSeconds);

  const onPlayPause = () => setPlaying((p) => !p);

  // Get audio duration
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
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
      contentLabel="Trainer Help Modal"
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={SquarePT} alt="" width="30px" />
          <span
            className="font-paragraph-white"
            style={{ marginLeft: "10px", fontWeight: "600", fontSize: "15px" }}
          >
            Your Trainer's Input
          </span>
        </div>
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
        {/* Loader */}
        {buffering && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              background: "rgba(0,0,0,0.6)",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#FB7600" }}
                  spin
                />
              }
            />
          </div>
        )}
        {console.log("ammar", exercise)}
        <ReactPlayer
          ref={playerRef}
          width="100%"
          height="100%"
          url={exercise.videoURL}
          loop={true}
          controls={false}
          muted={true}
          playing={playing}
          stopOnUnmount={false}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
        />

        <div
          style={{
            position: "absolute",
            bottom: "0",
            width: "100%",
            padding: "20px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "0 30px",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div className="player-play-pause-icon-box" style={{ margin: 0 }}>
              {playing ? (
                <img
                  src={PopupPauseIcon}
                  alt="pause"
                  style={{ cursor: "pointer", height: "25px" }}
                  className="controls-wrapper-bottom-icons"
                  onClick={onPlayPause}
                />
              ) : (
                <img
                  src={PopupPlayIcon}
                  alt="play"
                  style={{ cursor: "pointer", height: "25px" }}
                  className="controls-wrapper-bottom-icons"
                  onClick={onPlayPause}
                />
              )}
            </div>
            {/* <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <span className="font-paragraph-white" style={{ fontSize: "16px" }}>
                {elapsedTime}
              </span>
              <span className="font-paragraph-white" style={{ fontSize: "12px", opacity: 0.7 }}>
                / {formatTime(audioDuration || progress.duration)}
              </span>
            </div> */}
          </div>
        </div>
      </div>
      {exercise?.description && (
        <p
          style={{
            color: "#fff",
            fontSize: "16px",
            marginTop: "10px",
            padding: "0 10px",
            maxHeight: "100px",
            overflowY: "auto",
            lineHeight: "1.5",
          }}
        >
          {exercise?.description}
        </p>
      )}
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

export default HelpPopupPlayer;
