// ChallengeCreator.js
import React, { useEffect } from "react";
import BasicInformation from "../../components/Admin/V2/Challenge/BasicInformation";
import VideoCreator from "../../components/Admin/V2/Challenge/VideoCreator";
import {
  ChallengeProvider,
  useChallenge,
} from "../../contexts/ChallengeCreatorV2";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function WorkoutStudio() {
  const { showVideoCreator } = useChallenge();

  useEffect(() => {
    // if showVideCreator is false send user to /admin/v2/challenge-studio
    if (!showVideoCreator) {
      window.location.href = "/admin/v2/challenge-studio";
    }
  }, []);

  return (
    <ChallengeProvider>
      <DndProvider backend={HTML5Backend}>
        <VideoCreator />
      </DndProvider>
    </ChallengeProvider>
  );
}

export default WorkoutStudio;
