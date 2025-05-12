import React, { useState, useContext, useEffect } from "react";
import { Modal, Slider } from "antd";
import ReactPlayer from "react-player";
// import { Scrollbars } from "react-custom-scrollbars";
import { CloseOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import useWindowDimensions from "../../helpers/useWindowDimensions";

import MusicIcon from "../../assets/icons/music-player-volume-icon.png";
import MuteMusicIcon from "../../assets/icons/music-player-volume-mute-icon.png";
import MusicListIcon from "../../assets/icons/music-list-icon.png";
import PlayerState, {
  breakContext,
  playerStateContext,
} from "../../contexts/PlayerState";

function MusicPlayer({ visible, setMusicPlayerVisible, musicList }) {
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [currentBreak, setCurrentBreak] = useContext(breakContext);
  const { height, width } = useWindowDimensions();
  const [currentPlaying, setCurrentPLaying] = useState({
    _id: 12345,
    name: "",
    url: "",
  });
  const [volume, setVolume] = useState(100);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playerState.playing) {
      localStorage.setItem("music-playing", true);
      return;
    }

    // if (currentBreak && !playerState.playing) {
    //   localStorage.setItem("music-playing", true);
    //   return;
    // }

    localStorage.removeItem("music-playing");
  }, [playerState.playing, currentBreak]);
  const handleOnMusicSelect = (m) => {
    if (m === "stop") {
      console.log("hereere");
      // setPlaying(false);
      setCurrentPLaying({
        _id: 12345,
        name: "",
        url: "",
      });
      localStorage.removeItem("music-playing");
      return;
    }

    setCurrentPLaying(m);
    localStorage.setItem("music-playing", true);
    // setPlaying(true);
  };
  const onVolumeChange = (e) => {
    // volume needs to be between 0 and 1
    setVolume(e / 100);
  };
  // const onPlayPause = () => {
  //   setPlaying((prev) => !prev);
  // };
  return (
    <div
      className="music-player-modal-container"
      style={{ display: visible ? "flex" : "none" }}
    >
      {console.log("======================================>", currentPlaying)}
      <CloseOutlined
        onClick={() => setMusicPlayerVisible(false)}
        style={{
          color: "rgb(255, 255, 255)",
          top: "20px",
          position: "absolute",
          fontSize: "30px",
          right: "50px",
        }}
      />
      <ReactPlayer
        width="100%"
        height="100px"
        url={`${process.env.REACT_APP_SERVER}/uploads/${currentPlaying.url}`}
        style={{ outline: "none", border: "none", display: "none" }}
        playing={localStorage.getItem("music-playing")}
        controls={false}
        volume={volume}
        loop={true}
      />
      <div className="music-player-slider-container">
        <img src={MuteMusicIcon} alt="" />
        <Slider
          value={volume * 100}
          min={0}
          max={100}
          style={{ width: "70%", display: "inline-block" }}
          onChange={onVolumeChange}
          onAfterChange={onVolumeChange}
          tipFormatter={(v) => `${v}%`}
        />
        <img src={MusicIcon} alt="" />
      </div>
      <div className="music-player-modal-container--list">
        <img src={MusicListIcon} alt="music-list-icon" />{" "}
        <h3 className="font-paragraph-white">Choose your mood</h3>
        {/* todo do later */}
        {/* <Scrollbars style={{ minHeight: "100px" }}>
          <div className="music-player-modal-container--list-files">
            <div key={1234} onClick={() => handleOnMusicSelect("stop")}>
              <span
                style={{
                  color:
                    currentPlaying._id !== 12345
                      ? "#fff"
                      : "var(--color-orange)",
                  transform:
                    currentPlaying._id !== 12345 ? "scale(1)" : "scale(1.02)",
                }}
                className="font-paragraph-white"
              >
                <CustomerServiceOutlined /> No Music
              </span>
            </div>
            {musicList.map((m) => (
              <div key={m._id} onClick={() => handleOnMusicSelect(m)}>
                <span
                  className="font-paragraph-white"
                  style={{
                    color:
                      currentPlaying._id === m._id
                        ? "var(--color-orange)"
                        : "#fff",
                    transform:
                      currentPlaying._id === m._id ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <CustomerServiceOutlined /> {m.name}
                </span>
              </div>
            ))}
          </div>
        </Scrollbars> */}
      </div>
    </div>
    // </Modal>
  );
}

export default MusicPlayer;
