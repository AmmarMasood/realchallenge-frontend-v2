import { useEffect, useCallback, useRef, useState } from "react";

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
    allowNavigation = true,
    enableBackForwardWarning = true, // New option to enable back/forward warnings
    backForwardMessage = "Any unsaved changes will be lost. Continue?", // New option for back/forward message
  } = options;

  // Track programmatic reloads
  const programmaticReloadRef = useRef(false);
  const [navigationBlocked, setNavigationBlocked] = useState(false);
  const originalHistoryLength = useRef(window.history.length);
  const initialPageLoad = useRef(true);

  // Handle beforeunload (refresh, close, navigate away)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

      // Skip confirmation if it's a programmatic reload
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

  // Enhanced popstate handling for back/forward navigation
  useEffect(() => {
    if (!enableBackForwardWarning && !onPopState) return;

    let hasSetupGuard = false;

    const setupNavigationGuard = () => {
      if (hasSetupGuard) return;
      hasSetupGuard = true;

      // Push a guard state to detect back navigation
      const guardState = {
        isGuard: true,
        timestamp: Date.now(),
        originalUrl: window.location.href,
      };

      window.history.pushState(guardState, "", window.location.href);
    };

    const handlePopState = (e) => {
      const currentState = e.state;

      // If we hit our guard state, user is trying to navigate back
      if (currentState && currentState.isGuard) {
        if (
          enableBackForwardWarning &&
          (hasUnsavedChanges || allowNavigation === false)
        ) {
          const shouldContinue = window.confirm(backForwardMessage);

          if (!shouldContinue) {
            // User cancelled - push guard state again to stay on page
            window.history.pushState(currentState, "", window.location.href);
            return;
          }
        }

        // User confirmed or no warning needed - allow navigation
        window.history.back();
        return;
      }

      // Handle other popstate events (like programmatic navigation)
      if (onPopState) {
        onPopState(e);
      }

      // Re-setup guard after any navigation
      setTimeout(setupNavigationGuard, 100);
    };

    // Setup initial guard after component mounts
    if (initialPageLoad.current) {
      initialPageLoad.current = false;
      setTimeout(setupNavigationGuard, 100);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // Cleanup: try to remove our guard state
      try {
        if (
          window.history.state &&
          window.history.state.isGuard &&
          hasSetupGuard
        ) {
          window.history.back();
        }
      } catch (err) {
        // Ignore cleanup errors
        console.warn("Could not clean up navigation guard:", err);
      }
    };
  }, [
    enableBackForwardWarning,
    onPopState,
    hasUnsavedChanges,
    allowNavigation,
    backForwardMessage,
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

  // Return function to allow programmatic reload without confirmation
  const reloadWithoutConfirmation = useCallback(() => {
    programmaticReloadRef.current = true;
    window.location.reload();
  }, []);

  // Function to temporarily disable back/forward warnings
  const disableBackForwardWarning = useCallback(() => {
    setNavigationBlocked(false);
  }, []);

  // Function to enable back/forward warnings
  const enableBackForwardWarningFn = useCallback(() => {
    setNavigationBlocked(true);
  }, []);

  return {
    reloadWithoutConfirmation,
    disableBackForwardWarning,
    enableBackForwardWarning: enableBackForwardWarningFn,
    navigationBlocked,
  };
};

// Alternative simpler approach - just use popstate
export const useBrowserEventsSimpleBackForward = (options = {}) => {
  const {
    onBeforeUnload,
    enableBeforeUnloadConfirm = false,
    hasUnsavedChanges = false,
    confirmMessage = "Are you sure you want to leave?",
    enableBackForwardWarning = true,
    backForwardMessage = "Any unsaved changes will be lost. Continue?",
  } = options;

  const programmaticReloadRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle beforeunload for page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

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

  // Handle back/forward navigation
  useEffect(() => {
    if (!enableBackForwardWarning) return;

    // Track if we're in a navigation state
    let navigationTimeout;

    const handlePopState = (e) => {
      if (isNavigating) return; // Prevent recursive calls

      if (hasUnsavedChanges) {
        const shouldContinue = window.confirm(backForwardMessage);

        if (!shouldContinue) {
          setIsNavigating(true);

          // Push current state back
          window.history.pushState(null, "", window.location.href);

          // Reset navigation flag after a brief delay
          navigationTimeout = setTimeout(() => {
            setIsNavigating(false);
          }, 100);

          return;
        }
      }
    };

    // Add initial state to enable back detection
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [
    enableBackForwardWarning,
    hasUnsavedChanges,
    backForwardMessage,
    isNavigating,
  ]);

  const reloadWithoutConfirmation = useCallback(() => {
    programmaticReloadRef.current = true;
    window.location.reload();
  }, []);

  return {
    reloadWithoutConfirmation,
    isNavigating,
  };
};

// Modern approach using Navigation API (where supported)
export const useBrowserEventsModern = (options = {}) => {
  const {
    onBeforeUnload,
    onUnload,
    onPageHide,
    onNavigate,
    onVisibilityChange,
    enableBeforeUnloadConfirm = false,
    hasUnsavedChanges = false,
    confirmMessage = "Are you sure you want to leave?",
    enableBackForwardWarning = true,
    backForwardMessage = "Any unsaved changes will be lost. Continue?",
  } = options;

  const programmaticReloadRef = useRef(false);

  // Use Navigation API if available (modern browsers)
  useEffect(() => {
    if ("navigation" in window) {
      const handleNavigate = (e) => {
        // Check if it's a back/forward navigation
        const isBackForward = e.navigationType === "traverse";

        if (isBackForward && enableBackForwardWarning && hasUnsavedChanges) {
          const shouldContinue = window.confirm(backForwardMessage);
          if (!shouldContinue) {
            e.preventDefault();
            return;
          }
        } else if (hasUnsavedChanges && !isBackForward) {
          const shouldContinue = window.confirm(confirmMessage);
          if (!shouldContinue) {
            e.preventDefault();
            return;
          }
        }

        if (onNavigate) {
          onNavigate(e);
        }
      };

      window.navigation.addEventListener("navigate", handleNavigate);
      return () =>
        window.navigation.removeEventListener("navigate", handleNavigate);
    }
  }, [
    onNavigate,
    hasUnsavedChanges,
    enableBackForwardWarning,
    backForwardMessage,
    confirmMessage,
  ]);

  // Fallback to beforeunload for older browsers or when Navigation API not available
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (onBeforeUnload) {
        onBeforeUnload(e);
      }

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

  // Other effects remain the same
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
    if (!onVisibilityChange) return;
    const handleVisibilityChange = () =>
      onVisibilityChange(document.visibilityState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onVisibilityChange]);

  const reloadWithoutConfirmation = useCallback(() => {
    programmaticReloadRef.current = true;
    window.location.reload();
  }, []);

  return { reloadWithoutConfirmation };
};
