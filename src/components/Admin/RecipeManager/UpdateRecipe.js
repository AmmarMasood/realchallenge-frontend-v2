import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Modal,
  InputNumber,
  List,
  Checkbox,
} from "antd";
import { PlusOutlined, CloseSquareOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import {
  getAllDietTypes,
  getAllMealTypes,
  getAllFoodTypes,
  getAllIngredients,
  updateRecipe,
  createFoodType,
  createMealType,
  removeMealType,
  removeFoodType,
  createDiet,
  removeDiet,
  createIngredient,
  removeIngredient,
  getAllUserRecipes,
} from "../../../services/recipes";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import EditTypeName from "./EditTypeName";
import TextEditor from "../../TextEditor";
import { userInfoContext } from "../../../contexts/UserStore";
import { LanguageContext } from "../../../contexts/LanguageContext";
const { Option } = Select;

function UpdateRecipe(props) {
  const [form] = Form.useForm();
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
  // recipe version selector
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");

  // update stuff
  const [editItemNameModalVisible, setEditItemModelVisible] = useState(false);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");
  const userInfo = useContext(userInfoContext)[0];
  const { language } = useContext(LanguageContext);

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

  // async function fetchAllRecipes() {
  //   const res = await getAllUserRecipes(
  //     language === "english" ? "dutch" : "english"
  //   );
  //   console.log("testing", res);
  //   if (res && res.recipes) {
  //     setAllRecipes(res.recipes);
  //   }
  // }

  useEffect(() => {
    console.log("ammar", props.selectedProduct);
    form.setFieldsValue({
      recipeName: props.selectedProduct.name,
      recipeDescription: props.selectedProduct.description,
      preprationTime: props.selectedProduct.prepTime,
      persons: props.selectedProduct.persons
        ? props.selectedProduct.persons
        : "",
      kcalPerPerson: props.selectedProduct.kCalPerPerson,
      saturationIndex: props.selectedProduct.saturationIndex,
      protein: props.selectedProduct.protein,
      carbohydrates: props.selectedProduct.carbohydrate,
      fat: props.selectedProduct.fat,
      fiber: props.selectedProduct.fiber,
      mealTypes: props.selectedProduct.mealTypes,
      foodTypes: props.selectedProduct.foodTypes,
      diet: props.selectedProduct.diet,
      tips: props.selectedProduct.tips,
      notes: props.selectedProduct.notes,
      isPublic: props.selectedProduct.isPublic,
      allowComments: props.selectedProduct.allowComments,
      allowReviews: props.selectedProduct.allowReviews,
      // category: props.selectedProduct._id,
      // price: props.selectedProduct.price,
      // weight: props.selectedProduct.weight,
      // inStock: props.selectedProduct.inStock,
    });
    setKcalPerPersons(props.selectedProduct.kCalPerPerson);
    setSaturationIndex(props.selectedProduct.saturationIndex);
    setProtein(props.selectedProduct.protein);
    setCarbohydrates(props.selectedProduct.carbohydrate);
    setFat(props.selectedProduct.fat);
    setFiber(props.selectedProduct.fiber);
    setMealTypes(props.selectedProduct.mealTypes);
    setFoodTypes(props.selectedProduct.foodTypes);
    setDiet(props.selectedProduct.diet);
    setTips(props.selectedProduct.tips);
    setNotes(props.selectedProduct.notes);
    setName(props.selectedProduct.name);
    setDescription(props.selectedProduct.description);
    setPreprationTime(props.selectedProduct.prepTime);
    setPersons(
      props.selectedProduct.persons ? props.selectedProduct.persons : ""
    );
    setDiet(props.selectedProduct.diet);
    setFoodTypes(props.selectedProduct.foodTypes);
    setMealTypes(props.selectedProduct.mealTypes);
    setFeaturedImage(props.selectedProduct.image);
    setIngredients(props.selectedProduct.ingredients);
    setCookingProcess(props.selectedProduct.cookingProcess);
    setIsPublic(props.selectedProduct.isPublic);
    setAllowComments(props.selectedProduct.allowComments);
    setAllowReviews(props.selectedProduct.allowReviews);
    props.selectedProduct.alternativeLanguage &&
      setSelectedRecipe(props.selectedProduct.alternativeLanguage._id);
    fetchData();
    fetchAllRecipes();
  }, []);

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
    const d = {
      name: name,
      description,
      image:
        typeof featuredImage === "object" ? featuredImage.link : featuredImage,
      prepTime: preprationTime,
      persons: persons,
      kCalPerPerson: kcalPerPersons,
      saturationIndex: saturationIndex,
      protein: protein,
      carbohydrate: carbohydrates,
      fat: fat,
      fiber: fiber,
      mealTypes: mealTypes,
      foodTypes: foodType,
      diet: diet,
      ingredients: ingredients,
      cookingProcess: cookingProcess,
      notes: notes,
      tips: tips,
      isPublic: isPublic,
      allowComments: allowComments,
    };
    if (selectedRecipe) {
      d.alternativeLanguage = selectedRecipe;

      await updateRecipe(
        { alternativeLanguage: props.selectedProduct._id },
        selectedRecipe
      );
    }
    await updateRecipe(d, props.selectedProduct._id);
  };

  async function fetchAllRecipes() {
    const res = await getAllUserRecipes(
      language === "english" ? "dutch" : "english"
    );
    if (res && res.recipes) {
      setAllRecipes(res.recipes);
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const changeIngredientValue = (key, ingredientId, value) => {
    let i = [...ingredients];
    i = i.map((ingre) => {
      if (ingre._id === ingredientId) {
        ingre[key] = value;
      }
      return ingre;
    });
    setIngredients(i);
  };

  const removeIngredientListItem = (item) => {
    let i = [...ingredients];
    i = i.filter((ingre) => ingre._id !== item._id);
    setIngredients(i);
    console.log("yas", item, i);
  };
  const renderIngredientsList = (item) => (
    <List.Item style={{ display: "block", textAlign: "right" }}>
      <Button type="danger" onClick={() => removeIngredientListItem(item)}>
        Remove
      </Button>

      <div className="new-recipe-ingredient-listitem">
        <div>
          <span className="font-paragraph-black">Select Ingredient</span>
          <Select
            style={{ width: "100%" }}
            value={item.name._id}
            onChange={(e) => changeIngredientValue("name", item._id, e)}
            showSearch
            onSearch={(v) => console.log("value", v)}
            filterOption={(input, option) => {
              // console.log("value", input,option);
              return (
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {allIngredients.map((i) => (
              <Option value={i._id}>{i.name}</Option>
            ))}
          </Select>
        </div>
        <div>
          <span className="font-paragraph-black">Weight (gm)</span>
          <Input
            type="number"
            placeholder="Enter Weight"
            value={item.weight}
            onChange={(e) => {
              console.log(item._id, e.target.value);
              changeIngredientValue("weight", item._id, e.target.value);
            }}
          />
        </div>
        <div>
          <span className="font-paragraph-black">Volume (ml)</span>
          <Input
            type="number"
            placeholder="Enter Volume"
            value={item.volume}
            onChange={(e) =>
              changeIngredientValue("volume", item._id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black">Pieces</span>
          <Input
            type="number"
            placeholder="Enter Pieces"
            value={item.pieces}
            onChange={(e) =>
              changeIngredientValue("pieces", item._id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black">Method</span>
          <Input
            placeholder="Enter Method"
            value={item.method}
            onChange={(e) =>
              changeIngredientValue("method", item._id, e.target.value)
            }
          />
        </div>
        <div>
          <span className="font-paragraph-black">Other</span>
          <Input
            placeholder="Enter Other"
            value={item.other}
            onChange={(e) =>
              changeIngredientValue("other", item._id, e.target.value)
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
        rows={2}
        value={item}
        onChange={(e) => onchangeCookingProcess(e.target.value, index)}
        style={{ marginRight: "10px" }}
      />
      <Button
        type="danger"
        onClick={() => removeCookingProcessItem(item, index)}
      >
        Remove
      </Button>
    </List.Item>
  );

  return (
    <>
      <Modal
        visible={props.visible}
        onCancel={() => {
          props.setVisible(!props.visible);
          props.getAllProducts();
        }}
        width="80vw"
        key={props.key}
        footer={false}
      >
        {/* modal to create a new meal type  */}
        <Modal
          onCancel={() => setMealTypeModalVisible(false)}
          footer={false}
          visible={mealTypeModalVisible}
        >
          <p className="font-paragraph-white">Enter Meal Type</p>
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
              Create
            </Button>
          </div>
          <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
            <span className="font-subheading-white">All Meal Types</span>
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
                      Delete
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Meal Type");
                        setSelectedItemForUpdate(cat);
                        setEditItemModelVisible(true);
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

        {/* modal to create a new food type  */}
        <Modal
          onCancel={() => setFoodTypeModalVisible(false)}
          footer={false}
          visible={foodTypeModalVisible}
        >
          <p className="font-paragraph-white">Enter Food Type</p>
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
              Create
            </Button>
          </div>
          <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
            <span className="font-subheading-white">All Food Types</span>
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
                      Delete
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Food Type");
                        setSelectedItemForUpdate(cat);
                        setEditItemModelVisible(true);
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
        {/* modal to create a new diet  */}
        <Modal
          onCancel={() => setDietModalVisible(false)}
          footer={false}
          visible={dietModalVisible}
        >
          <p className="font-paragraph-white">Enter Diet</p>
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
                  await createDiet(newDietName);
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
              Create
            </Button>
          </div>
          <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
            <span className="font-subheading-white">All Diet Types</span>
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
                      Delete
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Diet Type");
                        setSelectedItemForUpdate(cat);
                        setEditItemModelVisible(true);
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
        {/* modal to create a new ingredient  */}
        <Modal
          onCancel={() => setNewIngredientModlVisible(false)}
          footer={false}
          visible={newIngredientModalVisible}
        >
          <p className="font-paragraph-white">Enter Ingredient</p>
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
                  await createIngredient(newIngredientName);
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
              Create
            </Button>
          </div>
          <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
            <span className="font-subheading-white">All Ingredients</span>
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
                      Delete
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Ingredient");
                        setSelectedItemForUpdate(cat);
                        setEditItemModelVisible(true);
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
        <EditTypeName
          editCategoryNameModalVisible={editItemNameModalVisible}
          setEditCategoryModelVisible={setEditItemModelVisible}
          fethData={fetchData}
          selectedForUpdate={selectedItemForUpdate}
          titleName={selectedItemForUpdateTitle}
        />

        {/* media manager */}
        <RemoteMediaManager
          visible={mediaManagerVisible}
          setVisible={setMediaManagerVisible}
          type={mediaManagerType}
          actions={mediaManagerActions}
        />
        <h2 className="font-heading-white">Update Recipe</h2>

        <div
          className="admin-newuser-container"
          style={{ padding: "50px 50px 50px 20px" }}
        >
          <p>Language: {props.selectedProduct?.language}</p>
          <div>
            <span
              style={{ marginRight: "5px" }}
            >{`Select alternative language version`}</span>
            <Select
              style={{ width: "500px" }}
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e)}
            >
              <Option value={""}>-</Option>
              {allRecipes.map((r, i) => (
                <Option key={i} value={r._id}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </div>
          <Form
            layout="vertical"
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
          >
            <Form.Item
              label="Recipe Name"
              name="recipeName"
              rules={[{ required: true, message: "Please input recipe name!" }]}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Recipe Description"
              name="recipeDescription"
              rules={[{ required: true }]}
            >
              <TextEditor
                key={JSON.stringify(description)}
                value={description}
                setValue={setDescription}
              />
              {/* <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              /> */}
            </Form.Item>
            <Form.Item label="Featured Image" name="featuredImage">
              <Button
                onClick={() => {
                  setMediaManagerVisible(true);
                  setMediaManagerType("images");
                  setMediaManagerActions([featuredImage, setFeaturedImage]);
                }}
              >
                Upload File
              </Button>
              {typeof featuredImage === "object" ? (
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginRight: "15px",
                      marginTop: "10px",
                    }}
                  >
                    {console.log(
                      "test",
                      `${process.env.REACT_APP_SERVER}/uploads/${
                        typeof featuredImage === "object"
                          ? featuredImage.link
                          : featuredImage
                      }`
                    )}
                    <img
                      alt=""
                      src={`${process.env.REACT_APP_SERVER}/uploads/${
                        typeof featuredImage === "object"
                          ? featuredImage.link
                          : featuredImage
                      }`}
                      height="100px"
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
              ) : (
                <div style={{ display: "flex" }}>
                  {console.log(
                    "test",
                    `${process.env.REACT_APP_SERVER}/uploads/${
                      typeof featuredImage === "object"
                        ? featuredImage.link
                        : featuredImage
                    }`
                  )}
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
                      src={`${process.env.REACT_APP_SERVER}/uploads/${featuredImage}`}
                      height="100px"
                    />
                    <span>
                      <CloseSquareOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => setFeaturedImage()}
                      />
                    </span>
                  </div>
                </div>
              )}
            </Form.Item>
            <Form layout="vertical" form={form}>
              <div className="new-recipe-information-inputs-container">
                <Form.Item
                  label="Prepration Time"
                  name="preprationTime"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input prepration time!",
                  //   },
                  // ]}
                  type="number"
                >
                  <InputNumber
                    value={preprationTime}
                    onChange={(e) => setPreprationTime(e)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Persons" name="persons" type="number">
                  <InputNumber
                    value={persons}
                    onChange={(e) => setPersons(e)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="Kcal per person"
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
                  label="Saturation Index"
                  name="saturationIndex"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please input saturation index!",
                  //   },
                  // ]}
                  type="number"
                >
                  <InputNumber
                    value={saturationIndex}
                    onChange={(e) => setSaturationIndex(e)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="Protein"
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
                  label="Carbohydrates"
                  name="carbohydrates"
                  // rules={[
                  //   { required: true, message: "Please input carbohydrates!" },
                  // ]}
                  type="number"
                >
                  <InputNumber
                    value={carbohydrates}
                    onChange={(e) => setCarbohydrates(e)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="Fat"
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
                  label="Fiber"
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
            <Form.Item label="Meal Types" name="mealTypes">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={mealTypes}
                onChange={(e) => setMealTypes(e)}
              >
                {allMealTypes.map((meal) => (
                  <Option value={meal._id}>{meal.name}</Option>
                ))}
              </Select>
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
                Manage Meal Type
              </Button>
            </Form.Item>
            <Form.Item label="Food Types" name="foodTypes">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={foodType}
                onChange={(e) => setFoodTypes(e)}
              >
                {allFoodTypes.map((food) => (
                  <Option value={food._id}>{food.name}</Option>
                ))}
              </Select>
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
                Manage Food Type
              </Button>
            </Form.Item>
            <Form.Item label="Diet" name="diet">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={diet}
                onChange={(e) => setDiet(e)}
              >
                {allDiets.map((d) => (
                  <Option value={d._id}>{d.name}</Option>
                ))}
              </Select>
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
                Manage Diet
              </Button>
            </Form.Item>
            {/* ingredients */}
            {
              <div className="new-recipe-ingredients-list-container">
                <List
                  size="small"
                  header={
                    <div className="new-recipe-ingredients-list-container-header">
                      <span className="font-heading-black">
                        Add Ingredients
                      </span>
                      <div>
                        <Button
                          className="hover-orange"
                          onClick={() => setIngredients([...ingredients, ing])}
                        >
                          Add Ingredient
                        </Button>
                        <Button
                          className="hover-orange"
                          onClick={() => setNewIngredientModlVisible(true)}
                        >
                          Manage Ingredients
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
                      <span className="font-heading-black">
                        Cooking Process
                      </span>
                      <div>
                        <Button
                          className="hover-orange"
                          onClick={() =>
                            setCookingProcess([...cookingProcess, ""])
                          }
                        >
                          Add Step
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

            <Form.Item label="Notes" name="notes" style={{ marginTop: "30px" }}>
              {/* <Input.TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              /> */}
              <TextEditor
                key={JSON.stringify(notes)}
                value={notes}
                setValue={setNotes}
              />
            </Form.Item>
            <Form.Item label="Tips" name="tips">
              {/* <Input.TextArea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
              /> */}
              <TextEditor
                key={JSON.stringify(tips)}
                value={tips}
                setValue={setTips}
              />
            </Form.Item>
            {userInfo.role === "admin" && (
              <>
                {" "}
                <Form.Item>
                  <Checkbox
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  >
                    Make Public
                  </Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox
                    checked={allowReviews}
                    onChange={(e) => setAllowReviews(e.target.checked)}
                  >
                    Allow Reviews
                  </Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                  >
                    Allow Comments
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
                onClick={onFinish}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default UpdateRecipe;
