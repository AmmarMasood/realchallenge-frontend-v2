import { Button, Input, List, Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import EditTypeName from "../../UserManager/EditTypeName";

function CreateGoalsModal({
  showTrainerGoalModal,
  setShowTrainerGoalModal,
  createTrainerGoal,
  allTrainerGoals,
  deleteTrainerGoals,
  fetchData,
}) {
  const { language } = useContext(LanguageContext);
  const [newTrainerGoalName, setNewTrainerGoalName] = useState("");
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(null);
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  useEffect(() => {
    return () => {
      setNewTrainerGoalName("");
    };
  }, []);
  return (
    <>
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fetchData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
      <Modal
        onCancel={() => setShowTrainerGoalModal(false)}
        footer={false}
        visible={showTrainerGoalModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white"> Create A New Fitness Interest</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newTrainerGoalName}
            onChange={(e) => setNewTrainerGoalName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newTrainerGoalName.length > 0) {
                await createTrainerGoal({ name: newTrainerGoalName, language });
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Fitness Interests</span>
          <List
            size="small"
            bordered
            dataSource={allTrainerGoals}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={async () => {
                      await deleteTrainerGoals(g._id);
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    Delete
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle("Update Fitness Interest");
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </>
  );
}

export default CreateGoalsModal;
