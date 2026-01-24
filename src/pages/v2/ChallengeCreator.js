// ChallengeCreator.js
import React from "react";
import BasicInformation from "../../components/Admin/V2/Challenge/BasicInformation";
import VideoCreator from "../../components/Admin/V2/Challenge/VideoCreator";
import {
  ChallengeProvider,
  useChallenge,
} from "../../contexts/ChallengeCreatorV2";
import { DndProvider } from "react-dnd";
import { getDndBackend, isTouchDevice, touchBackendOptions } from "../../helpers/DndWrapper";
import { useRemoteMediaManager } from "../../contexts/RemoteMediaManagerContext";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";

function ChallengeContent() {
  const { showVideoCreator } = useChallenge();
  const backend = getDndBackend();
  const options = isTouchDevice() ? touchBackendOptions : undefined;

  return showVideoCreator ? (
    <DndProvider backend={backend} options={options}>
      <VideoCreator />
    </DndProvider>
  ) : (
    <DndProvider backend={backend} options={options}>
      <BasicInformation />
    </DndProvider>
  );
}

function ChallengeCreator() {
  const {
    mediaManagerVisible,
    setMediaManagerVisible,
    mediaManagerType,
    mediaManagerActions,
  } = useRemoteMediaManager();
  return (
    <ChallengeProvider>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <ChallengeContent />
    </ChallengeProvider>
  );
}

export default ChallengeCreator;
