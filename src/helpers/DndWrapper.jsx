import React, { createContext, useContext, useRef, useCallback, useMemo, useEffect, useLayoutEffect, useState } from "react";
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
function useAutoScroll(scrollContainerRef, isDragging, direction, speed, positionRef, edgeSize = 120) {
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // On touch, the finger can't move past the screen edge to trigger full
    // speed, and the dragged card keeps the pointer mid-zone — so a linear
    // ramp crawls. Reach full speed by the time the pointer is RAMP_FRACTION
    // into the edge zone, and never drop below MIN_INTENSITY so it never crawls.
    const MIN_INTENSITY = 0.5;
    const RAMP_FRACTION = 0.5;
    const edgeIntensity = (dist, zone) => {
      const t = 1 - dist / zone; // 0 at the zone boundary → 1 at the edge
      return Math.max(MIN_INTENSITY, Math.min(1, t / RAMP_FRACTION));
    };

    // Frame-rate-INDEPENDENT scroll. On mobile the main thread is busy during a
    // drag (hover events + live-reorder re-renders), so rAF runs well below
    // 60fps. A fixed px-per-frame step then scrolls proportionally slower — the
    // "very slow on phone" symptom. Scale every step by elapsed time so the
    // velocity stays constant no matter the frame rate. `speed` is treated as
    // px-per-frame-at-60fps so existing tuning still maps 1:1 on desktop.
    const FRAME_MS = 1000 / 60;
    let lastTime = null;

    const tick = (now) => {
      if (lastTime == null) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;
      // Cap the multiplier so a long stall (GC pause, tab switch) can't fling
      // the scroll across the whole list in a single frame.
      const factor = Math.min(dt / FRAME_MS, 4) || 1;

      // With an explicit container, scroll that; otherwise fall back to the
      // page itself so lists living in normal document flow (weeks, workouts)
      // still auto-scroll when the drag nears the viewport edges. Native
      // HTML5 drag autoscroll only exists on some desktop browsers and not
      // at all on the touch backend.
      const container = scrollContainerRef?.current || null;
      const scrollEl =
        container || document.scrollingElement || document.documentElement;
      const rect = container
        ? container.getBoundingClientRect()
        : {
            top: 0,
            left: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
          };
      const { x, y } = positionRef.current;

      // Skip if position hasn't been set yet
      if (x === 0 && y === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Clamp the activation zone so the two edge zones can never overlap and
      // cover the whole strip (e.g. a 500px zone on a phone-width container) —
      // always leave at least the middle third neutral.
      const axisLength =
        direction === "horizontal"
          ? rect.right - rect.left
          : rect.bottom - rect.top;
      const zone = Math.max(1, Math.min(edgeSize, axisLength / 3));

      if (direction === "horizontal") {
        const distFromLeft = x - rect.left;
        const distFromRight = rect.right - x;

        // Also scroll when finger is OUTSIDE the container (past edges)
        if (distFromLeft < 0) {
          scrollEl.scrollLeft -= speed * factor;
        } else if (distFromRight < 0) {
          scrollEl.scrollLeft += speed * factor;
        } else if (distFromLeft < zone) {
          scrollEl.scrollLeft -= speed * edgeIntensity(distFromLeft, zone) * factor;
        } else if (distFromRight < zone) {
          scrollEl.scrollLeft += speed * edgeIntensity(distFromRight, zone) * factor;
        }
      } else {
        const distFromTop = y - rect.top;
        const distFromBottom = rect.bottom - y;

        if (distFromTop < 0) {
          scrollEl.scrollTop -= speed * factor;
        } else if (distFromBottom < 0) {
          scrollEl.scrollTop += speed * factor;
        } else if (distFromTop < zone) {
          scrollEl.scrollTop -= speed * edgeIntensity(distFromTop, zone) * factor;
        } else if (distFromBottom < zone) {
          scrollEl.scrollTop += speed * edgeIntensity(distFromBottom, zone) * factor;
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
  }, [isDragging, scrollContainerRef, direction, speed, positionRef, edgeSize]);
}

export function DraggableArea({
  children,
  onChange,
  direction = "vertical",
  itemType,
  onDragStateChange,
  scrollContainerRef,
  autoScrollSpeed = 12,
  // Size (px) of the edge zones where auto-scroll activates, measured inward
  // from the scroll container's visible edges. Clamped to a third of the
  // container so the zones never meet in the middle.
  autoScrollThreshold = 120,
}) {
  const childArray = React.Children.toArray(children);
  const [isDragging, setIsDragging] = useState(false);
  // Shared ref for drag position — updated by DraggableItem hover via monitor.getClientOffset()
  const dragPositionRef = useRef({ x: 0, y: 0 });
  // id → DOM node for every rendered DraggableItem, used to measure and
  // transform items during a drag without touching the DOM order.
  const itemNodesRef = useRef(new Map());
  // Active drag session. The DOM order is FROZEN for the whole drag and the
  // pending order is shown purely with transforms; onChange commits once, on
  // drop. Committing every swap mid-drag (the old approach) reordered the DOM
  // under an active touch, which makes mobile browsers freeze or drop the
  // touch stream — the "drag dies after the first swap" bug on phones.
  const dragSessionRef = useRef(null);

  // Auto-scroll when dragging near container edges
  useAutoScroll(
    scrollContainerRef,
    isDragging,
    direction,
    autoScrollSpeed,
    dragPositionRef,
    autoScrollThreshold
  );

  const registerItemNode = useCallback((itemId, el) => {
    if (el) itemNodesRef.current.set(itemId, el);
    else itemNodesRef.current.delete(itemId);
  }, []);

  // Snapshot every item's slot (position + size along the drag axis) at drag
  // start; slots can't change mid-drag since the DOM is frozen.
  const beginDragSession = useCallback(() => {
    const horizontal = direction === "horizontal";
    const ids = childArray
      .map((child) => child?.props?.id)
      .filter((itemId) => itemId !== undefined);
    const starts = new Map();
    const sizes = new Map();
    ids.forEach((itemId) => {
      const el = itemNodesRef.current.get(itemId);
      if (!el) return;
      starts.set(itemId, horizontal ? el.offsetLeft : el.offsetTop);
      sizes.set(itemId, horizontal ? el.offsetWidth : el.offsetHeight);
    });
    // Spacing between consecutive slots (margins / flex gaps), per pair
    const gaps = [];
    for (let i = 0; i < ids.length - 1; i++) {
      gaps.push(
        (starts.get(ids[i + 1]) || 0) -
          ((starts.get(ids[i]) || 0) + (sizes.get(ids[i]) || 0))
      );
    }
    dragSessionRef.current = {
      originalOrder: ids,
      order: [...ids],
      starts,
      sizes,
      gaps,
      translates: new Map(),
    };
  }, [childArray, direction]);

  // Show the pending order by translating each item from its frozen DOM slot
  // to where it belongs: walk the pending order accumulating sizes + gaps.
  const applyPendingTransforms = useCallback(
    (draggedId) => {
      const session = dragSessionRef.current;
      if (!session || session.originalOrder.length === 0) return;
      const horizontal = direction === "horizontal";
      let cursor = session.starts.get(session.originalOrder[0]) || 0;
      session.order.forEach((itemId, k) => {
        const target = cursor;
        cursor +=
          (session.sizes.get(itemId) || 0) +
          (k < session.gaps.length ? session.gaps[k] : 0);
        const delta = target - (session.starts.get(itemId) || 0);
        session.translates.set(itemId, delta);
        const el = itemNodesRef.current.get(itemId);
        if (!el) return;
        const translate = horizontal
          ? `translateX(${delta}px)`
          : `translateY(${delta}px)`;
        const scale = itemId === draggedId ? " scale(0.95)" : "";
        el.style.transition = prefersReducedMotion()
          ? "none"
          : "transform 0.15s ease";
        el.style.transform = delta || scale ? `${translate}${scale}` : "";
      });
    },
    [direction]
  );

  const moveItem = useCallback(
    (dragId, hoverId) => {
      const session = dragSessionRef.current;
      if (!session) return;
      const from = session.order.indexOf(dragId);
      const to = session.order.indexOf(hoverId);
      if (from === -1 || to === -1 || from === to) return;
      session.order.splice(from, 1);
      session.order.splice(to, 0, dragId);
      applyPendingTransforms(dragId);
    },
    [applyPendingTransforms]
  );

  const handleDragStateChange = useCallback(
    (dragging, draggedId) => {
      if (dragging) {
        beginDragSession();
      } else {
        // Drop: commit the pending order once. The touch/drag is already
        // over, so the DOM reorder this triggers can't kill the gesture.
        const session = dragSessionRef.current;
        const changed =
          session &&
          session.order.some(
            (itemId, i) => itemId !== session.originalOrder[i]
          );
        if (changed && onChange) {
          onChange(
            session.order.map((itemId) => ({ key: itemId, id: itemId }))
          );
        }
      }
      setIsDragging(dragging);
      if (!dragging) {
        dragPositionRef.current = { x: 0, y: 0 };
      }
      if (onDragStateChange) {
        onDragStateChange(dragging, draggedId);
      }
    },
    [beginDragSession, onChange, onDragStateChange]
  );

  // After the drop commits, children re-render in their real new DOM order
  // within this same task — remove the session transforms before paint so
  // every item sits exactly in its (now real) slot with no visible jump.
  useLayoutEffect(() => {
    if (isDragging || !dragSessionRef.current) return;
    dragSessionRef.current = null;
    itemNodesRef.current.forEach((el) => {
      el.style.transition = "none";
      el.style.transform = "";
    });
  }, [isDragging]);

  return (
    <DragContext.Provider value={{ moveItem, direction, itemType, onDragStateChange: handleDragStateChange, dragPositionRef, dragSessionRef, registerItemNode }}>
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

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Current translate applied to an element (e.g. an in-flight FLIP slide).
// Used to (a) continue interrupted slides from where they visually are and
// (b) do hover math against the settled layout position instead of a
// mid-animation snapshot.
const getCurrentTranslate = (el) => {
  const t = window.getComputedStyle(el).transform;
  if (!t || t === "none") return { x: 0, y: 0 };
  try {
    const m = new DOMMatrixReadOnly(t);
    return { x: m.m41, y: m.m42 };
  } catch (err) {
    return { x: 0, y: 0 };
  }
};

export function DraggableItem({ children, index, id, style, ...rest }) {
  const ref = useRef(null);
  const handleRef = useRef(null);
  const lastHoverTime = useRef(0);
  const lastLayoutPosRef = useRef(null);
  const { moveItem, direction, itemType, onDragStateChange, dragPositionRef, dragSessionRef, registerItemNode } = useContext(DragContext);

  // Expose this item's DOM node to the area so it can measure slots at drag
  // start and apply the pending-order transforms.
  useEffect(() => {
    if (registerItemNode) {
      registerItemNode(id, ref.current);
      return () => registerItemNode(id, null);
    }
  }, [id, registerItemNode]);

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

      // Reorder happens in the drag session's PENDING order (the DOM order is
      // frozen during the drag). No session here means the drag started in a
      // different DraggableArea — cross-area drops aren't supported.
      const session = dragSessionRef && dragSessionRef.current;
      if (!session) return;
      const dragIdx = session.order.indexOf(item.id);
      const hoverIdx = session.order.indexOf(id);
      if (dragIdx === -1 || hoverIdx === -1 || dragIdx === hoverIdx) return;
      if (!clientOffset) return;

      // Hysteresis: only swap once the pointer is clearly past this item's
      // midpoint in the drag direction — otherwise the post-swap shift puts
      // the pointer back over the other item and they oscillate. Measure at
      // the item's SETTLED pending position (bounding rect minus in-flight
      // animation, plus its assigned session translate) so a card sliding
      // through the pointer can't re-trigger the swap in reverse.
      const rect = ref.current.getBoundingClientRect();
      const inFlight = getCurrentTranslate(ref.current);
      const applied = (session.translates && session.translates.get(id)) || 0;

      if (direction === "horizontal") {
        const settledLeft = rect.left - inFlight.x + applied;
        const half = rect.width / 2;
        const pointerX = clientOffset.x - settledLeft;

        // Only move if cursor is clearly past the middle (30% threshold)
        const threshold = half * 0.3;
        if (dragIdx < hoverIdx && pointerX < half - threshold) return;
        if (dragIdx > hoverIdx && pointerX > half + threshold) return;
      } else {
        const settledTop = rect.top - inFlight.y + applied;
        const half = rect.height / 2;
        const pointerY = clientOffset.y - settledTop;
        if (dragIdx < hoverIdx && pointerY < half) return;
        if (dragIdx > hoverIdx && pointerY > half) return;
      }

      lastHoverTime.current = now;
      moveItem(item.id, id);
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

  // FLIP slide: when a reorder commits, React moves elements to their new
  // layout slots in a single instant jump. Measure the layout position
  // (offsetLeft/offsetTop — unaffected by page scroll or in-flight
  // transforms, unlike getBoundingClientRect) on every render; if it moved,
  // start the element back at its old slot and transition to the new one.
  // The dragged item keeps its scale so the faded placeholder slides too.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pos = { left: el.offsetLeft, top: el.offsetTop };
    const last = lastLayoutPosRef.current;
    lastLayoutPosRef.current = pos;
    if (!last || prefersReducedMotion()) return;
    // While a drag session is active the area owns all transforms (pending-
    // order preview + drop cleanup) — FLIP only animates non-drag layout
    // moves such as delete/duplicate/add.
    if (dragSessionRef && dragSessionRef.current) return;
    const movedX = last.left - pos.left;
    const movedY = last.top - pos.top;
    if (!movedX && !movedY) return;
    // If a previous slide is still in flight, start from where the element
    // visually is (layout delta + current translate) — otherwise a rapid
    // second reorder snaps it back to its old slot before sliding again.
    const inFlight = getCurrentTranslate(el);
    const dx = movedX + inFlight.x;
    const dy = movedY + inFlight.y;
    const scale = isDragging ? " scale(0.95)" : "";
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)${scale}`;
    void el.offsetWidth; // flush styles so the jump back isn't transitioned
    el.style.transition = "transform 0.15s ease, opacity 0.1s ease-out";
    el.style.transform = isDragging ? "scale(0.95)" : "";
  });

  // Merge caller styles on top instead of letting {...rest} replace the
  // whole style object — Exercises passes style={{ zIndex: 1 }}, which used
  // to wipe out the drag opacity/scale styling entirely.
  const itemStyle = useMemo(
    () => ({
      opacity: isDragging ? 0.4 : 1,
      display: direction === "horizontal" ? "inline-block" : "block",
      flexShrink: direction === "horizontal" ? 0 : undefined,
      transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
      transform: isDragging ? "scale(0.95)" : "scale(1)",
      ...style,
    }),
    [isDragging, direction, style]
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
