import React, { useContext, useRef, useEffect } from "react";
import NonRenderedVideoPlayer from "./NonRenderedVideoPlayer";
import RenderedVideoPlayer from "./RenderedVideoPlayer";
import AudioWorkoutPlayer from "./AudioWorkoutPlayer";

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
  onWorkoutComplete,
}) {
  // The audio session of an audio workout. The intro video (exercise 0, no
  // isAudio flag) still goes through the simple video player below.
  return exercise?.isAudio ? (
    <div>
      <AudioWorkoutPlayer
        exercise={exercise}
        moveToNextExercise={moveToNextExercise}
        moveToPrevExercise={moveToPrevExercise}
        // for full screen player video browser
        workout={workout}
        setExerciseForHelpModal={setExerciseForHelpModal}
        setOpenHelpModal={setOpenHelpModal}
        setCurrentExercise={setCurrentExercise}
        currentExercise={currentExercise}
        challengePageAddress={challengePageAddress}
      />
    </div>
  ) : workout.renderWorkout || workout.isRendered ? (
    <div>
      {" "}
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
        onWorkoutComplete={onWorkoutComplete}
      />
    </div>
  ) : (
    <div>
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
        onWorkoutComplete={onWorkoutComplete}
      />
    </div>
  );
}

export default Player;
