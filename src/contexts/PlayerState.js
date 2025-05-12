import React, { useState } from "react";

export const playerStateContext = React.createContext();
export const playerFullscreenContext = React.createContext();
export const breakContext = React.createContext();
export const timerVisibleContext = React.createContext();
export const exerciseWorkoutTimeTrackContext = React.createContext();


const PlayerState = ({ children }) => {
  // new stuff starts
  const [playerState, setPlayerState] = useState({
    runBreakTimer: true,
    playing: false,
    muted: false,
    volume: 0.5,
    progress: {},
    loading: false,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [currentBreak, setCurrentBreak] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useState({current: 0, total: 0});
  return (
    <playerStateContext.Provider value={[playerState, setPlayerState]}>
      <playerFullscreenContext.Provider value={[fullscreen, setFullscreen]}>
        <breakContext.Provider value={[currentBreak, setCurrentBreak]}>
          <timerVisibleContext.Provider value={[timerVisible, setTimerVisible]}>
            <exerciseWorkoutTimeTrackContext.Provider value={[exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack]}>
            {children}
            </exerciseWorkoutTimeTrackContext.Provider>
          </timerVisibleContext.Provider>
        </breakContext.Provider>
      </playerFullscreenContext.Provider>
    </playerStateContext.Provider>
  );
};

export default PlayerState;
