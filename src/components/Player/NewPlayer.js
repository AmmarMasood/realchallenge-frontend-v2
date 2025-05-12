import React, { useState, useContext, useRef } from "react";
import { UnorderedListOutlined } from "@ant-design/icons";
import { DefaultPlayer as Video } from "react-html5video";
import MusicPlayer from "./MusicPlayer";
import "../../assets/video-player-design.css";
// import "react-html5video/dist/styles.css";

import BreakTimer from "./BreakTimer";
import { timerVisibleContext } from "../../contexts/PlayerState";
// import "dist/ReactHtml5Video.css";

function NewPlayer({ exercise, musics, moveToNextExercise }) {
  const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useContext(timerVisibleContext);
  const [playVideo, setPlayVideo] = useState(false);
  const playerRef = useRef(null);
  // music player
  const handleMusicPlayerOpen = () => {
    setMusicPlayerVisible(true);
  };

  const handleMusicPlayerClose = () => {
    setMusicPlayerVisible(false);
  };

  return (
    <div className="player-wrapper" style={{ position: "relative" }}>
      <Video
        ref={playerRef}
        key={exercise._id}
        style={{
          width: "100%",
          height: "100%",
        }}
        controls={["PlayPause", "Seek", "Time", "Volume", "Fullscreen"]}
        autoPlay={playVideo}
        paused={!playVideo}
        preload={true}
        onEnded={() => {
          console.log("done");
          setPlayVideo(false);
          setTimerVisible(true);
        }}
        onPause={() => {
          console.log("pause");
          setPlayVideo(false);
        }}
        onPlay={() => {
          console.log("play");
          setPlayVideo(true);
        }}
      >
        <source
          src={
            exercise.videoURL
              ? `${process.env.REACT_APP_SERVER}/uploads/${exercise.videoURL}`
              : ""
          }
          type="video/mp4"
          onPlay={() => console.log("asd")}
        />
      </Video>
      <UnorderedListOutlined
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          fontSize: "20px",
          color: "white",
        }}
        onClick={() => (playerRef.current.state.paused = false)}
      />

      {/* Break Timer */}
      {timerVisible && (
        <BreakTimer
          moveToNextExercise={moveToNextExercise}
          exercise={exercise}
          timerVisible={timerVisible}
          setTimerVisible={setTimerVisible}
          // set={startVideoPlayer}
          // pauseVideoPlayer={pauseVideoPlayer}
        />
      )}
      {/* music player */}

      <div>
        <MusicPlayer
          musicList={musics}
          visible={musicPlayerVisible}
          onCancel={handleMusicPlayerClose}
          onOpen={handleMusicPlayerOpen}
        />
      </div>
    </div>
  );
}

export default NewPlayer;

// import React, { useState, useContext, useRef } from "react";
// import MusicPlayer from "./MusicPlayer";
// import "../../assets/video-player-design.css";
// import "../../assets/player.css";
// // import "react-html5video/dist/styles.css";
// import ReactPlayer from "react-player";
// import BreakTimer from "./BreakTimer";
// import { playerStateContext } from "../../contexts/PlayerState";
// // import "dist/ReactHtml5Video.css";

// function Player({ exercise, musics, moveToNextExercise }) {
//   const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
//   const [timerVisible, setTimerVisible] = useState(false);
//   const [playVideo, setPlayVideo] = useState(false);
//   const [playerState, setPlayerState] = useContext(playerStateContext);

//   const playerRef = useRef(null);
//   // music player
//   const handleMusicPlayerOpen = () => {
//     setMusicPlayerVisible(true);
//   };

//   const handleMusicPlayerClose = () => {
//     setMusicPlayerVisible(false);
//   };

//   return (
//     <div className="player-wrapper" style={{ position: "relative" }}>
//       <ReactPlayer
//         className="react-player"
//         playing={playerState.playing}
//         url={exercise.videoURL ? exercise.videoURL : ""}
//         width="100%"
//         height="100%"
//         controls="true"
//         onEnded={() => {
//           console.log("done");
//           setPlayerState({ ...playerState, playing: false });
//           setTimerVisible(true);
//         }}
//       />
//       {/* Break Timer */}
//       {console.log("play vide", playerState)}
//       {timerVisible && (
//         <BreakTimer
//           moveToNextExercise={moveToNextExercise}
//           exercise={exercise}
//           timerVisible={timerVisible}
//           setTimerVisible={setTimerVisible}
//         />
//       )}
//       {/* music player */}

//       <div>
//         <MusicPlayer
//           musicList={musics}
//           visible={musicPlayerVisible}
//           onCancel={handleMusicPlayerClose}
//           onOpen={handleMusicPlayerOpen}
//         />
//       </div>
//     </div>
//   );
// }

// export default Player;
