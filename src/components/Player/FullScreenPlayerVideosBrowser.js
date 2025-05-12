import React, { useContext } from "react";
import "../../assets/FullScreenPlayerVideoBrowser.css";
import {
  playerFullscreenContext,
  playerStateContext,
} from "../../contexts/PlayerState";
import PlayerVideoBrowser from "./PlayerVideoBrowser";

function FullScreenPlayerVideosBrowser({
  showVideos,
  workout,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
}) {
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [fullscreen, setFullscreen] = useContext(playerFullscreenContext);
  return showVideos ? (
    <div className="fspvb-container">
      {/* <h1 style={{ color: "white" }}>fAGGOT</h1> */}
      <PlayerVideoBrowser
        fullscreen={fullscreen}
        workout={workout}
        playerState={playerState}
        setPlayerState={setPlayerState}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        fromFullScreen={true}
      />
    </div>
  ) : (
    ""
  );
}

export default FullScreenPlayerVideosBrowser;
