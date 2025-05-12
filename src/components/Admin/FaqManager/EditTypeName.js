import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { updateFaqCategory } from "../../../services/faqs";

function EditTypeName({
  editItemNameModalVisible,
  setEditItemModelVisible,
  selectedItemForUpdate,
  fethData,
  titleName,
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  React.useEffect(() => {
    if (selectedItemForUpdate) {
      setNewCategoryName(selectedItemForUpdate.name);
    }
  }, [selectedItemForUpdate]);

  const updateItem = async () => {
    if (newCategoryName.length > 0) {
      if (titleName === "Update Faq Category") {
        await updateFaqCategory(newCategoryName, selectedItemForUpdate._id);
      }
      setEditItemModelVisible(false);
      fethData();
    }
  };

  return (
    <Modal
      onCancel={() => setEditItemModelVisible(false)}
      footer={false}
      visible={editItemNameModalVisible}
    >
      <p className="font-paragraph-white">{titleName}</p>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button
          type="primary"
          htmlType="submit"
          onClick={updateItem}
          style={{
            backgroundColor: "var(--color-orange)",
            borderColor: "var(--color-orange)",
            marginLeft: "5px",
          }}
        >
          Update
        </Button>
      </div>
    </Modal>
  );
}

export default EditTypeName;
