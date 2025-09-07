import React, { useEffect, useContext } from "react";
import Countdown from "react-countdown";
import { Progress } from "antd";
import tune from "../../assets/music/break-end.wav";
import {
  breakContext,
  playerStateContext,
  timerVisibleContext,
} from "../../contexts/PlayerState";

function BreakTimer({ exercise, nextExerciseTitle, moveToNextExercise, isLastExercise, onWorkoutComplete }) {
  const [currentBreak, setCurrentBreak] = useContext(breakContext);
  const [playerState, setPlayerState] = useContext(playerStateContext);
  const [timerVisible, setTimerVisible] = useContext(timerVisibleContext);

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

  const playAudio = () => {
    new Audio(tune).play();
  };

  const CountdownDisplay = ({ hours, minutes, seconds, total }) => {
    const totalSeconds = total / 1000;
    const givenSeconds = (exercise?.break * 1000) / 1000;
    const progress = ((givenSeconds - totalSeconds) / givenSeconds) * 100;
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
                {exercise?.exerciseGroupName === "Introduction"
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
  };

  return (
    <div className="break-layout-for-player">
      <Countdown
        date={Date.now() + (exercise?.break || 0) * 1000}
        renderer={CountdownDisplay}
        onMount={() => {
          // Don't call moveToNextExercise here - it's likely causing a loop
          // Just ensure the player is paused during the break
          setPlayerState((prevState) => ({ ...prevState, playing: false }));
          console.log("break mounted");
        }}
        onTick={(e) => {
          if (e.seconds === 3) {
            playAudio();
          }
          console.log("tick tick tick mf", e);
        }}
        onComplete={(e) => {
          console.log("timer completed");
          setTimerVisible(false);
          setCurrentBreak(false);
          
          if (isLastExercise) {
            // Last exercise completed, keep video paused and show success popup
            setPlayerState((prevState) => ({ ...prevState, playing: false }));
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
          console.log("break ended");
        }}
      />
    </div>
  );
}

export default React.memo(BreakTimer);
