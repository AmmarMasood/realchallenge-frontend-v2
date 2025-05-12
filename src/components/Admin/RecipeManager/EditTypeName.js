import React, { useContext, useState } from "react";
import { Button, Input, Modal } from "antd";
import { updateBlogCategory } from "../../../services/blogs";
import {
  updateDiet,
  updateFoodType,
  updateIngredient,
  updateMealType,
} from "../../../services/recipes";
import { LanguageContext } from "../../../contexts/LanguageContext";

function EditTypeName({
  editCategoryNameModalVisible,
  setEditCategoryModelVisible,
  selectedForUpdate,
  fethData,
  titleName,
}) {
  const { language } = useContext(LanguageContext);
  const [newCategoryName, setNewCategoryName] = useState("");
  React.useEffect(() => {
    if (selectedForUpdate) {
      setNewCategoryName(selectedForUpdate.name);
    }
  }, [selectedForUpdate]);

  const updateItem = async () => {
    if (newCategoryName.length > 0) {
      if (titleName === "Update Meal Type") {
        await updateMealType(
          `${newCategoryName}___${language}`,
          selectedForUpdate._id
        );
      }
      if (titleName === "Update Food Type") {
        await updateFoodType(
          `${newCategoryName}___${language}`,
          selectedForUpdate._id
        );
      }
      if (titleName === "Update Diet Type") {
        await updateDiet(newCategoryName, selectedForUpdate._id);
      }

      if (titleName === "Update Ingredient") {
        await updateIngredient(newCategoryName, selectedForUpdate._id);
      }
      setEditCategoryModelVisible(false);
      fethData();
    }
  };

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
