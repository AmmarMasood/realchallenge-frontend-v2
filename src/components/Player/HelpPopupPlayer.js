import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import { VideoSeekSlider } from "react-video-seek-slider";
import {
  CaretRightOutlined,
  PauseOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
  const [progress, setProgress] = useState({
    playedSeconds: 0,
    loadedSeconds: 0,
    duration: 0,
  });
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

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

  // Seek handler
  const onSeek = (value) => {
    if (playerRef.current) {
      playerRef.current.seekTo(value, "seconds");
      setProgress((prev) => ({
        ...prev,
        playedSeconds: value,
      }));
    }
  };

  // Timer values
  const elapsedTime = formatTime(progress.playedSeconds);
  const totalDuration = formatTime(progress.duration);
  const remainingTime = formatTime(progress.duration - progress.playedSeconds);

  const onPlayPause = () => setPlaying((p) => !p);

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
            Your Trainer
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
        style={{ position: "relative" }}
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
              color: "#fff",
              fontSize: "32px",
              background: "rgba(0,0,0,0.6)",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            Loading...
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          width="100%"
          height="100%"
          url={exercise.voiceOverLink || exercise.videoURL}
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
            <span className="font-paragraph-white" style={{ fontSize: "16px" }}>
              {elapsedTime}
            </span>
          </div>
          <div className="helpPopOut-progress-bar-container">
            <VideoSeekSlider
              max={progress.duration || 0}
              currentTime={progress.playedSeconds || 0}
              progress={
                progress.duration
                  ? (progress.playedSeconds / progress.duration) * 100
                  : 0
              }
              onChange={onSeek}
              offset={0}
              limitTimeTooltipBySides={true}
              hideSeekTimes={false}
              secondsPrefix="00:00:"
              minutesPrefix="00:"
              tipFormatter={() => formatTime(progress.playedSeconds)}
              disabled={progress.duration === 0}
            />
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
    </Modal>
  );
}

export default HelpPopupPlayer;
