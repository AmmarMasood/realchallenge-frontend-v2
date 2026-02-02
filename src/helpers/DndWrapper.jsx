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
  delayTouchStart: 150,  // Short delay - handle's touchAction:"none" does the heavy lifting
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
    }, 16);
  }, [childArray, onChange]);

  // Auto-scroll logic
  const handleAutoScroll = useCallback((clientX, clientY) => {
    const container = scrollContainerRef?.current;
    if (!container || !isDraggingRef.current) return;

    const rect = container.getBoundingClientRect();
    let scrollX = 0;
    let scrollY = 0;

    if (direction === "horizontal") {
      // Check left edge
      if (clientX < rect.left + autoScrollThreshold) {
        scrollX = -autoScrollSpeed;
      }
      // Check right edge
      else if (clientX > rect.right - autoScrollThreshold) {
        scrollX = autoScrollSpeed;
      }
    } else {
      // Check top edge
      if (clientY < rect.top + autoScrollThreshold) {
        scrollY = -autoScrollSpeed;
      }
      // Check bottom edge
      else if (clientY > rect.bottom - autoScrollThreshold) {
        scrollY = autoScrollSpeed;
      }
    }

    if (scrollX !== 0 || scrollY !== 0) {
      container.scrollBy({ left: scrollX, top: scrollY });
    }
  }, [scrollContainerRef, direction, autoScrollSpeed, autoScrollThreshold]);

  // Set up auto-scroll during drag
  useEffect(() => {
    if (!scrollContainerRef?.current) return;

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      handleAutoScroll(clientX, clientY);
    };

    // Use interval for smoother scrolling
    const startAutoScrollInterval = (clientX, clientY) => {
      if (autoScrollIntervalRef.current) return;
      autoScrollIntervalRef.current = setInterval(() => {
        handleAutoScroll(clientX, clientY);
      }, 16); // ~60fps
    };

    const stopAutoScrollInterval = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      stopAutoScrollInterval();
    };
  }, [scrollContainerRef, handleAutoScroll]);

  // Wrap onDragStateChange to track dragging state for auto-scroll
  const handleDragStateChange = useCallback((dragging, draggedId) => {
    isDraggingRef.current = dragging;
    if (!dragging && autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    if (onDragStateChange) {
      onDragStateChange(dragging, draggedId);
    }
  }, [onDragStateChange]);

  return (
    <DragContext.Provider value={{ moveItem, direction, itemType, onDragStateChange: handleDragStateChange, childArray }}>
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
  const { moveItem, direction, itemType, onDragStateChange, childArray } = useContext(DragContext);

  const [, drop] = useDrop({
    accept: itemType,
    hover(item) {
      if (!ref.current) return;

      // Find the current index of the dragged item by its ID
      const dragItemIndex = childArray.findIndex(
        (child) => child?.props?.id === item.id
      );

      // Skip if item hasn't moved or indices are invalid
      if (dragItemIndex === -1 || dragItemIndex === index) return;

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