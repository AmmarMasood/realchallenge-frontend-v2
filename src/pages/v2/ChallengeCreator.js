// ChallengeCreator.js
import React from "react";
import BasicInformation from "../../components/Admin/V2/Challenge/BasicInformation";
import VideoCreator from "../../components/Admin/V2/Challenge/VideoCreator";
import {
  ChallengeProvider,
  useChallenge,
} from "../../contexts/ChallengeCreatorV2";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function ChallengeContent() {
  const { showVideoCreator } = useChallenge();

  return showVideoCreator ? (
    <DndProvider backend={HTML5Backend}>
      <VideoCreator />
    </DndProvider>
  ) : (
    <DndProvider backend={HTML5Backend}>
      <BasicInformation />
    </DndProvider>
  );
}

function ChallengeCreator() {
  return (
    <ChallengeProvider>
      <ChallengeContent />
    </ChallengeProvider>
  );
}

export default ChallengeCreator;
