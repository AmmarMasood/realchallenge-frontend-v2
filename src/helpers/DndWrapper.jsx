import React, { createContext, useContext, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const ItemTypeWeek = "DRAGGABLE_WEEK";
export const ItemTypeWorkout = "DRAGGABLE_WORKOUT";
export const ItemTypeExercise = "DRAGGABLE_EXERCISE";

const DragContext = createContext();

export function DraggableArea({
  children,
  onChange,
  direction = "vertical",
  itemType,
}) {
  const childArray = React.Children.toArray(children);

  const moveItem = (dragIndex, hoverIndex) => {
    if (
      dragIndex < 0 ||
      hoverIndex < 0 ||
      dragIndex >= childArray.length ||
      hoverIndex >= childArray.length
    ) {
      console.warn("Invalid drag or hover index", dragIndex, hoverIndex);
      return;
    }

    const updatedItems = [...childArray];

    const [removed] = updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, removed);

    // Call onChange with the new order of data (not React elements)
    if (onChange) {
      // If you pass data as a prop (e.g., data-workout), extract it here
      onChange(
        updatedItems.map((child) => {
          if (!child || !child.props) return null;
          return child.props["data-workout"] || child.props.children;
        })
      );
    }
  };

  return (
    <DragContext.Provider value={{ moveItem, direction, itemType }}>
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

export function DraggableItem({ children, index, ...rest }) {
  const ref = useRef(null);
  const { moveItem, direction, itemType } = useContext(DragContext);

  const [, drop] = useDrop({
    accept: itemType,
    hover(item) {
      if (!ref.current || item.index === index) return;

      moveItem(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: itemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: direction === "horizontal" ? "inline-block" : "block",
      }}
      {...rest}
    >
      <DragContext.Provider value={{ drag }}>{children}</DragContext.Provider>
    </div>
  );
}

export function DraggableHandle({ children }) {
  const { drag } = useContext(DragContext);
  const ref = useRef(null);
  drag(ref);
  return (
    <div
      ref={ref}
      style={{
        display: "inline-block",
        cursor: "move",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
