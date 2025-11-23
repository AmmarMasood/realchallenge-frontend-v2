import React, { useContext, useRef, useEffect } from "react";

import Carousel from "react-multi-carousel";
import VideoThumbnail from "react-video-thumbnail";
import { notification } from "antd";
import SquarePT from "../../assets/icons/player-video-browser-whistle-icon.svg";
import SquarePlay from "../../assets/icons/player-video-browser-play-icon.svg";
import { exerciseWorkoutTimeTrackContext } from "../../contexts/PlayerState";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop3: {
    breakpoint: { max: 3000, min: 1600 },
    items: 4,
  },
  desktop2: {
    breakpoint: { max: 1600, min: 1350 },
    items: 3.5,
  },
  desktop: {
    breakpoint: { max: 1350, min: 1100 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1100, min: 850 },
    items: 2.5,
  },
  mobile2: {
    breakpoint: { max: 850, min: 600 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 600, min: 0 },
    items: 1,
  },
};

function PlayerVideoBrowser({
  workout,
  playerState,
  setPlayerState,
  setExerciseForHelpModal,
  setOpenHelpModal,
  setCurrentExercise,
  currentExercise,
  fullscreen,
  fromFullScreen,
}) {
  const [exerciseWorkoutTimeTrack, setExerciseWorkoutTimeTrack] = useContext(
    exerciseWorkoutTimeTrackContext
  );
  const carouselContainerRef = useRef(null);

  // Auto-scroll to currently playing exercise
  useEffect(() => {
    if (currentExercise && currentExercise.index >= 0 && carouselContainerRef.current) {
      setTimeout(() => {
        // Find the current exercise card element
        const currentExerciseElement = carouselContainerRef.current?.querySelector(
          `[data-exercise-index="${currentExercise.index}"]`
        );

        if (currentExerciseElement) {
          // Scroll the element into view with smooth behavior
          currentExerciseElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
          });
        }
      }, 50);
    }
  }, [currentExercise.index]);

  const handleOpenExerciseForHelp = (e) => {
    setPlayerState({ ...playerState, playing: false, muted: true });
    setExerciseForHelpModal(e);
    setOpenHelpModal(true);
  };

  const handleChangeExercise = (i) => {
    const selectedExercise = workout.exercises[i];

    // Validate intro exercise has duration if it has a video
    if (
      i === 0 &&
      selectedExercise.videoURL &&
      (!selectedExercise.exerciseLength || selectedExercise.exerciseLength <= 0)
    ) {
      notification.error({
        message: "Duration Required",
        description:
          "Please enter a duration for the intro exercise before playing it.",
        placement: "topRight",
      });
      return;
    }

    setCurrentExercise({
      exercise: selectedExercise,
      index: i,
      completed: Math.round((i / (workout.exercises.length - 1)) * 100),
    });
    setPlayerState({ ...playerState, playing: false, muted: false });
    updateExerciseWorkoutTimer(i);
  };

  const updateExerciseWorkoutTimer = (index) => {
    if (workout.isRendered) {
      const allExercisesBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["exerciseLength"]) || 0), 0);
      const allBreaksBeforeTheNextExercise = workout.exercises
        .slice(0, index)
        .reduce((a, b) => a + (parseInt(b["break"]) || 0), 0);
      // console.log("allExercisesBeforeTheNextExercise",allExercisesBeforeTheNextExercise+allBreaksBeforeTheNextExercise)
      setExerciseWorkoutTimeTrack((prev) => ({
        ...prev,
        current:
          allExercisesBeforeTheNextExercise + allBreaksBeforeTheNextExercise,
      }));
    }
  };

  return (
    <div
      className="challenge-player-container-exercies"
      style={{
        background: fromFullScreen && "none",
        width: fromFullScreen && "100%",
      }}
    >
      <div className="video-browser-container" ref={carouselContainerRef}>
        <Carousel responsive={responsive}>
          {workout.exercises &&
            workout.exercises
              .map((e, originalIndex) => ({ e, originalIndex }))
              .filter(
                ({ e, originalIndex }) =>
                  originalIndex !== 0 || e.videoURL || e.exerciseLength > 0
              )
              .map(({ e, originalIndex }) => {
                const i = originalIndex;

                return i === 0 ? (
                  <div
                    data-exercise-index={i}
                    className={`${
                      currentExercise.index === i
                        ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                        : "exercise-browser-card"
                    }`}
                  >
                    <div>
                      <h4 className="challenge-player-container-exercies-round font-paragraph-white">
                        {e.exerciseGroupName ? (
                          e.exerciseGroupName
                        ) : (
                          <span style={{ opacity: 0 }}>-</span>
                        )}
                      </h4>
                    </div>
                    {workout.isRendered && !e?.exerciseId && (
                      <img
                        src={SquarePlay}
                        onClick={() =>
                          setPlayerState({ ...playerState, playing: true })
                        }
                        alt=""
                        className="challenge-player-container-exercies-box-asktrainerbtn"
                        style={{ padding: "8px" }}
                      />
                    )}
                    {workout.isRendered && e?.exerciseId && (
                      <img
                        src={SquarePT}
                        alt=""
                        className="challenge-player-container-exercies-box-asktrainerbtn"
                        onClick={() => handleOpenExerciseForHelp(e)}
                      />
                    )}
                    <div
                      className="challenge-player-container-exercies-box"
                      key={e._id}
                      onClick={() => handleChangeExercise(i)}
                    >
                      <div className="challenge-player-container-exercies-box-imagebox">
                        {e.videoThumbnailURL ? (
                          <img
                            src={e.videoThumbnailURL}
                            alt="thumbnail"
                            style={{
                              width: 250,
                              height: 200,
                              objectFit: "cover",
                              objectPosition: "center",
                              display: "block",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          <VideoThumbnail
                            videoUrl={e.videoURL ? `${e.videoURL}` : ""}
                            width={250}
                            height={200}
                            cors={true}
                          />
                        )}
                      </div>
                      <div className="challenge-player-container-exercies-box-details font-paragraph-white">
                        <p style={{ lineHeight: "15px" }}>{e.title}</p>
                        <p>
                          {e.exerciseLength ? (
                            <>
                              <span style={{ marginRight: "8px" }}>
                                {workout.isRendered
                                  ? `${e.exerciseLength} secs`
                                  : ""}
                              </span>{" "}
                            </>
                          ) : (
                            <span style={{ marginRight: "8px" }}></span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    data-exercise-index={i}
                    className={`${
                      currentExercise.index === i
                        ? "exercise-browser-card challenge-player-container-exercies-box--currentRunning"
                        : "exercise-browser-card"
                    }`}
                  >
                    <div>
                      <h4
                        className="challenge-player-container-exercies-round font-paragraph-white"
                        style={{ opacity: !e.exerciseGroupName ? "0" : "0.6" }}
                      >
                        {e.exerciseGroupName ? (
                          e.exerciseGroupName
                        ) : (
                          <span style={{ opacity: 0 }}>-</span>
                        )}
                      </h4>
                    </div>
                    {workout.isRendered && !fullscreen && (
                      <img
                        src={SquarePT}
                        alt=""
                        className="challenge-player-container-exercies-box-asktrainerbtn"
                        onClick={() => handleOpenExerciseForHelp(e)}
                      />
                    )}
                    <div
                      className="challenge-player-container-exercies-box"
                      key={e._id}
                      onClick={() => handleChangeExercise(i)}
                    >
                      <div className="challenge-player-container-exercies-box-imagebox">
                        {e.videoThumbnailURL ? (
                          <img
                            src={e.videoThumbnailURL}
                            alt="thumbnail"
                            style={{
                              width: 250,
                              height: 200,
                              objectFit: "cover",
                              objectPosition: "center",
                              display: "block",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          <VideoThumbnail
                            videoUrl={e.videoURL ? `${e.videoURL}` : ""}
                            width={250}
                            height={200}
                            cors={true}
                          />
                        )}
                      </div>
                      <div className="challenge-player-container-exercies-box-details font-paragraph-white">
                        <p style={{ lineHeight: "15px" }}>{e.title}</p>
                        <p>
                          <span style={{ marginRight: "8px" }}>
                            {e.exerciseLength ? `${e.exerciseLength} secs` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </Carousel>
      </div>
      {!fromFullScreen && workout.isRendered && (
        <>
          <h3
            className="challenge-player-container-exercies-heading font-paragraph-white"
            style={{ marginTop: "20px" }}
          >
            Exercises
          </h3>

          <h3 className="challenge-player-container-exercies-subheading font-paragraph-white">
            Navigate to each exercise or hit the personal trainer button for
            audio explanation.
          </h3>
        </>
      )}
    </div>
  );
}

export default PlayerVideoBrowser;
