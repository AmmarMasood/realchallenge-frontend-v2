import { useEffect, useCallback, useRef } from "react";

// Custom hook for handling browser navigation events
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
  } = options;

  // Track programmatic reloads
  const programmaticReloadRef = useRef(false);

  // Handle beforeunload (refresh, close, navigate away)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

      // Skip confirmation if it's a programmatic reload
      if (programmaticReloadRef.current) {
        programmaticReloadRef.current = false; // Reset flag
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

    const handleUnload = (e) => {
      onUnload(e);
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [onUnload]);

  // Handle pagehide (more reliable than unload)
  useEffect(() => {
    if (!onPageHide) return;

    const handlePageHide = (e) => {
      onPageHide(e);
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [onPageHide]);

  // Handle popstate (browser back/forward)
  useEffect(() => {
    if (!onPopState) return;

    const handlePopState = (e) => {
      onPopState(e);
    };

    // Push state to enable popstate detection
    window.history.pushState({}, "", window.location.href);

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onPopState]);

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

  // Return function to allow programmatic reload without confirmation
  const reloadWithoutConfirmation = useCallback(() => {
    programmaticReloadRef.current = true;
    window.location.reload();
  }, []);

  return {
    reloadWithoutConfirmation,
  };
};

// Alternative approach using sessionStorage flag
export const useBrowserEventsWithStorage = (options = {}) => {
  const {
    onBeforeUnload,
    onUnload,
    onPageHide,
    onPopState,
    onVisibilityChange,
    enableBeforeUnloadConfirm = false,
    hasUnsavedChanges = false,
    confirmMessage = "Are you sure you want to leave?",
  } = options;

  // Handle beforeunload (refresh, close, navigate away)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

      // Check if it's a programmatic reload
      const isProgrammaticReload = sessionStorage.getItem("programmaticReload");
      if (isProgrammaticReload) {
        sessionStorage.removeItem("programmaticReload");
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

  // Other effects remain the same...
  useEffect(() => {
    if (!onUnload) return;
    const handleUnload = (e) => onUnload(e);
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [onUnload]);

  useEffect(() => {
    if (!onPageHide) return;
    const handlePageHide = (e) => onPageHide(e);
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [onPageHide]);

  useEffect(() => {
    if (!onPopState) return;
    const handlePopState = (e) => onPopState(e);
    window.history.pushState({}, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onPopState]);

  useEffect(() => {
    if (!onVisibilityChange) return;
    const handleVisibilityChange = () =>
      onVisibilityChange(document.visibilityState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onVisibilityChange]);

  const reloadWithoutConfirmation = useCallback(() => {
    sessionStorage.setItem("programmaticReload", "true");
    window.location.reload();
  }, []);

  return {
    reloadWithoutConfirmation,
  };
};

// Approach 3: Using a global flag (simplest)
let isProgrammaticReload = false;

export const useBrowserEventsSimple = (options = {}) => {
  const {
    onBeforeUnload,
    onUnload,
    onPageHide,
    onPopState,
    onVisibilityChange,
    enableBeforeUnloadConfirm = false,
    hasUnsavedChanges = false,
    confirmMessage = "Are you sure you want to leave?",
  } = options;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

      // Skip confirmation if it's a programmatic reload
      if (isProgrammaticReload) {
        isProgrammaticReload = false; // Reset flag
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

  // Other effects remain the same...
  useEffect(() => {
    if (!onUnload) return;
    const handleUnload = (e) => onUnload(e);
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [onUnload]);

  useEffect(() => {
    if (!onPageHide) return;
    const handlePageHide = (e) => onPageHide(e);
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [onPageHide]);

  useEffect(() => {
    if (!onPopState) return;
    const handlePopState = (e) => onPopState(e);
    window.history.pushState({}, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onPopState]);

  useEffect(() => {
    if (!onVisibilityChange) return;
    const handleVisibilityChange = () =>
      onVisibilityChange(document.visibilityState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onVisibilityChange]);

  const reloadWithoutConfirmation = useCallback(() => {
    isProgrammaticReload = true;
    window.location.reload();
  }, []);

  return {
    reloadWithoutConfirmation,
  };
};

// Utility function for programmatic reload (can be used anywhere)
export const reloadPageSilently = () => {
  isProgrammaticReload = true;
  window.location.reload();
};
