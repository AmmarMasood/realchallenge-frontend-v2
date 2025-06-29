import React from "react";
import PlayerState from "../../../../contexts/PlayerState";
import Workout from "../Workout/Workout";
import { useBrowserEvents } from "../../../../helpers/useBrowserEvents";

function VideoCreator({ workoutInfo, handleOnBackToBasicInformation }) {
  const { reloadWithoutConfirmation } = useBrowserEvents({
    enableBeforeUnloadConfirm: true,
    hasUnsavedChanges: true,
    enableBackForwardWarning: true,
    backForwardMessage:
      "You have unsaved changes. Are you sure you want to leave?",
    confirmMessage: "Any unsaved work will be lost. Continue?",
    onPopState: (e) => {
      console.log("Navigation detected", e);
    },
    onBeforeUnload: (e) => {
      console.log("Page is about to unload");
    },
    onPageHide: (e) => {
      console.log("Page hidden, persisted:", e.persisted);
    },
    // REMOVE onPopState if you want simple behavior
    // The hook now handles back navigation internally
    onVisibilityChange: (visibilityState) => {
      console.log("Tab visibility changed:", visibilityState);
      if (visibilityState === "hidden") {
        // Pause animations, save progress, etc.
      } else {
        // Resume activities
      }
    },
  });
  return (
    <PlayerState>
      <Workout />
    </PlayerState>
  );
}

export default VideoCreator;
