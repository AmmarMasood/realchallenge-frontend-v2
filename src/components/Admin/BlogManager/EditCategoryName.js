import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
import { updateBlogCategory } from "../../../services/blogs";

function EditCategoryName({
  editCategoryNameModalVisible,
  setEditCategoryModelVisible,
  selectedForUpdate,
  fethData,
  titleName,
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  React.useEffect(() => {
    if (selectedForUpdate) {
      setNewCategoryName(selectedForUpdate.name);
    }
  }, [selectedForUpdate]);

  return (
    <Modal
      onCancel={() => setEditCategoryModelVisible(false)}
      footer={false}
      visible={editCategoryNameModalVisible}
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
          onClick={async () => {
            if (newCategoryName.length > 0) {
              await updateBlogCategory(newCategoryName, selectedForUpdate._id);
              setEditCategoryModelVisible(false);
              fethData();
            }
          }}
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

export default EditCategoryName;
