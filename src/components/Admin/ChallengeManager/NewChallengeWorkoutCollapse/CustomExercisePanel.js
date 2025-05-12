import React from "react";
import Collapsible from "react-collapsible";
import { Button, Input } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Draggable } from "react-beautiful-dnd";

const dragHandle = {
  width: "15px",
  height: "15px",
  fontSize: "14px",
  fontWeight: "600",
  float: "right",
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

function CustomExercisePanel({ w, t, e, i, duplicateExercise, update }) {
  return (
    <Draggable key={e.exerciseId} draggableId={e.exerciseId} index={i}>
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
            trigger={`${i + 1}. ${e.exerciseName}`}
            className="exercise-collapse"
            openedClassName="exercise-collapse"
            triggerTagName={(p) => {
              console.log(p);
              return (
                <div onClick={p.onClick} style={{ cursor: "pointer" }}>
                  {p.children}
                  <div style={dragHandle} {...provided.dragHandleProps}>
                    <MenuOutlined />
                  </div>
                </div>
              );
            }}
            triggerStyle={{ cursor: "pointer" }}
            key={e.exerciseId}
          >
            {t.renderWorkout ? (
              <Button
                style={{ float: "right", marginTop: "10px" }}
                onClick={() => duplicateExercise(w.weekId, t, e)}
              >
                Duplicate
              </Button>
            ) : (
              ""
            )}
            <div className="display-workout-inside-week-container">
              <div>
                <span className="font-paragraph-black">Exercise Name</span>
                <Input value={e.exerciseName} disabled={true} />
              </div>
              <div>
                <span className="font-paragraph-black">
                  Exercise Video Name
                </span>
                <Input value={e.exerciseVideo} disabled={true} />
              </div>
              {t.renderWorkout && (
                <div>
                  <span className="font-paragraph-black">
                    Exercise Group Name
                  </span>
                  <Input value={e.exerciseGroupName} disabled={true} />
                </div>
              )}
              {t.renderWorkout && (
                <div>
                  <span className="font-paragraph-black">
                    Exercise Video Length
                  </span>
                  <Input value={e.exerciseVideo?.videoLength} disabled={true} />
                </div>
              )}
              {t.renderWorkout && (
                <div>
                  <span className="font-paragraph-black">
                    Exercise Audio File
                  </span>
                  <Input value={e.voiceOverFile} disabled={true} />
                </div>
              )}
              {t.renderWorkout && (
                <div>
                  <span className="font-paragraph-black">
                    Break After Exercise
                  </span>
                  <Input value={e.breakAfterExercise} disabled={true} />
                </div>
              )}
            </div>
          </Collapsible>
        </div>
      )}
    </Draggable>
  );
}

export default CustomExercisePanel;
