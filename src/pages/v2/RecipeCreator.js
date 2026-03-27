import React from "react";
import BasicInformation from "../../components/Admin/V2/Recipe/BasicInformation";
import { RecipeProvider } from "../../contexts/RecipeCreatorV2";
import { useRemoteMediaManager } from "../../contexts/RemoteMediaManagerContext";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";

function RecipeCreator() {
  const {
    mediaManagerVisible,
    setMediaManagerVisible,
    mediaManagerType,
    mediaManagerActions,
  } = useRemoteMediaManager();
  return (
    <RecipeProvider>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <BasicInformation />
    </RecipeProvider>
  );
}

export default RecipeCreator;
