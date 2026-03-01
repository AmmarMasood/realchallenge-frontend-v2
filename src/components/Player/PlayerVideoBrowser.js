import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";

import VideoThumbnail from "react-video-thumbnail";
import { notification } from "antd";
import SquarePT from "../../assets/icons/player-video-browser-whistle-icon.svg";
import SquarePlay from "../../assets/icons/player-video-browser-play-icon.svg";
import LeftArrow from "../../assets/icons/scroll-left-arrow.svg";
import RightArrow from "../../assets/icons/scroll-right-arrow.svg";
import { exerciseWorkoutTimeTrackContext } from "../../contexts/PlayerState";

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
    exerciseWorkoutTimeTrackContext,
  );
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, workout.exercises]);

  // Auto-scroll to currently playing exercise
  useEffect(() => {
    if (currentExercise && currentExercise.index >= 0 && trackRef.current) {
      setTimeout(() => {
        const card = trackRef.current?.querySelector(
          `[data-exercise-index="${currentExercise.index}"]`,
        );
        if (card) {
          const track = trackRef.current;
          const scrollTarget = card.offsetLeft - track.offsetLeft;
          track.scrollTo({ left: scrollTarget, behavior: "smooth" });
        }
      }, 50);
    }
  }, [currentExercise.index]);

  const scrollCarousel = (direction) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: direction * 280, behavior: "smooth" });
    }
  };

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
      <div className="video-browser-container">
        <div className="custom-carousel-wrapper">
          <button
            className="custom-carousel-arrow custom-carousel-arrow--left"
            onClick={() => scrollCarousel(-1)}
            style={{ opacity: canScrollLeft ? 1 : 0.3 }}
          >
            <img src={LeftArrow} alt="left" />
          </button>

          <div className="custom-carousel-track" ref={trackRef}>
            {workout.exercises &&
              workout.exercises
                .map((e, originalIndex) => ({ e, originalIndex }))
                .filter(
                  ({ e, originalIndex }) =>
                    originalIndex !== 0 || e.videoURL || e.exerciseLength > 0,
                )
                .map(({ e, originalIndex }) => {
                  const i = originalIndex;

                  return i === 0 ? (
                    <div
                      key={e._id}
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
                      {workout.isRendered &&
                        e?.voiceOverLink &&
                        !e?.exerciseId && (
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
                      {workout.isRendered &&
                        e?.voiceOverLink &&
                        e?.exerciseId && (
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
                            <img src={e.videoThumbnailURL} alt="thumbnail" />
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
                          <p
                            style={{
                              lineHeight: "20px",
                              width: "200px",
                              fontSize: "16px",
                              marginBottom: "10px",
                            }}
                          >
                            {e.title}
                          </p>
                          <p style={{ padding: 0, margin: 0 }}>
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
                      key={e._id}
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
                          style={{
                            opacity: !e.exerciseGroupName ? "0" : "0.6",
                          }}
                        >
                          {e.exerciseGroupName ? (
                            e.exerciseGroupName
                          ) : (
                            <span style={{ opacity: 0 }}>-</span>
                          )}
                        </h4>
                      </div>
                      {workout.isRendered &&
                        !fullscreen &&
                        e?.voiceOverLink && (
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
                            <img src={e.videoThumbnailURL} alt="thumbnail" />
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
                          <p
                            style={{
                              lineHeight: "20px",
                              width: "200px",
                              fontSize: "16px",
                              padding: 0,
                              marginBottom: "10px",
                            }}
                          >
                            {e.title}
                          </p>
                          <p style={{ padding: 0, margin: 0 }}>
                            <span style={{ marginRight: "8px" }}>
                              {e.exerciseLength
                                ? `${e.exerciseLength} secs`
                                : ""}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>

          <button
            className="custom-carousel-arrow custom-carousel-arrow--right"
            onClick={() => scrollCarousel(1)}
            style={{ opacity: canScrollRight ? 1 : 0.3 }}
          >
            <img src={RightArrow} alt="right" />
          </button>
        </div>
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
