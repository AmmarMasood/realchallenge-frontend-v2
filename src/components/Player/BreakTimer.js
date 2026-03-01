import React, { useEffect, useContext, useMemo, useRef, useCallback } from "react";
import Countdown from "react-countdown";
import { Progress } from "antd";
import { playBreakEnd, pauseBreakAudio, resumeBreakAudio, stopBreakAudio, isBreakAudioPlaying, onBreakAudioEnded } from "../../utils/audioHelper";
import {
  breakContext,
  breakPausedContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";
import { T } from "../Translate";

function BreakTimer({ exercise, nextExerciseTitle, moveToNextExercise, isLastExercise, onWorkoutComplete, isFirstExercise }) {
  const [, setCurrentBreak] = useContext(breakContext);
  const [, setPlayerState] = useContext(playerStateContext);
  const [, setTimerVisible] = useContext(timerVisibleContext);
  const [breakPaused] = useContext(breakPausedContext);

  const countdownRef = useRef(null);

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

  // Pause/resume countdown and audio together
  useEffect(() => {
    const api = countdownRef.current?.getApi?.();
    if (!api) return;
    if (breakPaused) {
      api.pause();
      pauseBreakAudio();
    } else {
      api.start();
      resumeBreakAudio();
    }
  }, [breakPaused]);

  // Stop audio when break is skipped (component unmounts)
  useEffect(() => {
    return () => stopBreakAudio();
  }, []);

  const playAudio = useCallback(() => {
    playBreakEnd();
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

  const proceedAfterBreak = useCallback(() => {
    setTimerVisible(false);
    setCurrentBreak(false);

    if (isLastExercise) {
      setPlayerState((prevState) => ({ ...prevState, playing: false }));
      moveToNextExercise();
      if (onWorkoutComplete) {
        setTimeout(() => {
          onWorkoutComplete();
        }, 100);
      }
    } else {
      moveToNextExercise();
      setPlayerState((prevState) => ({ ...prevState, playing: true }));
    }
  }, [isLastExercise, moveToNextExercise, onWorkoutComplete, setCurrentBreak, setPlayerState, setTimerVisible]);

  const handleComplete = useCallback(() => {
    if (isBreakAudioPlaying()) {
      onBreakAudioEnded(proceedAfterBreak);
    } else {
      proceedAfterBreak();
    }
  }, [proceedAfterBreak]);

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
                {isFirstExercise
                  ? <T>player.first_exercise</T>
                  : <T>player.next_exercise</T>}
              </span>{" "}
              <span>{nextExerciseTitle}</span>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }, [breakDuration, nextExerciseTitle, isFirstExercise]);

  return (
    <div className="break-layout-for-player">
      <Countdown
        ref={countdownRef}
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
