import { Button, List, Modal } from "antd";
import React from "react";
function ExerciseModal({
  exerciseModal,
  setExerciseModal,
  allExercises,
  onExerciseSelect,
  seletedTrainers,
}) {
  const [filteredExercises, setFilteredExercises] = React.useState([]);

  React.useEffect(() => {
    if (
      allExercises &&
      allExercises.length > 0 &&
      seletedTrainers &&
      seletedTrainers.length > 0
    ) {
      const trainerIds = seletedTrainers.map((trainer) => trainer._id);
      const filtered = allExercises.filter((exercise) => {
        // check if exercise.trainer._id is in trainerIds
        return exercise.trainer && trainerIds.includes(exercise.trainer._id);
      });
      setFilteredExercises(filtered);
    }
  }, [allExercises, seletedTrainers]);

  const onSelect = (exercise) => {
    onExerciseSelect(exercise);
  };

  return (
    <Modal
      onCancel={() => setExerciseModal(false)}
      footer={false}
      visible={exerciseModal}
    >
      <p className="font-paragraph-white">Select Exercise</p>
      <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
        <List
          size="small"
          bordered
          dataSource={filteredExercises}
          renderItem={(ex) => (
            <List.Item
              style={{
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h4>{ex.title}</h4>
                <span>{ex.description}</span>
                <p style={{ margin: 0, padding: 0 }}>
                  Created By: {ex.trainer?.firstName} {ex.trainer?.lastName}
                </p>
              </div>
              <span>
                <Button
                  type="primary"
                  onClick={() => onSelect(ex)}
                  style={{ marginRight: "10px" }}
                >
                  Select
                </Button>
              </span>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}

export default ExerciseModal;
