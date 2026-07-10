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
        // The SDK loads in two phases: `window.cast.framework` first, then
        // the legacy `window.chrome.cast` API. setOptions() internally calls
        // `new chrome.cast.SessionRequest(...)`, so both must be present
        // before we proceed — otherwise we get the "Cannot read properties
        // of undefined (reading 'SessionRequest')" error.
        if (!window.cast?.framework?.CastContext) return false;
        if (!window.chrome?.cast?.SessionRequest) return false;

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

        // The SDK may fire CAST_STATE_CHANGED before our listener attaches.
        // Pull the current state synchronously so the initial render reflects
        // reality instead of waiting for the next state change (which only
        // happens when a device appears/disappears).
        const initialState = context.getCastState();
        setCastAvailable(
          initialState !==
            window.cast.framework.CastState.NO_DEVICES_AVAILABLE
        );

        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          (event) => {
            // Key off the event's sessionState rather than getCurrentSession():
            // during a disconnect the latter still returns the ending session
            // for a moment, which flipped castConnected back to true and left
            // the player stuck in cast mode.
            const SS = window.cast.framework.SessionState;
            const connected =
              event.sessionState === SS.SESSION_STARTED ||
              event.sessionState === SS.SESSION_RESUMED;
            const session = connected ? context.getCurrentSession() : null;
            sessionRef.current = session;
            setCastConnected(connected);

            // Listen for messages from receiver
            if (connected && session) {
              let loggedReceiverVersion = false;
              let lastLoggedPhase = null;
              session.addMessageListener(NAMESPACE, (ns, message) => {
                try {
                  const parsed =
                    typeof message === "string" ? JSON.parse(message) : message;
                  if (parsed.type === "STATE_UPDATE") {
                    // Surface which receiver build the TV is actually running
                    // (once per session) — old receivers send no version field
                    if (!loggedReceiverVersion) {
                      loggedReceiverVersion = true;
                      console.log(
                        "[Cast] receiver version:",
                        parsed.data?.receiverVersion || "(pre-versioning build)"
                      );
                    }
                    // Audio diagnostics on every phase change — tells us what
                    // the TV's music element / beep context are doing without
                    // needing TV-side debugging
                    if (parsed.data?.phase !== lastLoggedPhase) {
                      lastLoggedPhase = parsed.data?.phase;
                      const d = parsed.data || {};
                      console.log(
                        `[Cast] phase=${d.phase} musicPaused=${d.musicPaused} ` +
                          `musicTime=${d.musicTime} musicReady=${d.musicReadyState} ` +
                          `musicErr=${d.musicError} lastStop=${d.musicLastStop} ` +
                          `beepActive=${d.beepActive} beepLoaded=${d.beepLoaded}`
                      );
                    }
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

      const exercises = workout.exercises.map((ex) => ({
        videoURL: ex.videoURL || "",
        title: ex.title || "",
        // exerciseLength is stored as a String in the DB — parse to a number
        // so the receiver adds (e.g. 30 + 5) instead of concatenating strings
        // ("30" + 5 = "305"), which blew the cast timer up to garbage values.
        exerciseLength: parseInt(ex.exerciseLength, 10) || 0,
        break: parseInt(ex.break, 10) || 0,
        videoThumbnailURL: ex.videoThumbnailURL || "",
      }));

      sendMessage("LOAD_WORKOUT", {
        title: workout.title || "Workout",
        subtitle: workout.subtitle || "",
        exercises,
        // clamp: -1 is the local "workout finished" sentinel and must never
        // reach the receiver as a start position
        startIndex: Math.max(currentExercise?.index || 0, 0),
        musicUrl: musicUrl || null,
        musicVolume: musicVolume != null ? musicVolume : 0.3,
        // Break-start sound stays disabled: this Chromecast plays only one
        // audio stream, and loaded break-sound elements steal the output from
        // the music (music was silent on prod, fine on localhost where these
        // URLs were unreachable).
        breakStartSoundUrl: null,
        // Countdown beep (3-2-1): re-enabled via lazy-load — the receiver
        // only attaches this src for the ~3s the beep plays (music pauses for
        // that window and resumes with the next exercise), so it can't hold
        // the device's single audio stream like the preloaded version did.
        breakEndSoundUrl: `${window.location.origin}${
          process.env.PUBLIC_URL || ""
        }/audio/break-end.mp3`,
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
              // NOTE: start-paused PAUSE removed — it raced with music play()
              // (AbortError) and is the prime suspect for the prod cast crash.
              // Re-add cleanly via a startPaused flag in LOAD_WORKOUT later.
            }, 500);
          })
          .catch((error) => {
            console.error("Error starting cast session:", error);
          });
      }
    },
    [castAvailable, castConnected, workout, sendWorkoutToReceiver, sendMessage]
  );

  const stopCasting = useCallback(() => {
    const session = sessionRef.current;
    if (session) {
      session.endSession(true);
    }
    // Flip the flags immediately rather than waiting on SESSION_STATE_CHANGED
    // (which can fire late or not at all), so the player leaves cast mode and
    // restores the normal controls right away.
    sessionRef.current = null;
    setCastConnected(false);
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
    sendWorkoutToReceiver,
    sendPlay,
    sendPause,
    sendTogglePause,
    sendSkipNext,
    sendSkipPrev,
    sendChangeMusic,
    sendSetVolume,
  };
}
