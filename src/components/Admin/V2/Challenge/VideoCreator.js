import React from "react";
import PlayerState from "../../../../contexts/PlayerState";
import Workout from "../Workout/Workout";

function VideoCreator({ workoutInfo, handleOnBackToBasicInformation }) {
  return (
    <PlayerState>
      <Workout />
    </PlayerState>
  );
}

export default VideoCreator;
