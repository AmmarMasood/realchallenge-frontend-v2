import React, { useContext, useRef, useEffect } from "react";
import NonRenderedVideoPlayer from "./NonRenderedVideoPlayer";
import RenderedVideoPlayer from "./RenderedVideoPlayer";

var count = 0;

function Player({
  exercise,
  musics,
  moveToNextExercise,
  moveToPrevExercise,
  nextExerciseTitle,
  completed,
  // for full screen player video browser
  workout,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
  challengePageAddress,
  inCreation,
}) {
  return workout.renderWorkout || workout.isRendered ? (
    <div>
      {" "}
      <h1>YES</h1>
      <RenderedVideoPlayer
        exercise={exercise}
        musics={musics}
        moveToNextExercise={moveToNextExercise}
        moveToPrevExercise={moveToPrevExercise}
        nextExerciseTitle={nextExerciseTitle}
        completed={completed}
        // for full screen player video browser
        workout={workout}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        challengePageAddress={challengePageAddress}
        inCreation={inCreation}
      />
    </div>
  ) : (
    <div>
      <h1>NO</h1>
      <NonRenderedVideoPlayer
        exercise={exercise}
        musics={musics}
        moveToNextExercise={moveToNextExercise}
        moveToPrevExercise={moveToPrevExercise}
        nextExerciseTitle={nextExerciseTitle}
        completed={completed}
        // for full screen player video browser
        workout={workout}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        challengePageAddress={challengePageAddress}
      />
    </div>
  );
}

export default Player;
