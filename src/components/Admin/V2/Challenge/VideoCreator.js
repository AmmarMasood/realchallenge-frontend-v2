import React from "react";
import PlayerState from "../../../../contexts/PlayerState";
import Workout from "../Workout/Workout";
import { useBrowserEvents } from "../../../../helpers/useBrowserEvents";

function VideoCreator({ workoutInfo, handleOnBackToBasicInformation }) {
  const { reloadWithoutConfirmation } = useBrowserEvents({
    enableBeforeUnloadConfirm: true,
    hasUnsavedChanges: true,
    backForwardMessage:
      "You have unsaved changes. Are you sure you want to leave?",
    confirmMessage: "Any unsaved work will be lost. Continue?",
    onPopState: (e) => {
      console.log("Navigation detected", e);
    },
    onBeforeUnload: () => {
      console.log("Page is about to unload");
    },
    onPageHide: (e) => {
      console.log("Page hidden, persisted:", e.persisted);
    },
    onVisibilityChange: (state) => {
      console.log("Tab visibility changed:", state);
    },
  });

  return (
    <PlayerState>
      <Workout />
    </PlayerState>
  );
}

export default VideoCreator;
