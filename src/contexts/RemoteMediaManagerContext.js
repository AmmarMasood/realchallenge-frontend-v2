import React, { createContext, useContext, useState } from "react";

const RemoteMediaManagerContext = createContext();

export function RemoteMediaManagerProvider({ children }) {
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);

  return (
    <RemoteMediaManagerContext.Provider
      value={{
        mediaManagerVisible,
        setMediaManagerVisible,
        mediaManagerType,
        setMediaManagerType,
        mediaManagerActions,
        setMediaManagerActions,
      }}
    >
      {children}
    </RemoteMediaManagerContext.Provider>
  );
}

export function useRemoteMediaManager() {
  return useContext(RemoteMediaManagerContext);
}
