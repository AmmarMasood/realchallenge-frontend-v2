import React, { createContext, useContext, useRef, useCallback, useMemo, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

// Detect if device supports touch
export const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Get the appropriate backend based on device type
export const getDndBackend = () => {
  return isTouchDevice() ? TouchBackend : HTML5Backend;
};

// Touch backend options for better mobile experience
export const touchBackendOptions = {
  // Hybrid laptop touchscreens fire BOTH touch and mouse events; enabling
  // mouse events on top of touch causes the backend to double-track and
  // can swallow the drag-initiation. Keep touch-only on touch devices.
  enableMouseEvents: false,
  // 0ms — start the drag immediately on first touch+move. Users were
  // pressing the handle but not moving enough during the delay window,
  // which caused the gesture to be classified as a tap.
  delayTouchStart: 0,
  // Number of pixels of movement required before a drag is committed.
  // 0 means the very first touchmove starts the drag — paired with
  // delayTouchStart:0 this makes the handle behave like a desktop drag.
  touchSlop: 0,
  ignoreContextMenu: true,
};

export const ItemTypeWeek = "DRAGGABLE_WEEK";
export const ItemTypeWorkout = "DRAGGABLE_WORKOUT";
export const ItemTypeExercise = "DRAGGABLE_EXERCISE";

const DragContext = createContext();

// Hook: auto-scroll a container when the drag position is near its visible edges
// Uses a shared positionRef (updated by DraggableItem hover + native events) so it works on both backends
function useAutoScroll(scrollContainerRef, isDragging, direction, speed, positionRef) {
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const EDGE_SIZE = 120;

    // On touch, the finger can't move past the screen edge to trigger full
    // speed, and the dragged card keeps the pointer mid-zone — so a linear
    // ramp crawls. Reach full speed by the time the pointer is RAMP_FRACTION
    // into the edge zone, and never drop below MIN_INTENSITY so it never crawls.
    const MIN_INTENSITY = 0.5;
    const RAMP_FRACTION = 0.5;
    const edgeIntensity = (dist) => {
      const t = 1 - dist / EDGE_SIZE; // 0 at the zone boundary → 1 at the edge
      return Math.max(MIN_INTENSITY, Math.min(1, t / RAMP_FRACTION));
    };

    const tick = () => {
      const container = scrollContainerRef?.current;
      if (!container) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rect = container.getBoundingClientRect();
      const { x, y } = positionRef.current;

      // Skip if position hasn't been set yet
      if (x === 0 && y === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (direction === "horizontal") {
        const distFromLeft = x - rect.left;
        const distFromRight = rect.right - x;

        // Also scroll when finger is OUTSIDE the container (past edges)
        if (distFromLeft < 0) {
          // Finger is left of container — scroll left at max speed
          container.scrollLeft -= speed;
        } else if (distFromRight < 0) {
          // Finger is right of container — scroll right at max speed
          container.scrollLeft += speed;
        } else if (distFromLeft < EDGE_SIZE) {
          container.scrollLeft -= speed * edgeIntensity(distFromLeft);
        } else if (distFromRight < EDGE_SIZE) {
          container.scrollLeft += speed * edgeIntensity(distFromRight);
        }
      } else {
        const distFromTop = y - rect.top;
        const distFromBottom = rect.bottom - y;

        if (distFromTop < 0) {
          container.scrollTop -= speed;
        } else if (distFromBottom < 0) {
          container.scrollTop += speed;
        } else if (distFromTop < EDGE_SIZE) {
          container.scrollTop -= speed * edgeIntensity(distFromTop);
        } else if (distFromBottom < EDGE_SIZE) {
          container.scrollTop += speed * edgeIntensity(distFromBottom);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Track position via native events in CAPTURE phase — fires before react-dnd-touch-backend intercepts
    const handleDragOver = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        positionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    document.addEventListener("dragover", handleDragOver, true);
    document.addEventListener("touchmove", handleTouchMove, { capture: true, passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("dragover", handleDragOver, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, scrollContainerRef, direction, speed, positionRef]);
}

export function DraggableArea({
  children,
  onChange,
  direction = "vertical",
  itemType,
  onDragStateChange,
  scrollContainerRef,
  autoScrollSpeed = 12,
  autoScrollThreshold = 50,  // kept for API compat
}) {
  const childArray = React.Children.toArray(children);
  const timeoutRef = React.useRef(null);
  const lastChangeRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  // Shared ref for drag position — updated by DraggableItem hover via monitor.getClientOffset()
  const dragPositionRef = useRef({ x: 0, y: 0 });

  // Auto-scroll when dragging near container edges
  useAutoScroll(scrollContainerRef, isDragging, direction, autoScrollSpeed, dragPositionRef);

  const moveItem = useCallback((dragIndex, hoverIndex) => {
    if (
      dragIndex < 0 ||
      hoverIndex < 0 ||
      dragIndex >= childArray.length ||
      hoverIndex >= childArray.length ||
      dragIndex === hoverIndex
    ) {
      return;
    }

    const updatedItems = [...childArray];
    const [removed] = updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, removed);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastChangeRef.current = updatedItems;

    timeoutRef.current = setTimeout(() => {
      if (onChange && lastChangeRef.current) {
        const mappedOrder = lastChangeRef.current.map((child) => {
          if (!child || !child.props) return null;
          const id = child.props.id;
          return { key: id, id: id };
        }).filter((item) => item !== null);

        if (mappedOrder.length > 0) {
          onChange(mappedOrder);
        }
      }
    }, 50);
  }, [childArray, onChange]);

  const handleDragStateChange = useCallback((dragging, draggedId) => {
    setIsDragging(dragging);
    if (!dragging) {
      dragPositionRef.current = { x: 0, y: 0 };
    }
    if (onDragStateChange) {
      onDragStateChange(dragging, draggedId);
    }
  }, [onDragStateChange]);

  return (
    <DragContext.Provider value={{ moveItem, direction, itemType, onDragStateChange: handleDragStateChange, childArray, dragPositionRef }}>
      <div
        style={{
          display: direction === "horizontal" ? "inline-flex" : "block",
          width: direction === "horizontal" ? undefined : "98.5%",
          flexShrink: 0,
        }}
      >
        {childArray.map((child, index) =>
          React.cloneElement(child, { index, key: child.key || index })
        )}
      </div>
    </DragContext.Provider>
  );
}

export function DraggableItem({ children, index, id, ...rest }) {
  const ref = useRef(null);
  const handleRef = useRef(null);
  const lastHoverTime = useRef(0);
  const { moveItem, direction, itemType, onDragStateChange, childArray, dragPositionRef } = useContext(DragContext);

  const [, drop] = useDrop({
    accept: itemType,
    hover(item, monitor) {
      if (!ref.current) return;

      // Update shared drag position from monitor — works on both HTML5 and Touch backends
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && dragPositionRef) {
        dragPositionRef.current = { x: clientOffset.x, y: clientOffset.y };
      }

      // Throttle hover events to reduce vibration (minimum 30ms between moves)
      const now = Date.now();
      if (now - lastHoverTime.current < 30) return;

      // Find the current index of the dragged item by its ID
      const dragItemIndex = childArray.findIndex(
        (child) => child?.props?.id === item.id
      );

      // Skip if item hasn't moved or indices are invalid
      if (dragItemIndex === -1 || dragItemIndex === index) return;

      // For horizontal drag, add a minimum distance threshold to reduce jitter
      if (direction === "horizontal") {
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        if (!clientOffset) return;
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;

        // Only move if cursor is clearly past the middle (30% threshold)
        const threshold = hoverMiddleX * 0.3;
        if (dragItemIndex < index && hoverClientX < hoverMiddleX - threshold) return;
        if (dragItemIndex > index && hoverClientX > hoverMiddleX + threshold) return;
      }

      lastHoverTime.current = now;
      moveItem(dragItemIndex, index);
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: itemType,
    item: () => {
      if (onDragStateChange) {
        onDragStateChange(true, id);
      }
      return { index, id };
    },
    end: () => {
      if (onDragStateChange) {
        onDragStateChange(false, null);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Attach drop target and preview to the item container
  // But DON'T attach drag here - drag is only from handle
  preview(drop(ref));

  const itemStyle = useMemo(
    () => ({
      opacity: isDragging ? 0.4 : 1,
      display: direction === "horizontal" ? "inline-block" : "block",
      flexShrink: direction === "horizontal" ? 0 : undefined,
      transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
      transform: isDragging ? "scale(0.95)" : "scale(1)",
    }),
    [isDragging, direction]
  );

  return (
    <div ref={ref} style={itemStyle} {...rest}>
      <DragContext.Provider value={{ drag, handleRef }}>{children}</DragContext.Provider>
    </div>
  );
}

export function DraggableHandle({ children }) {
  const { drag } = useContext(DragContext);
  const ref = useRef(null);

  // Attach drag to the handle only
  useEffect(() => {
    if (drag && ref.current) {
      drag(ref);
    }
  }, [drag]);

  // Prevent the native browser scroll gesture from hijacking the touchstart
  // on the drag handle. We MUST NOT call stopPropagation() here — the
  // react-dnd TouchBackend listens on `document`, and stopping propagation
  // in the bubble phase blocks it from ever seeing the first touchstart,
  // which is why drag previously required a "wake-up" click.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const preventScroll = (e) => {
      e.preventDefault();
    };
    // passive: false is needed to allow preventDefault on touchstart.
    el.addEventListener("touchstart", preventScroll, { passive: false });
    return () => {
      el.removeEventListener("touchstart", preventScroll);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      data-drag-handle="true"
      style={{
        display: "inline-block",
        cursor: "move",
        position: "relative",
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        // Padding + negative margin = invisible bigger touch target
        // (48-ish px on each side) without affecting layout. Visually the
        // element still takes up only the icon's natural size, so it
        // aligns with sibling icons like copy/trash.
        padding: "14px",
        margin: "-14px",
      }}
    >
      {children}
    </div>
  );
}
