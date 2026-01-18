import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Select as AntdSelect,
  Modal,
  InputNumber,
  List,
} from "antd";
import Select from "react-select";
import { PlusOutlined, CloseSquareOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import {
  createIngredient,
  createDiet,
  createFoodType,
  createMealType,
  getAllDietTypes,
  getAllMealTypes,
  getAllFoodTypes,
  getAllIngredients,
  removeMealType,
  removeFoodType,
  removeDiet,
  removeIngredient,
  createRecipe,
  getAllRecipes,
  getAllUserRecipes,
} from "../../../services/recipes";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { createPost } from "../../../services/posts";
import { userInfoContext } from "../../../contexts/UserStore";
import Checkbox from "antd/lib/checkbox/Checkbox";
import EditTypeName from "./EditTypeName";
import slug from "elegant-slug";
import TextEditor from "../../TextEditor";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { getTranslationsByKey } from "../../../services/translations";
import { T } from "../../Translate";
import { get } from "lodash";

const { Option } = AntdSelect;

function NewRecipe({ setCurrentSelection }) {
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const { language, strings } = useContext(LanguageContext);
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  // -----------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnailBase64, setThumbnailBase64] = useState("");
  const [preprationTime, setPreprationTime] = useState("");
  const [persons, setPersons] = useState("");
  const [kcalPerPersons, setKcalPerPersons] = useState("");
  const [saturationIndex, setSaturationIndex] = useState("");
  const [protein, setProtein] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [allowReviews, setAllowReviews] = useState(false);
  //meal type
  const [mealTypes, setMealTypes] = useState([]);
  const [allMealTypes, setAllMealTypes] = useState([]);
  const [mealTypeModalVisible, setMealTypeModalVisible] = useState(false);
  const [newMealTypeName, setNewMealTypeName] = useState("");
  //=food type
  const [foodType, setFoodTypes] = useState([]);
  const [allFoodTypes, setAllFoodTypes] = useState([]);
  const [foodTypeModalVisible, setFoodTypeModalVisible] = useState(false);
  const [newFoodTypeName, setNewFoodTypeName] = useState("");
  //=diet
  const [diet, setDiet] = useState([]);
  const [allDiets, setAllDiets] = useState([]);
  const [dietModalVisible, setDietModalVisible] = useState(false);
  const [newDietName, setNewDietName] = useState("");
  //   INGREDIETS
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredientModalVisible, setNewIngredientModlVisible] =
    useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  //   cooking process\
  const [cookingProcess, setCookingProcess] = useState([]);
  const [notes, setNotes] = useState("");
  const [tips, setTips] = useState("");
  // all recipes
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [translationKey, setTranslationKey] = useState(null);
  // --------------
  // const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [userCreatePost, setUserCreatePost] = useState(false);
  // update stuff
  const [editItemNameModalVisible, setEditItemModelVisible] = useState(false);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  const [sendNotifications, setSendNotifications] = useState(false);

  async function fetchData() {
    const diets = await getAllDietTypes(language);
    const meals = await getAllMealTypes(language);
    const foodTypes = await getAllFoodTypes(language);
    const ingredients = await getAllIngredients(language);

    setAllDiets(diets.diets);
    setAllMealTypes(
      meals.mealTypes.map((f) => ({ ...f, name: f.name.split("___")[0] }))
    );
    setAllFoodTypes(
      foodTypes.foodTypes.map((f) => ({ ...f, name: f.name.split("___")[0] }))
    );
    setAllIngredients(ingredients.ingredients);
  }

  async function fetchAllRecipes() {
    const res = await getAllUserRecipes(
      language === "english" ? "dutch" : "english"
    );
    if (res && res.recipes) {
      setAllRecipes(res.recipes);
    }
  }
  useEffect(() => {
    // Reset translation state when language changes
    setSelectedRecipe("");
    setTranslationKey(null);
    fetchData();
    fetchAllRecipes();
  }, [language]);

  // Handle selecting a recipe to translate
  const handleSelectRecipe = (recipeId) => {
    setSelectedRecipe(recipeId);
    if (recipeId) {
      const recipe = allRecipes.find((r) => r._id === recipeId);
      if (recipe && recipe.translationKey) {
        setTranslationKey(recipe.translationKey);
      } else {
        setTranslationKey(null);
      }
    } else {
      setTranslationKey(null);
    }
  };

  const ing = {
    id: v4(),
    name: "",
    weight: "",
    volume: "",
    pieces: "",
    method: "",
    other: "",
  };

  const onFinish = async (values) => {
    if (description.length <= 0) {
      alert(get(strings, "admin.please_add_description", "Please add description"));
      return;
    }
    const d = {
      name,
      description,
      language: language,
      image: featuredImage.link,
      prepTime: preprationTime,
      kCalPerPerson: kcalPerPersons,
      saturationIndex: saturationIndex,
      protein: protein,
      carbohydrate: carbohydrates,
      persons: persons,
      fat: fat,
      fiber: fiber,
      mealTypes: mealTypes.map((f) => f.value),
      foodTypes: foodType.map((f) => f.value),
      diet: diet.map((f) => f.value),
      ingredients: ingredients,
      cookingProcess: cookingProcess,
      notes: notes,
      tips: tips,
      isPublic: isPublic,
      allowComments: allowComments,
      allowReviews: allowReviews,
      sendNotification: sendNotifications,
    };

    // alternativeLanguage removed - using translationKey for multi-language support
    if (translationKey) d.translationKey = translationKey;
    // console.log("Success:", values);
    // console.log(values);

    const res = await createRecipe(d);
    if (res) {
      userCreatePost && createAPost(res.newRecipe._id);
      // updateSelectedRecipe removed - using translationKey for multi-language support
      setCurrentSelection(4.1);
    }

    console.log("res", res);
  };

  // updateSelectedRecipe removed - using translationKey for multi-language support

  const createAPost = async (id) => {
    const values = {
      title: name,
      text: description,
      image: featuredImage.link,
      type: "Recipe",
      url: `/recipe/${slug(name)}/${id}`,
      language: language,
    };
    await createPost(values);
    // setCreatePostModalVisible(false);
    // console.log(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const changeIngredientValue = (key, ingredientId, value) => {
    let i = [...ingredients];
    i = i.map((ingre) => {
      if (ingre.id === ingredientId) {
        ingre[key] = value;
      }
      return ingre;
    });
    setIngredients(i);
  };

  const removeIngredientListItem = (item) => {
    let i = [...ingredients];
    i = i.filter((ingre) => ingre.id !== item.id);
    setIngredients(i);
  };
  const renderIngredientsList = (item) => (
    <List.Item style={{ display: "block", textAlign: "right" }}>
      <Button type="danger" onClick={() => removeIngredientListItem(item)}>
        <T>admin.remove</T>
      </Button>

      <div className="new-recipe-ingredient-listitem">
        <div>
          <span className="font-paragraph-black"><T>admin.select_ingredient</T></span>
          <Select
            onChange={(e) => changeIngredientValue("name", item.id, e.value)}
            options={allIngredients.map((food) => ({
              label: food.name,
              value: food._id,
            }))}
          />
          {/* <AntdSelect
            style={{ width: "100%" }}
            showSearch
            onSearch={(v) => console.log("value", v)}
            onChange={(e) => changeIngredientValue("name", item.id, e)}
            listHeight="100"
            filterOption={(input, option) => {
              // console.log("value", input,option);
              return (
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {allIngredients.map((i) => (
              <Option value={i._id} key={i._id}>
                {i.name}
              </Option>
            ))}
          </AntdSelect> */}
        </div>
        <div>
          <span className="font-paragraph-black"><T>admin.weight_gm</T></span>
          <Input
            type="number"
            placeholder={get(strings, "admin.enter_weight", "Enter Weight")}
            value={item.weight}
            onChange={(e) =>
              changeIngredientValue("weight", item.id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black"><T>admin.volume_ml</T></span>
          <Input
            type="number"
            placeholder={get(strings, "admin.enter_volume", "Enter Volume")}
            value={item.volume}
            onChange={(e) =>
              changeIngredientValue("volume", item.id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black"><T>admin.pieces</T></span>
          <Input
            type="number"
            placeholder={get(strings, "admin.enter_pieces", "Enter Pieces")}
            value={item.pieces}
            onChange={(e) =>
              changeIngredientValue("pieces", item.id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black"><T>admin.method</T></span>
          <Input
            placeholder={get(strings, "admin.enter_method", "Enter Method")}
            value={item.method}
            onChange={(e) =>
              changeIngredientValue("method", item.id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black"><T>admin.other</T></span>
          <Input
            placeholder={get(strings, "admin.enter_other", "Enter Other")}
            value={item.other}
            onChange={(e) =>
              changeIngredientValue("other", item.id, e.target.value)
            }
          />
        </div>
      </div>
    </List.Item>
  );

  const removeCookingProcessItem = (item, index) => {
    let cp = [...cookingProcess];
    cp.splice(index, 1);
    setCookingProcess(cp);
  };

  const onchangeCookingProcess = (value, index) => {
    let cp = [...cookingProcess];
    cp[index] = value;
    setCookingProcess(cp);
  };
  const renderCookingProcessList = (item, index) => (
    <List.Item>
      <span className="font-subheading-black" style={{ marginRight: "10px" }}>
        {index + 1}
      </span>
      <Input.TextArea
        value={item}
        onChange={(e) => onchangeCookingProcess(e.target.value, index)}
        style={{ marginRight: "10px" }}
        rows={2}
      />
      <Button
        type="danger"
        onClick={() => removeCookingProcessItem(item, index)}
      >
        <T>admin.remove</T>
      </Button>
    </List.Item>
  );

  return (
    <>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />

      {/* modal to create a new meal type  */}
      <Modal
        onCancel={() => setMealTypeModalVisible(false)}
        footer={false}
        visible={mealTypeModalVisible}
      >
        <p className="font-paragraph-white"><T>admin.enter_meal_type</T></p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newMealTypeName}
            onChange={(e) => setNewMealTypeName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newMealTypeName.length > 0) {
                await createMealType(
                  `${newMealTypeName}___${language}`,
                  language
                );
                // setEquipmentModal(false);
                fetchData();
              }
            }}
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_meal_types</T></span>
          <List
            size="small"
            bordered
            dataSource={allMealTypes}
            renderItem={(cat) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{cat.name}</span>
                <span>
                  <Button
                    onClick={async () => {
                      await removeMealType(cat._id);
                      fetchData();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(get(strings, "admin.update_meal_type", "Update Meal Type"));
                      setSelectedItemForUpdate(cat);
                      setEditItemModelVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* modal to create a new food type  */}
      <Modal
        onCancel={() => setFoodTypeModalVisible(false)}
        footer={false}
        visible={foodTypeModalVisible}
      >
        <p className="font-paragraph-white"><T>admin.enter_food_type</T></p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newFoodTypeName}
            onChange={(e) => setNewFoodTypeName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newFoodTypeName.length > 0) {
                await createFoodType(
                  `${newFoodTypeName}___${language}`,
                  language
                );
                // setEquipmentModal(false);
                fetchData();
              }
            }}
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_food_types</T></span>
          <List
            size="small"
            bordered
            dataSource={allFoodTypes}
            renderItem={(cat) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{cat.name}</span>

                <span>
                  <Button
                    onClick={async () => {
                      await removeFoodType(cat._id);
                      fetchData();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(get(strings, "admin.update_food_type", "Update Food Type"));
                      setSelectedItemForUpdate(cat);
                      setEditItemModelVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* modal to create a new diet  */}
      <Modal
        onCancel={() => setDietModalVisible(false)}
        footer={false}
        visible={dietModalVisible}
      >
        <p className="font-paragraph-white"><T>admin.enter_diet</T></p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newDietName}
            onChange={(e) => setNewDietName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newDietName.length > 0) {
                await createDiet(newDietName, language);
                // setEquipmentModal(false);
                fetchData();
              }
            }}
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_diet_types</T></span>
          <List
            size="small"
            bordered
            dataSource={allDiets}
            renderItem={(cat) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{cat.name}</span>

                <span>
                  <Button
                    onClick={async () => {
                      await removeDiet(cat._id);
                      fetchData();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(get(strings, "admin.update_diet_type", "Update Diet Type"));
                      setSelectedItemForUpdate(cat);
                      setEditItemModelVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* modal to create a new ingredient  */}
      <Modal
        onCancel={() => setNewIngredientModlVisible(false)}
        footer={false}
        visible={newIngredientModalVisible}
      >
        <p className="font-paragraph-white"><T>admin.enter_ingredient</T></p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newIngredientName}
            onChange={(e) => setNewIngredientName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newIngredientName.length > 0) {
                await createIngredient(newIngredientName, language);
                // setEquipmentModal(false);
                fetchData();
              }
            }}
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_ingredients</T></span>
          <List
            size="small"
            bordered
            dataSource={allIngredients}
            renderItem={(cat) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{cat.name}</span>

                <span>
                  <Button
                    onClick={async () => {
                      await removeIngredient(cat._id);
                      fetchData();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(get(strings, "admin.update_ingredient", "Update Ingredient"));
                      setSelectedItemForUpdate(cat);
                      setEditItemModelVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
      <EditTypeName
        editCategoryNameModalVisible={editItemNameModalVisible}
        setEditCategoryModelVisible={setEditItemModelVisible}
        fethData={fetchData}
        selectedForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />

      <h2 className="font-heading-black"><T>admin.new_recipe</T></h2>

      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <div style={{ marginTop: "-40px", marginBottom: "20px" }}>
          <span style={{ marginRight: "5px" }}><T>admin.select_language</T>:</span>
          <LanguageSelector notFromNav={true} />
          <div>
            <span
              style={{ marginRight: "5px" }}
            ><T>admin.select_alternative_language_version</T></span>
            <AntdSelect
              style={{ width: "500px" }}
              value={selectedRecipe}
              onChange={handleSelectRecipe}
            >
              <Option value={""}>-</Option>
              {allRecipes.map((r) => (
                <Option key={r._id} value={r._id}>
                  {r.name}
                </Option>
              ))}
            </AntdSelect>
          </div>
        </div>
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label={<T>admin.recipe_name</T>}
            name="recipeName"
            rules={[{ required: true, message: get(strings, "admin.please_input_recipe_name", "Please input recipe name!") }]}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Item>
          <Form.Item label={<T>admin.recipe_description</T>} name="recipeDescription">
            <TextEditor value={description} setValue={setDescription} />
            {/* <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            /> */}
          </Form.Item>
          <Form.Item label={<T>admin.featured_image</T>} name="featuredImage">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("images");
                setMediaManagerActions([featuredImage, setFeaturedImage]);
              }}
            >
              <T>admin.upload_file</T>
            </Button>
            {typeof featuredImage === "object" && (
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: "15px",
                    marginTop: "10px",
                  }}
                >
                  <img
                    alt=""
                    src={`${featuredImage.link}`}
                    height="auto"
                    width={"80%"}
                  />
                  <span>
                    {featuredImage.name}{" "}
                    <CloseSquareOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => setFeaturedImage()}
                    />
                  </span>
                </div>
              </div>
            )}
          </Form.Item>
          <Form layout="vertical">
            <div className="new-recipe-information-inputs-container">
              <Form.Item
                label={<T>admin.preparation_time</T>}
                name="preprationTime"
                // rules={[
                //   { required: true, message: "Please input prepration time!" },
                // ]}
                type="number"
              >
                <InputNumber
                  value={preprationTime}
                  onChange={(e) => setPreprationTime(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.persons</T>}
                name="persons"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input number of persons!",
                //   },
                // ]}
                type="number"
              >
                <InputNumber
                  value={persons}
                  onChange={(e) => setPersons(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.kcal_per_person</T>}
                name="kcalPerPerson"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please input number of calories per person!",
                //   },
                // ]}
                type="number"
              >
                <InputNumber
                  value={kcalPerPersons}
                  onChange={(e) => setKcalPerPersons(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.saturation_index</T>}
                name="saturationIndex"
                type="number"
              >
                <InputNumber
                  value={saturationIndex}
                  onChange={(e) => setSaturationIndex(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.protein</T>}
                name="protein"
                // rules={[{ required: true, message: "Please input protein!" }]}
                type="number"
              >
                <InputNumber
                  value={protein}
                  onChange={(e) => setProtein(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.carbohydrates</T>}
                name="carbohydrates"
                rules={
                  [
                    // { required: true, message: "Please input carbohydrates!" },
                  ]
                }
                type="number"
              >
                <InputNumber
                  value={carbohydrates}
                  onChange={(e) => setCarbohydrates(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.fat</T>}
                name="fat"
                // rules={[{ required: true, message: "Please input fats!" }]}
                type="number"
              >
                <InputNumber
                  value={fat}
                  onChange={(e) => setFat(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                label={<T>admin.fiber</T>}
                name="fiber"
                // rules={[{ required: true, message: "Please input fiber!" }]}
                type="number"
              >
                <InputNumber
                  value={fiber}
                  onChange={(e) => setFiber(e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
          </Form>
          <Form.Item label={<T>admin.meal_types</T>} name="mealTypes">
            <Select
              isMulti
              onChange={(e) => setMealTypes(e)}
              value={mealTypes}
              options={allMealTypes.map((food) => ({
                label: food.name,
                value: food._id,
              }))}
            />
            {/* <AntdSelect
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={mealTypes}
              onChange={(e) => setMealTypes(e)}
            >
              {allMealTypes.map((meal) => (
                <Option value={meal._id} key={meal._id}>
                  {meal.name}
                </Option>
              ))}
            </AntdSelect> */}
            <Button
              style={{
                backgroundColor: "var(--color-orange)",
                border: "none",
                color: "white",
                float: "right",
                marginTop: "5px",
              }}
              onClick={() => setMealTypeModalVisible(true)}
            >
              <T>admin.manage_meal_type</T>
            </Button>
          </Form.Item>
          <Form.Item label={<T>admin.food_types</T>} name="foodTypes">
            <Select
              isMulti
              onChange={(e) => setFoodTypes(e)}
              value={foodType}
              options={allFoodTypes.map((food) => ({
                label: food.name,
                value: food._id,
              }))}
            />
            {/* <AntdSelect
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={foodType}
              onChange={(e) => setFoodTypes(e)}
            >
              {allFoodTypes.map((food) => (
                <Option value={food._id} key={food._id}>
                  {food.name}
                </Option>
              ))}
            </AntdSelect> */}
            <Button
              style={{
                backgroundColor: "var(--color-orange)",
                border: "none",
                color: "white",
                float: "right",
                marginTop: "5px",
              }}
              onClick={() => setFoodTypeModalVisible(true)}
            >
              <T>admin.manage_food_type</T>
            </Button>
          </Form.Item>
          <Form.Item label={<T>admin.diet</T>} name="diet">
            <Select
              isMulti
              onChange={(e) => setDiet(e)}
              value={diet}
              options={allDiets.map((food) => ({
                label: food.name,
                value: food._id,
              }))}
            />
            {/* <AntdSelect
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={diet}
              onChange={(e) => setDiet(e)}
            >
              {allDiets.map((d) => (
                <Option value={d._id} key={d._id}>
                  {d.name}
                </Option>
              ))}
            </AntdSelect> */}
            <Button
              style={{
                backgroundColor: "var(--color-orange)",
                border: "none",
                color: "white",
                float: "right",
                marginTop: "5px",
              }}
              onClick={() => setDietModalVisible(true)}
            >
              <T>admin.manage_diet</T>
            </Button>
          </Form.Item>
          {/* ingredients */}
          {
            <div className="new-recipe-ingredients-list-container">
              <List
                size="small"
                header={
                  <div className="new-recipe-ingredients-list-container-header">
                    <span className="font-heading-black"><T>admin.add_ingredients</T></span>
                    <div>
                      <Button
                        className="hover-orange"
                        onClick={() => setIngredients([...ingredients, ing])}
                      >
                        <T>admin.add_ingredient</T>
                      </Button>
                      <Button
                        className="hover-orange"
                        onClick={() => setNewIngredientModlVisible(true)}
                      >
                        <T>admin.manage_ingredients</T>
                      </Button>
                    </div>
                  </div>
                }
                bordered
                dataSource={ingredients}
                renderItem={renderIngredientsList}
              />
            </div>
          }
          {/* Cooking process */}
          {
            <div
              className="new-recipe-ingredients-list-container"
              style={{ marginTop: "30px" }}
            >
              <List
                size="small"
                header={
                  <div className="new-recipe-ingredients-list-container-header">
                    <span className="font-heading-black"><T>admin.cooking_process</T></span>
                    <div>
                      <Button
                        className="hover-orange"
                        onClick={() =>
                          setCookingProcess([...cookingProcess, ""])
                        }
                      >
                        <T>admin.add_step</T>
                      </Button>
                    </div>
                  </div>
                }
                bordered
                dataSource={cookingProcess}
                renderItem={renderCookingProcessList}
              />
            </div>
          }

          <Form.Item label={<T>admin.notes</T>} name="notes" style={{ marginTop: "30px" }}>
            {/* <Input.TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            /> */}
            <TextEditor value={notes} setValue={setNotes} />
          </Form.Item>
          <Form.Item label={<T>admin.tips</T>} name="tips">
            {/* <Input.TextArea
              value={tips}
              onChange={(e) => setTips(e.target.value)}
            /> */}
            <TextEditor value={tips} setValue={setTips} />
          </Form.Item>
          {userInfo.role === "admin" && (
            <>
              <Form.Item>
                <Checkbox
                  checked={userCreatePost}
                  onChange={(e) => setUserCreatePost(e.target.checked)}
                >
                  <T>admin.create_a_post</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                >
                  <T>admin.make_public</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={allowReviews}
                  onChange={(e) => setAllowReviews(e.target.checked)}
                >
                  <T>admin.allow_reviews</T>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Checkbox
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                >
                  <T>admin.allow_comments</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={sendNotifications}
                  onChange={(e) => setSendNotifications(e.target.checked)}
                >
                  <T>admin.create_notification</T>
                </Checkbox>
              </Form.Item>
            </>
          )}
          {/* footer */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
                marginTop: "10px",
              }}
            >
              <T>admin.create</T>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default NewRecipe;
