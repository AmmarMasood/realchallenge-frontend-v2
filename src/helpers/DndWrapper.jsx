import React, { createContext, useContext, useRef, useCallback, useMemo, useEffect } from "react";
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
  enableMouseEvents: true,
  delayTouchStart: 200,  // Slightly longer delay to distinguish drag from scroll
  ignoreContextMenu: true,
  // Don't use scrollAngleRanges - it blocks vertical drag for weeks/workouts
  // Instead, we rely on DraggableHandle having touchAction:"none"
};

export const ItemTypeWeek = "DRAGGABLE_WEEK";
export const ItemTypeWorkout = "DRAGGABLE_WORKOUT";
export const ItemTypeExercise = "DRAGGABLE_EXERCISE";

const DragContext = createContext();

export function DraggableArea({
  children,
  onChange,
  direction = "vertical",
  itemType,
  onDragStateChange,
  scrollContainerRef,  // Optional ref to the scroll container for auto-scroll
  autoScrollSpeed = 10,  // Pixels to scroll per frame
  autoScrollThreshold = 50,  // Distance from edge to trigger auto-scroll
}) {
  const childArray = React.Children.toArray(children);
  const timeoutRef = React.useRef(null);
  const lastChangeRef = React.useRef(null);
  const autoScrollIntervalRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);

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

    // Debounce onChange to avoid excessive re-renders
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store the updated items to use in the debounced callback
    lastChangeRef.current = updatedItems;

    timeoutRef.current = setTimeout(() => {
      if (onChange && lastChangeRef.current) {
        const mappedOrder = lastChangeRef.current.map((child) => {
          if (!child || !child.props) return null;
          const id = child.props.id;
          return {
            key: id,  // Use the id as key since React keys aren't accessible
            id: id,
          };
        }).filter((item) => item !== null);

        if (mappedOrder.length > 0) {
          onChange(mappedOrder);
        }
      }
    }, 50);  // Increased debounce to reduce re-renders during drag
  }, [childArray, onChange]);

  // Store current pointer position for continuous auto-scroll
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  // Auto-scroll logic - checks current pointer position and scrolls if near edges
  const performAutoScroll = useCallback(() => {
    const container = scrollContainerRef?.current;
    if (!container || !isDraggingRef.current) return;

    const { x: clientX, y: clientY } = pointerPositionRef.current;
    if (clientX === 0 && clientY === 0) return;  // No position yet

    const rect = container.getBoundingClientRect();
    let scrollX = 0;
    let scrollY = 0;

    // Check if container can scroll
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 1; // -1 for rounding

    const canScrollUp = container.scrollTop > 0;
    const canScrollDown = container.scrollTop < container.scrollHeight - container.clientHeight - 1;

    if (direction === "horizontal") {
      // Simple threshold check - trigger when cursor is within threshold of edge or beyond
      const rightEdgeStart = rect.right - autoScrollThreshold;
      const leftEdgeEnd = rect.left + autoScrollThreshold;

      // Scroll left when cursor is near/past left edge
      if (clientX <= leftEdgeEnd && canScrollLeft) {
        scrollX = -autoScrollSpeed;
      }
      // Scroll right when cursor is near/past right edge
      else if (clientX >= rightEdgeStart && canScrollRight) {
        scrollX = autoScrollSpeed;
      }
    } else {
      const topEdgeEnd = rect.top + autoScrollThreshold;
      const bottomEdgeStart = rect.bottom - autoScrollThreshold;

      if (clientY <= topEdgeEnd && canScrollUp) {
        scrollY = -autoScrollSpeed;
      }
      else if (clientY >= bottomEdgeStart && canScrollDown) {
        scrollY = autoScrollSpeed;
      }
    }

    if (scrollX !== 0 || scrollY !== 0) {
      container.scrollLeft += scrollX;
      container.scrollTop += scrollY;
    }
  }, [scrollContainerRef, direction, autoScrollSpeed, autoScrollThreshold]);

  // Start continuous auto-scroll interval when dragging
  const startAutoScrollInterval = useCallback(() => {
    if (autoScrollIntervalRef.current) return;
    autoScrollIntervalRef.current = setInterval(() => {
      performAutoScroll();
    }, 16); // ~60fps
  }, [performAutoScroll]);

  const stopAutoScrollInterval = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  // Set up pointer tracking (works during drag via dragover event)
  useEffect(() => {
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
      const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
      if (clientX !== undefined && clientY !== undefined) {
        pointerPositionRef.current = { x: clientX, y: clientY };
      }
    };

    // dragover fires continuously during HTML5 drag - add to window to catch all
    const handleDragOver = (e) => {
      pointerPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    // Track all pointer moves
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mousedown", handlePointerMove);
    window.addEventListener("touchstart", handlePointerMove, { passive: true });
    // dragover on window catches drag position even at edges
    window.addEventListener("dragover", handleDragOver);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mousedown", handlePointerMove);
      window.removeEventListener("touchstart", handlePointerMove);
      window.removeEventListener("dragover", handleDragOver);
      stopAutoScrollInterval();
    };
  }, [stopAutoScrollInterval]);

  // Wrap onDragStateChange to track dragging state for auto-scroll
  const handleDragStateChange = useCallback((dragging, draggedId) => {
    isDraggingRef.current = dragging;
    if (dragging) {
      // Start auto-scroll interval when drag begins
      startAutoScrollInterval();
    } else {
      // Stop auto-scroll interval when drag ends
      stopAutoScrollInterval();
    }
    if (onDragStateChange) {
      onDragStateChange(dragging, draggedId);
    }
  }, [onDragStateChange, startAutoScrollInterval, stopAutoScrollInterval, scrollContainerRef]);

  // Update pointer position from drag monitor (called by DraggableItem during hover)
  const updatePointerPosition = useCallback((clientOffset) => {
    if (clientOffset) {
      pointerPositionRef.current = { x: clientOffset.x, y: clientOffset.y };
    }
  }, []);

  return (
    <DragContext.Provider value={{ moveItem, direction, itemType, onDragStateChange: handleDragStateChange, childArray, updatePointerPosition }}>
      <div
        style={{
          display: direction === "horizontal" ? "flex" : "block",
          width: "98.5%",
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
  const { moveItem, direction, itemType, onDragStateChange, childArray, updatePointerPosition } = useContext(DragContext);

  const [, drop] = useDrop({
    accept: itemType,
    hover(item, monitor) {
      if (!ref.current) return;

      // Update pointer position for auto-scroll (from drag monitor)
      const clientOffset = monitor.getClientOffset();
      if (updatePointerPosition && clientOffset) {
        updatePointerPosition(clientOffset);
      }

      // Throttle hover events to reduce vibration (minimum 50ms between moves)
      const now = Date.now();
      if (now - lastHoverTime.current < 50) return;

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
      opacity: isDragging ? 0.5 : 1,
      display: direction === "horizontal" ? "inline-block" : "block",
      transition: "opacity 0.15s ease-out",
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

  // Prevent parent components (like Ant Design Collapse) from intercepting touch events
  const handleTouchStart = (e) => {
    e.stopPropagation();
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      style={{
        display: "inline-block",
        cursor: "move",
        position: "relative",
        touchAction: "none",  // Critical: prevents scrolling when touching the handle
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",  // Prevent iOS callout
        padding: "12px",  // Larger touch target for mobile
        margin: "-12px",  // Compensate for padding
      }}
    >
      {children}
    </div>
  );
}