import React from "react";
import Collapsible from "react-collapsible";
import { Button, Input } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import CustomExercisePanel from "./CustomExercisePanel";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const dragHandle = {
  width: "15px",
  height: "15px",
  fontSize: "14px",
  fontWeight: "600",
  float: "right",
};

function CustomWorkoutPanel({
  update,
  w,
  weeks,
  setWeeks,
  t,
  i,
  duplicateWorkout,
  setCurrentWeek,
  updateWorkout,
  removeWorkout,
  duplicateExercise,
}) {
  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    console.log(result);

    let nw = [...weeks];
    const items = reorder(
      t.exercises,
      result.source.index,
      result.destination.index
    );
    nw = nw.map((week) => {
      if (week.weekId === w.weekId) {
        week = week.workouts.map((workout) => {
          if (workout.workoutId === t.workoutId) {
            workout.exercises = items;
          }
          return Array.isArray(workout) ? workout[0] : workout;
        });
      }
      return week;
    });

    // setWeeks(nw);
    console.log("original week", weeks);
    console.log("new week", nw);
    console.log("result", result);
  };

  return (
    <Draggable key={t.workoutId} draggableId={t.workoutId} index={i}>
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
            trigger={`${i + 1}. ${t.workoutTitle}`}
            className="workout-collapse"
            openedClassName="workout-collapse"
            triggerTagName={(e) => {
              console.log(e);
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
            key={t.workoutId}
          >
            <div style={{ float: "right" }}>
              {
                <Button
                  onClick={() => {
                    duplicateWorkout(w.weekId, t);
                  }}
                >
                  Duplicate
                </Button>
              }
              <Button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setCurrentWeek(w.weekId);
                  updateWorkout(t);
                }}
              >
                Update
              </Button>
              <Button
                style={{ marginLeft: "10px", marginTop: "10px" }}
                onClick={() => removeWorkout(w.weekId, t.workoutId)}
              >
                Remove
              </Button>
            </div>
            <div
              className="display-workout-inside-week-container"
              style={{ paddingTop: "10px" }}
            >
              <div>
                <span className="font-paragraph-black">Workout Title</span>
                <Input value={t.workoutTitle} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Workout Subtitle</span>
                <Input value={t.workoutSubtitle} disabled={true} />
              </div>
              {/* <div>
          <span className="font-paragraph-black">Points</span>
          <Input value={t.points} disabled={true} />
        </div> */}
              {/* <div>
          <span className="font-paragraph-black">Group Name</span>
          <Input value={t.groupName} disabled={true} />
        </div> */}
              <div>
                <span className="font-paragraph-black">
                  Workout Intro Video File
                </span>
                <Input value={t.workoutIntroVideoFile.name} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Render Workout</span>
                <Input value={t.renderWorkout} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Related Products</span>
                <Input value={t.relatedProducts} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Related Equipments</span>
                <Input value={t.relatedEquipments} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Info Title</span>
                <Input value={t.infoTitle} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">Info File</span>
                <Input value={t.infoFile.name} disabled={true} />
              </div>
            </div>
            <h3 className="font-subheading-black">Exercises:</h3>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {t.exercises.map((e, i) => (
                      <CustomExercisePanel
                        w={w}
                        t={t}
                        e={e}
                        i={i}
                        duplicateExercise={duplicateExercise}
                        update={update}
                      />
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Collapsible>
        </div>
      )}
    </Draggable>
  );
}

export default CustomWorkoutPanel;
