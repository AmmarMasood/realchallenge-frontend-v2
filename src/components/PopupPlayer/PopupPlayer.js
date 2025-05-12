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

function PopupPlayer({ open, setOpen, onCancel, video }) {
  const playerRef = useRef(null);
  const [progress, setProgress] = useState({});
  const [playing, setPlaying] = useState(false);

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
        style={{ position: "relative" }}
      >
        <ReactPlayer
          width="100%"
          height="100%"
          url={`${process.env.REACT_APP_SERVER}/uploads/${video}`}
          loop={true}
          controls={true}
          muted={false}
          playing={playing}
          stopOnUnmount={false}
        />
      </div>
    </Modal>
  );
}

export default PopupPlayer;
