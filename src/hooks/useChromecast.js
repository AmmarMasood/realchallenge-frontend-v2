import { useState, useEffect, useRef, useCallback } from "react";

const NAMESPACE = "urn:x-cast:com.realchallenge.workout";

// Replace with your custom receiver App ID after registering at https://cast.google.com/publish/
// Until then, this placeholder will not work — the Default Media Receiver (CC1AD845)
// does NOT support custom messages. You must register and get your own App ID.
const CAST_APP_ID = process.env.REACT_APP_CAST_APP_ID || "CC1AD845";

export default function useChromecast({ workout, currentExercise }) {
  const [castAvailable, setCastAvailable] = useState(false);
  const [castConnected, setCastConnected] = useState(false);
  const [receiverState, setReceiverState] = useState(null);

  const sessionRef = useRef(null);
  const castContextRef = useRef(null);

  // ─── Initialize Cast SDK ───
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const initializeCast = () => {
      try {
        if (!window.cast?.framework?.CastContext) return false;

        const context = window.cast.framework.CastContext.getInstance();
        castContextRef.current = context;

        const options = {
          receiverApplicationId: CAST_APP_ID,
          autoJoinPolicy: window.chrome?.cast?.AutoJoinPolicy?.ORIGIN_SCOPED || "origin_scoped",
          androidReceiverCompatible: true,
        };

        context.setOptions(options);

        context.addEventListener(
          window.cast.framework.CastContextEventType.CAST_STATE_CHANGED,
          (event) => {
            setCastAvailable(
              event.castState !==
                window.cast.framework.CastState.NO_DEVICES_AVAILABLE
            );
          }
        );

        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          () => {
            const session = context.getCurrentSession();
            sessionRef.current = session;
            setCastConnected(!!session);

            // Listen for messages from receiver
            if (session) {
              session.addMessageListener(NAMESPACE, (ns, message) => {
                try {
                  const parsed =
                    typeof message === "string" ? JSON.parse(message) : message;
                  if (parsed.type === "STATE_UPDATE") {
                    setReceiverState(parsed.data);
                  }
                } catch (e) {
                  console.warn("Failed to parse cast message:", e);
                }
              });
            } else {
              setReceiverState(null);
            }
          }
        );

        return true;
      } catch (error) {
        console.warn("Failed to initialize Cast:", error);
        return false;
      }
    };

    const checkInterval = setInterval(() => {
      attempts++;
      if (initializeCast() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  // ─── Send message helper ───
  const sendMessage = useCallback(
    (type, data) => {
      const session = sessionRef.current;
      if (!session) return;

      try {
        session.sendMessage(NAMESPACE, { type, data });
      } catch (e) {
        console.warn("Cast sendMessage error:", e);
      }
    },
    []
  );

  // ─── Build & send workout data to receiver ───
  const sendWorkoutToReceiver = useCallback(
    (musicUrl, musicVolume) => {
      if (!workout?.exercises || !sessionRef.current) return;

      const origin = window.location.origin;

      const exercises = workout.exercises.map((ex) => ({
        videoURL: ex.videoURL || "",
        title: ex.title || "",
        exerciseLength: ex.exerciseLength || 0,
        break: ex.break || 0,
        videoThumbnailURL: ex.videoThumbnailURL || "",
      }));

      sendMessage("LOAD_WORKOUT", {
        title: workout.title || "Workout",
        subtitle: workout.subtitle || "",
        exercises,
        startIndex: currentExercise?.index || 0,
        musicUrl: musicUrl || null,
        musicVolume: musicVolume != null ? musicVolume : 0.3,
        breakStartSoundUrl: origin + "/audio/break-start.mp3",
        breakEndSoundUrl: origin + "/audio/break-end.mp3",
      });
    },
    [workout, currentExercise, sendMessage]
  );

  // ─── Connect / Disconnect ───
  const startCasting = useCallback(
    (musicUrl, musicVolume) => {
      if (!castAvailable || !workout?.exercises) return;

      const context = castContextRef.current;
      if (!context) return;

      if (castConnected) {
        sendWorkoutToReceiver(musicUrl, musicVolume);
      } else {
        context
          .requestSession()
          .then(() => {
            // Small delay to let the session establish
            setTimeout(() => {
              sendWorkoutToReceiver(musicUrl, musicVolume);
            }, 500);
          })
          .catch((error) => {
            console.error("Error starting cast session:", error);
          });
      }
    },
    [castAvailable, castConnected, workout, sendWorkoutToReceiver]
  );

  const stopCasting = useCallback(() => {
    const session = sessionRef.current;
    if (session) {
      session.endSession(true);
    }
    setReceiverState(null);
  }, []);

  const toggleCast = useCallback(
    (musicUrl, musicVolume) => {
      if (castConnected) {
        stopCasting();
      } else {
        startCasting(musicUrl, musicVolume);
      }
    },
    [castConnected, startCasting, stopCasting]
  );

  // ─── Remote controls ───
  const sendPlay = useCallback(() => sendMessage("PLAY"), [sendMessage]);
  const sendPause = useCallback(() => sendMessage("PAUSE"), [sendMessage]);
  const sendTogglePause = useCallback(
    () => sendMessage("TOGGLE_PAUSE"),
    [sendMessage]
  );
  const sendSkipNext = useCallback(
    () => sendMessage("SKIP_NEXT"),
    [sendMessage]
  );
  const sendSkipPrev = useCallback(
    () => sendMessage("SKIP_PREV"),
    [sendMessage]
  );
  const sendChangeMusic = useCallback(
    (musicUrl, musicVolume) =>
      sendMessage("CHANGE_MUSIC", { musicUrl, musicVolume }),
    [sendMessage]
  );
  const sendSetVolume = useCallback(
    ({ videoVolume, musicVolume }) =>
      sendMessage("SET_VOLUME", { videoVolume, musicVolume }),
    [sendMessage]
  );

  return {
    castAvailable,
    castConnected,
    receiverState,
    toggleCast,
    startCasting,
    stopCasting,
    sendPlay,
    sendPause,
    sendTogglePause,
    sendSkipNext,
    sendSkipPrev,
    sendChangeMusic,
    sendSetVolume,
  };
}
