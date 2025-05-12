// ChallengeCreator.js
import React from "react";
import BasicInformation from "../../components/Admin/V2/Challenge/BasicInformation";
import VideoCreator from "../../components/Admin/V2/Challenge/VideoCreator";
import {
  ChallengeProvider,
  useChallenge,
} from "../../contexts/ChallengeCreatorV2";

function ChallengeContent() {
  const { showVideoCreator } = useChallenge();

  return showVideoCreator ? <VideoCreator /> : <BasicInformation />;
}

function ChallengeCreator() {
  return (
    <ChallengeProvider>
      <ChallengeContent />
    </ChallengeProvider>
  );
}

export default ChallengeCreator;
