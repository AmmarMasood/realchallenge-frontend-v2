import React from "react";
import PlayerState from "../../../../contexts/PlayerState";
import Workout from "../Workout/Workout";
import { useBrowserEvents } from "../../../../helpers/useBrowserEvents";

function VideoCreator({ workoutInfo, handleOnBackToBasicInformation }) {
  const { reloadWithoutConfirmation } = useBrowserEvents({
    enableBeforeUnloadConfirm: true,
    hasUnsavedChanges: true,
    onBeforeUnload: (e) => {
      console.log("Page is about to unload");
      // Perform any cleanup or save operations
    },
    onPageHide: (e) => {
      console.log("Page hidden, persisted:", e.persisted);
      // Save user data, pause timers, etc.
    },
    onPopState: (e) => {
      console.log("Browser navigation detected");
      // Handle browser back/forward
      if (window.confirm("Any unchanged saves will be lost. Continue?")) {
        // Allow navigation
      } else {
        // Optionally push state again to "cancel" navigation
        window.history.pushState({}, "", window.location.href);
      }
    },
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
