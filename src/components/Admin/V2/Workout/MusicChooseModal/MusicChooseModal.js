import { Modal } from "antd";
import React, { useEffect } from "react";
import "./MusicChooseModal.css";
import PlayerMusicIcon from "../../../../../assets/icons/player-music-icon.svg";
import AddMusicIcon from "../../../../../assets/icons/add-music-icon.svg";
import DeleteIcon from "../../../../../assets/icons/delete-icon-white.svg";
import RemoteMediaManager from "../../../MediaManager/RemoteMediaManager";
import { v4 } from "uuid";

function MusicChooseModal({ open, setOpen, musics, setMusics }) {
  const [musicsList, setMusicsList] = React.useState([]);
  const [mediaManagerVisible, setMediaManagerVisible] = React.useState(false);
  const [mediaManagerType, setMediaManagerType] = React.useState("musics");
  const [mediaManagerActions, setMediaManagerActions] = React.useState([]);
  const [infoFile, setInfoFile] = React.useState("");

  useEffect(() => {
    if (musics && musics.length > 0) {
      setMusicsList(musics);
    }
  }, [musics]);

  useEffect(() => {
    if (infoFile && infoFile.link) {
      setMusicsList((prev) => [...prev, { id: v4(), ...infoFile }]);
      setInfoFile("");
      setMediaManagerVisible(false);
    }
  }, [infoFile]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveMusic = (e) => {
    e.preventDefault();
    setMusics(musicsList);
    setOpen(false);
  };

  const onBrowseMusicSelect = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("musics");
    setMediaManagerActions([infoFile, setInfoFile]);
  };

  const handleMusicNameChange = (e, id) => {
    console.log("ammar", e.target.value, id);
    const updatedMusicsList = musicsList.map((music) => {
      if (music.id === id) {
        return { ...music, name: e.target.value };
      }
      return music;
    });
    setMusicsList(updatedMusicsList);
  };

  const removeMusic = (id) => {
    const updatedMusicsList = musicsList.filter((music) => music.id !== id);
    setMusicsList(updatedMusicsList);
  };

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={handleClose}
      title=""
      bodyStyle={{
        backgroundColor: "#171e27",
        border: "1px solid #FF950A",
        textAlign: "center",
      }}
    >
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <div className="music-selector__header">
        <img src={PlayerMusicIcon} alt="img" className="music-selector__icon" />
        <h2 className="music-selector__title">
          <span> Select Music</span>
          <span className="music-selector__subtitle">
            Please add the background music
          </span>
        </h2>
      </div>

      <div className="music-selector__list">
        {musicsList.map((music, index) => (
          <div key={index} className={`music-selector__item `}>
            <div className="music-selector__inputbox">
              <input
                value={music.name}
                onChange={(e) => handleMusicNameChange(e, music.id)}
              />
              <span>
                Music Link:{" "}
                {`${process.env.REACT_APP_SERVER}/uploads/${music.link}`}
              </span>
            </div>
            <img
              src={DeleteIcon}
              alt="delete-music"
              style={{
                cursor: "pointer",
              }}
              onClick={() => removeMusic(music.id)}
            />
          </div>
        ))}
        <div
          className={`music-selector__item `}
          onClick={onBrowseMusicSelect}
          style={{
            cursor: "pointer",
          }}
        >
          <p>Browse...</p>
          <img src={AddMusicIcon} alt="add-music" />
        </div>
      </div>

      <button className="music-selector__next-btn" onClick={handleSaveMusic}>
        Save
      </button>
    </Modal>
  );
}

export default MusicChooseModal;
