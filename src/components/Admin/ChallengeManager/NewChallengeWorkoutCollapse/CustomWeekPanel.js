import React from "react";
import Collapsible from "react-collapsible";
import { Button, Input, Checkbox } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import CustomWorkoutPanel from "./CustomWorkoutPanel";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const dragHandle = {
  width: "20px",
  height: "20px",
  fontSize: "16px",
  fontWeight: "600",
  float: "right",
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
});

function CustomWeekPanel({
  update,
  week,
  index,
  id,
  weeks,
  setWeeks,
  removeWeek,
  duplicateWeek,
  handleWeekNameChange,
  handleWeekSubtitleChange,
  setCurrentWeek,
  setAddWorkoutModalVisible,
  removeWorkout,
  updateWorkout,
  duplicateWorkout,
  duplicateExercise,
}) {
  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    let nw = [...weeks];
    const items = reorder(
      week.workouts,
      result.source.index,
      result.destination.index
    );
    nw = nw.map((w) => {
      console.log("wew", w);
      if (w.weekId === week.weekId) {
        w.workouts = items;
        console.log("w", w);
      }
      return w;
    });

    setWeeks(nw);
    // console.log("original week", weeks);
    // console.log("new week", nw);
    // console.log("result", result);
  };

  return (
    <Draggable key={week.weekId} draggableId={week.weekId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <Collapsible
            trigger={`${index + 1}. ${week.weekTitle}`}
            triggerTagName={(e) => {
              return (
                <div onClick={e.onClick} style={{ cursor: "pointer" }}>
                  {e.children}
                  <div style={dragHandle} {...provided.dragHandleProps}>
                    <MenuOutlined />
                  </div>
                </div>
              );
            }}
            triggerStyle={{ cursor: "pointer" }}
            key={id}
          >
            <Button
              style={{ float: "right", border: "1px solid red" }}
              type="danger"
              onClick={() => removeWeek(id)}
            >
              Remove
            </Button>
            {!update && (
              <Button
                style={{ float: "right", marginRight: "10px" }}
                type="primary"
                onClick={() => duplicateWeek(week)}
              >
                Duplicate
              </Button>
            )}

            <p
              className="font-paragraph-black"
              style={{
                color: "var(--color-orange)",
                fontWeight: "500",
              }}
            >
              Group Title
            </p>
            <Input
              value={week.weekTitle}
              onChange={(e) => handleWeekNameChange(id, e.target.value)}
            />
            <p
              className="font-paragraph-black"
              style={{
                color: "var(--color-orange)",
                fontWeight: "500",
              }}
            >
              Group Subtitle
            </p>
            <Input
              value={week.weekSubtitle}
              onChange={(e) => handleWeekSubtitleChange(id, e.target.value)}
            />
            <Checkbox
              // checked={}
              // onChange={(e) => setRenderWorkout(e.target.checked)}
              className="font-paragraph-black"
            >
              Fix exercise break length
            </Checkbox>
            <div style={{ textAlign: "right" }}>
              <Button
                style={{
                  backgroundColor: "var(--color-orange)",
                  borderColor: "var(--color-orange)",
                  color: "white",
                  marginTop: "5px",
                  marginBottom: "10px",
                }}
                onClick={() => {
                  setCurrentWeek(id);
                  setAddWorkoutModalVisible(true);
                }}
              >
                Add A Workout
              </Button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {week.workouts.map((t, i) => (
                      <CustomWorkoutPanel
                        update={update}
                        w={week}
                        weeks={weeks}
                        setWeeks={setWeeks}
                        t={t}
                        i={i}
                        setCurrentWeek={setCurrentWeek}
                        removeWorkout={removeWorkout}
                        duplicateWorkout={duplicateWorkout}
                        updateWorkout={updateWorkout}
                        duplicateExercise={duplicateExercise}
                      />
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {/* </Collapse> */}
          </Collapsible>
        </div>
      )}
    </Draggable>
  );
}

export default CustomWeekPanel;
