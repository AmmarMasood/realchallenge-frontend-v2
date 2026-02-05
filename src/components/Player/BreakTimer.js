import React, { useEffect, useContext, useMemo, useRef, useCallback } from "react";
import Countdown from "react-countdown";
import { Progress } from "antd";
import tune from "../../assets/music/break-end.wav";
import {
  breakContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";

function BreakTimer({ exercise, nextExerciseTitle, moveToNextExercise, isLastExercise, onWorkoutComplete }) {
  const [, setCurrentBreak] = useContext(breakContext);
  const [, setPlayerState] = useContext(playerStateContext);
  const [, setTimerVisible] = useContext(timerVisibleContext);

  // Store the target date ONCE when component mounts - this prevents re-calculation on re-renders
  const targetDate = useMemo(() => {
    return Date.now() + (exercise?.break || 0) * 1000;
  }, []); // Empty deps = only calculate once on mount

  // Store break duration for the renderer
  const breakDuration = exercise?.break || 0;
  const exerciseGroupName = exercise?.exerciseGroupName;

  // Use ref to track if audio has been played for this break
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    // Only run this once when the component mounts
    if (!exercise?.break) {
      moveToNextExercise();
      setTimerVisible(false);
      setCurrentBreak(false);
    } else {
      // Only set currentBreak to true on mount if we're actually showing a break
      setCurrentBreak(true);
    }
  }, []);

  const playAudio = useCallback(() => {
    // Create new audio instance each time for reliable playback
    const audio = new Audio(tune);
    audio.play().catch((err) => console.log("Audio play failed:", err));
  }, []);

  const handleMount = useCallback(() => {
    // Pause the player during the break
    setPlayerState((prevState) => ({ ...prevState, playing: false }));
    // Reset audio played flag when timer mounts
    audioPlayedRef.current = false;
  }, [setPlayerState]);

  const handleTick = useCallback((e) => {
    // Play the countdown audio once when 3 seconds remain
    // The audio file contains the full "beep beep beep beeeep" pattern
    if (e.seconds === 3 && !audioPlayedRef.current) {
      audioPlayedRef.current = true;
      playAudio();
    }
  }, [playAudio]);

  const handleComplete = useCallback(() => {
    setTimerVisible(false);
    setCurrentBreak(false);

    if (isLastExercise) {
      // Last exercise completed, update progress first then show success popup
      setPlayerState((prevState) => ({ ...prevState, playing: false }));
      moveToNextExercise(); // This updates backend progress
      if (onWorkoutComplete) {
        setTimeout(() => {
          onWorkoutComplete();
        }, 100);
      }
    } else {
      // Move to next exercise and resume playing
      moveToNextExercise();
      setPlayerState((prevState) => ({ ...prevState, playing: true }));
    }
  }, [isLastExercise, moveToNextExercise, onWorkoutComplete, setCurrentBreak, setPlayerState, setTimerVisible]);

  // Memoized renderer to prevent re-creation on each render
  const CountdownDisplay = useCallback(({ total }) => {
    const totalSeconds = Math.round(total / 1000);
    const progress = ((breakDuration - totalSeconds) / breakDuration) * 100;
    return (
      <div className="inner-layout-break">
        <div style={{ width: "30%", textAlign: "center" }}>
          <span style={{ marginTop: "10px" }}>
            <span className="inner-layout-break-totalsecs">{totalSeconds}</span>
            <span className="inner-layout-break-sec">Sec</span>
          </span>
          <Progress percent={progress} showInfo={false} />
        </div>
        <div className="inner-layout-break-text">
          {nextExerciseTitle ? (
            <>
              <span>
                {exerciseGroupName === "Introduction"
                  ? "First Exercise"
                  : "Next Exercise"}
              </span>{" "}
              <span>{nextExerciseTitle}</span>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }, [breakDuration, nextExerciseTitle, exerciseGroupName]);

  return (
    <div className="break-layout-for-player">
      <Countdown
        key={targetDate}
        date={targetDate}
        renderer={CountdownDisplay}
        onMount={handleMount}
        onTick={handleTick}
        onComplete={handleComplete}
      />
    </div>
  );
}

export default React.memo(BreakTimer);
