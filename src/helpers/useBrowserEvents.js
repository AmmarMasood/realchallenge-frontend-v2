import { useEffect, useCallback, useRef } from "react";

export const useBrowserEvents = (options = {}) => {
  const {
    onBeforeUnload,
    onUnload,
    onPageHide,
    onPopState,
    onVisibilityChange,
    enableBeforeUnloadConfirm = false,
    hasUnsavedChanges = false,
    confirmMessage = "Are you sure you want to leave?",
    enableBackForwardWarning = true,
    backForwardMessage = "Any unsaved changes will be lost. Continue?",
  } = options;

  const programmaticReloadRef = useRef(false);
  const hasPushedState = useRef(false);

  // Handle beforeunload (refresh, close)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) onBeforeUnload(e);

      if (programmaticReloadRef.current) {
        programmaticReloadRef.current = false;
        return;
      }

      if (enableBeforeUnloadConfirm || hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = confirmMessage;
        return confirmMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    onBeforeUnload,
    enableBeforeUnloadConfirm,
    hasUnsavedChanges,
    confirmMessage,
  ]);

  // Handle unload
  useEffect(() => {
    if (!onUnload) return;
    const handleUnload = (e) => onUnload(e);
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [onUnload]);

  // Handle pagehide
  useEffect(() => {
    if (!onPageHide) return;
    const handlePageHide = (e) => onPageHide(e);
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [onPageHide]);

  // Handle back/forward navigation with warning
  useEffect(() => {
    if (!enableBackForwardWarning && !onPopState) return;

    const pushInitialState = () => {
      if (!hasPushedState.current) {
        window.history.pushState({ isInitial: true }, "");
        hasPushedState.current = true;
      }
    };

    const handlePopState = (e) => {
      if (enableBackForwardWarning && hasUnsavedChanges) {
        const shouldContinue = window.confirm(backForwardMessage);

        if (!shouldContinue) {
          // User cancelled, push state back to stay on page
          window.history.pushState({ isInitial: true }, "");
          return;
        } else {
          // ✅ User confirmed: allow navigation by going back one more if needed
          hasPushedState.current = false;
          window.history.back();
          return;
        }
      }

      if (onPopState) onPopState(e);
    };

    pushInitialState();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    enableBackForwardWarning,
    hasUnsavedChanges,
    backForwardMessage,
    onPopState,
  ]);

  // Handle visibility change
  useEffect(() => {
    if (!onVisibilityChange) return;

    const handleVisibilityChange = () => {
      onVisibilityChange(document.visibilityState);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onVisibilityChange]);

  // Reload without confirmation
  const reloadWithoutConfirmation = useCallback(() => {
    programmaticReloadRef.current = true;
    window.location.reload();
  }, []);

  return {
    reloadWithoutConfirmation,
  };
};
