import { Button, Input, List, Modal } from "antd";
import React, { useContext } from "react";
import { LanguageContext } from "../../../../../contexts/LanguageContext";
import { createChallengeEquipment } from "../../../../../services/createChallenge/equipments";

function EquipmentModal({
  selectedEquipments,
  setSelectedEquipments,
  equipmentModal,
  setEquipmentModal,
  allEquipments,
  removeItem,
  fethData,
  setSelectedItemForUpdateTitle,
  setSelectedItemForUpdate,
  setEditItemNameModalVisible,
}) {
  const { language } = useContext(LanguageContext);
  const [newEquipmentName, setNewEquipmentName] = React.useState("");

  const existInSelectedEquipments = (equipment) => {
    return selectedEquipments.some((item) => item._id === equipment._id);
  };
  const handleEquipmentSelect = (equipment) => {
    if (existInSelectedEquipments(equipment)) {
      const u = selectedEquipments.filter((item) => item._id !== equipment._id);
      setSelectedEquipments(u);
    } else {
      const u = [...selectedEquipments, equipment];
      setSelectedEquipments(u);
    }
  };

  return (
    <Modal
      onCancel={() => setEquipmentModal(false)}
      footer={false}
      visible={equipmentModal}
    >
      <p className="font-paragraph-white">Enter New Equipment Name</p>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          value={newEquipmentName}
          onChange={(e) => setNewEquipmentName(e.target.value)}
        />
        <Button
          type="primary"
          htmlType="submit"
          onClick={async () => {
            if (newEquipmentName.length > 0) {
              await createChallengeEquipment({
                name: newEquipmentName,
                language,
              });
              // setEquipmentModal(false);
              fethData();
            }
          }}
          style={{
            backgroundColor: "var(--color-orange)",
            borderColor: "var(--color-orange)",
            marginLeft: "5px",
          }}
        >
          Create
        </Button>
      </div>
      <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
        <span className="font-subheading-white">All Equipment</span>
        <List
          size="small"
          bordered
          dataSource={allEquipments}
          renderItem={(equipment) => (
            <List.Item
              style={{
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{equipment.name}</span>

              <span>
                <Button
                  type="primary"
                  onClick={handleEquipmentSelect.bind(null, equipment)}
                  style={{ marginRight: "10px" }}
                >
                  {existInSelectedEquipments(equipment) ? "Remove" : "Select"}
                </Button>

                <Button
                  onClick={() => {
                    removeItem(equipment._id);
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
                    setSelectedItemForUpdateTitle("Update Equipment");
                    setSelectedItemForUpdate(equipment);
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
  );
}

export default EquipmentModal;
