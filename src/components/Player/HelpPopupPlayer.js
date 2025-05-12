import React, { useState, useEffect, useRef } from "react";
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

function HelpPopupPlayer({ open, setOpen, onCancel, exercise }) {
  const playerRef = useRef(null);
  const [progress, setProgress] = useState({});
  const [playing, setPlaying] = useState(false);
  const { height, width } = useWindowDimensions();

  const currentTime = playerRef.current
    ? playerRef.current.getCurrentTime()
    : "00:00";

  const duration = playerRef.current
    ? playerRef.current.getDuration()
    : "00:00";

  const getTime = formatTime(duration - currentTime);
  const elapsedTime = formatTime(currentTime);
  const totalDuration = formatTime(duration);

  const onSeek = (e) => {
    setProgress({ ...progress, played: parseFloat(e / 100) });
    playerRef.current.seekTo(e / 100);
  };

  const handleProgress = (changeState) => {
    console.log("change state", changeState);
    console.log(
      " playerState.progress.loadedSeconds === playerState.progress.playedSeconds",
      progress.loadedSeconds === progress.playedSeconds
    );
    if (progress.loadedSeconds === progress.playedSeconds) {
      // setPlayerState({ ...playerState, loading: true });
      // setPlayerState({ ...playerState, playing: false });
    } else {
      // setPlayerState({ ...playerState, loading: false });
      // setPlayerState({ ...playerState, playing: true });
    }
    // setPlayerState({ ...playerState, progress: changeState });
    setProgress(changeState);
  };

  const onPlayPause = () => {
    setPlaying(!playing);
    // setPlaying(!playing);
  };

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
      {console.log(exercise)}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={SquarePT} alt="" width="30px" />{" "}
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
        {console.log(exercise)}
        <ReactPlayer
          width="100%"
          height="100%"
          url={`${process.env.REACT_APP_SERVER}/uploads/${exercise.videoURL}`}
          loop={true}
          controls={false}
          muted={true}
          playing={playing}
          stopOnUnmount={false}
        />
        {exercise.voiceOverLink && (
          <ReactPlayer
            ref={playerRef}
            url={`${process.env.REACT_APP_SERVER}/uploads/${exercise.voiceOverLink}`}
            playing={playing}
            controls={true}
            style={{ display: "none" }}
            onProgress={handleProgress}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          />
        )}

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
            }}
          >
            {playing ? (
              <img
                src={PopupPauseIcon}
                alt="skip-left-icon"
                style={{ cursor: "pointer", height: "25px" }}
                className="controls-wrapper-bottom-icons"
                onClick={onPlayPause}
              />
            ) : (
              <img
                src={PopupPlayIcon}
                alt="skip-left-icon"
                style={{ cursor: "pointer", height: "25px" }}
                className="controls-wrapper-bottom-icons"
                onClick={onPlayPause}
              />
            )}
            <span className="font-paragraph-white" style={{ fontSize: "16px" }}>
              {getTime}
            </span>
          </div>
          <div className="helpPopOut-progress-bar-container">
            <VideoSeekSlider
              max={100}
              currentTime={progress.played * 100}
              progress={progress.loaded * 100}
              onChange={onSeek}
              offset={0}
              limitTimeTooltipBySides={true}
              hideSeekTimes={false}
              secondsPrefix="00:00:"
              minutesPrefix="00:"
              tipFormatter={(v) => `${elapsedTime}`}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default HelpPopupPlayer;
