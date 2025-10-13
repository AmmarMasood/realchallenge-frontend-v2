// ChallengeContext.js
import React, { createContext, useState, useContext } from "react";
import { v4 } from "uuid";

const ChallengeContext = createContext();

export function ChallengeProvider({ children }) {
  const [showVideoCreator, setShowVideoCreator] = useState(false);
  const [usereDtails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [challengeName, setChallengeName] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [difficulty, setDifficulty] = useState("high");
  const [duration, setDuration] = useState(0);
  const [openPopupPlayer, setOpenPopupPlayer] = useState(false);
  const [pack, setPack] = useState("");
  const [points, setPoints] = useState(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [result, setResult] = useState("");
  const [selectedFitnessInterest, setSelectedFitnessInterest] = useState([]);
  const [selectedBodyFocus, setSelectedBodyFocus] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [seletedTrainers, setSelectedTrainers] = useState([]);
  // alls
  const [allTrainers, setAllTrainers] = useState([]);
  const [allFitnessInterests, setAllFitnessInterests] = useState([]);
  const [allBodyFocus, setAllBodyFocus] = useState([]);
  const [showChangePanel, setShowChangePanel] = useState([]);
  const [allGoals, setAllGoals] = useState([
    {
      _id: "get-fit",
      name: "Get Fit",
    },
    {
      _id: "lose-weight",
      name: "Lose Weight",
    },
    {
      _id: "gain-muscle",
      name: "Gain Muscle",
    },
  ]);
  const [weeks, setWeeks] = useState([]);
  const [selectedWorkoutForStudioId, setSelectedWorkoutForStudioId] = useState(
    {}
  );
  const [allExercises, setAllExercises] = useState([]);
  const [isFirstRender, setIsFirstRender] = useState(false);
  const [musics, setMusics] = useState([]);

  const populateChallengeInfo = (challengeData) => {
    if (!challengeData) return;

    // Set basic challenge details
    setChallengeName(challengeData.challengeName || "");
    setChallengeDescription(challengeData.description || "");
    setDifficulty(challengeData.difficulty || "high");
    setDuration(challengeData.duration || 0);
    setPoints(challengeData.points || null);

    // Set pricing details
    setPack(challengeData.access[0] || "");
    setCustomPrice(challengeData.price || 0);

    // Set media
    setThumbnail(
      challengeData.thumbnailLink ? { link: challengeData.thumbnailLink } : ""
    );
    setVideoThumbnail(
      challengeData.videoThumbnailLink
        ? { link: challengeData.videoThumbnailLink }
        : ""
    );

    // Set challenge results
    setResult(challengeData.results || "");

    // Set categories and focuses
    setSelectedFitnessInterest(challengeData.trainersFitnessInterest || []);
    setSelectedBodyFocus(challengeData.body || []);
    setSelectedGoals(
      challengeData.challengeGoals
        ? challengeData.challengeGoals.map((c) => ({
            _id: c,
            name: c,
          }))
        : []
    );

    // Set trainers
    setSelectedTrainers(challengeData.trainers || []);

    const customWeeks = challengeData.weeks.map((week) => ({
      ...week,
      id: v4(),
      workouts: week.workouts.map((workout) => {
        const introExercise = {
          break: 5,
          createdAt: workout.createdAt,
          exerciseGroupName: "Introduction",
          exerciseLength: parseInt(workout.introVideoLength || 10),
          title: "Introduction to workout",
          videoURL: workout.introVideoLink,
          voiceOverLink: "",
          videoThumbnailURL: workout.introVideoThumbnailLink,
        };
        workout.exercises.unshift(introExercise);
        return {
          ...workout,
          id: v4(),
          renderWorkout: workout.isRendered,
          infoFile: workout.infoFile && {
            name: workout.infoTitle || "Workout Info",
            link: workout.infoFile || "",
          },
          equipments: workout.relatedEquipments || [],
          exercises: workout.exercises.map((exercise, index) => {
            // skip first
            if (index === 0) {
              return {
                ...exercise,
                id: v4(),
              };
            }
            if (workout.isRendered) {
              const exs =
                allExercises.length > 0 &&
                allExercises.find((ex) => ex._id === exercise.exerciseId);

              return {
                break: parseInt(exercise.break) || 0,
                createdAt: workout.createdAt,
                exerciseGroupName: exercise.groupName,
                exerciseLength: parseInt(exercise.exerciseLength || 0),
                title: exs?.title,
                videoURL: exs?.videoURL,
                voiceOverLink: exs?.voiceOverLink,
                videoThumbnailURL: exs?.videoThumbnailURL,
                exerciseId: exercise.exerciseId,
                id: v4(),
              };
            } else {
              return {
                break: 0,
                createdAt: "",
                exerciseGroupName: "",
                exerciseLength: 0,
                voiceOverLink: "",
                title: exercise.renderedWorkoutExerciseName,
                videoURL: exercise.renderedWorkoutExerciseVideo,
                videoThumbnailURL: exercise.renderedWorkoutExerciseThumbnail,
                id: v4(),
              };
            }
          }),
        };
      }),
    }));
    console.log("customWeeks 1", challengeData.weeks);
    console.log("customWeeks", customWeeks);
    // Set weeks
    setWeeks(challengeData.weeks ? customWeeks : []);

    // Set entire challenge object for reference
    setChallengeInfo(
      challengeData.informationList
        ? challengeData.informationList.map((t) => t.info)
        : []
    );
    // set musics
    setMusics(
      challengeData.music
        ? challengeData.music.map((m) => ({
            ...m,
            id: v4(),
            name: m.name,
            link: m.url,
          }))
        : []
    );
  };

  return (
    <ChallengeContext.Provider
      value={{
        showVideoCreator,
        setShowVideoCreator,
        usereDtails,
        setUserDetails,
        loading,
        setLoading,
        thumbnail,
        setThumbnail,
        videoThumbnail,
        setVideoThumbnail,
        challengeName,
        setChallengeName,
        challengeDescription,
        setChallengeDescription,
        difficulty,
        setDifficulty,
        duration,
        setDuration,
        openPopupPlayer,
        setOpenPopupPlayer,
        pack,
        setPack,
        customPrice,
        setCustomPrice,
        challengeInfo,
        setChallengeInfo,
        result,
        setResult,
        selectedFitnessInterest,
        setSelectedFitnessInterest,
        selectedBodyFocus,
        setSelectedBodyFocus,
        selectedGoals,
        setSelectedGoals,
        seletedTrainers,
        setSelectedTrainers,
        allTrainers,
        setAllTrainers,
        allFitnessInterests,
        setAllFitnessInterests,
        allBodyFocus,
        setAllBodyFocus,
        showChangePanel,
        setShowChangePanel,
        allGoals,
        setAllGoals,
        weeks,
        setWeeks,
        musics,
        setMusics,
        selectedWorkoutForStudioId,
        setSelectedWorkoutForStudioId,
        populateChallengeInfo,
        allExercises,
        setAllExercises,
        isFirstRender,
        setIsFirstRender,
        points,
        setPoints,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  return useContext(ChallengeContext);
}
