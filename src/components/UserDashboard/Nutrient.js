import React, { useState, useEffect, useContext } from "react";
import "react-multi-carousel/lib/styles.css";
import "../../assets/userDashboard.css";
import { Switch, Modal, Checkbox, message } from "antd";
import {
  CaretDownOutlined,
  CloseSquareFilled,
  PlusOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { userInfoContext } from "../../contexts/UserStore";
import { Link } from "react-router-dom";
import Carousel from "react-multi-carousel";
import NoFavs from "../../images/Frame.png";
import useWindowDimensions from "../../helpers/useWindowDimensions";

// icons
import Fire from "../../assets/icons/fire-orange.svg";
import Weight from "../../assets/icons/weight-orange.svg";
import Fat from "../../assets/icons/fat-orange.svg";
import Avacdado from "../../assets/icons/avocado-light-orange.png";
import Icecream from "../../assets/icons/icecream.png";
import Sweat from "../../assets/icons/sweat.png";
import KnifeFork from "../../assets/icons/knifefork.png";
import Supplements from "../../assets/icons/supplements.png";
import Carrot from "../../assets/icons/carrot.png";
import pin from "../../assets/icons/pushpin.png";
import GrayFire from "../../assets/icons/gray-fire.png";
import SwapIcon from "../../assets/icons/swapIcon.png";
import GrayPin from "../../assets/icons/pushpin-gray.png";

// import { Scrollbars } from "react-custom-scrollbars";

import {
  getAllDietTypes,
  getAllRecipes,
  getAllFavouriteRecipes,
  unFavouriteRecipeById,
  getShoppingCart,
  removeFromShoppingCart as removeFromShoppingCartApi,
  addToShoppingCart as addToShoppingCartApi,
} from "../../services/recipes";
import { createCustomerDetails } from "../../services/customer";
import { swapRecipeInRecommandedNutrients } from "../../services/users";
import slug from "elegant-slug";
import { T, translate } from "../Translate";

const iconsStyle = {
  color: "var(--color-orange)",
  fontSize: "3rem",
  padding: "5px",
  marginRight: "10px",
  backgroundColor: "var(--color-gray-dark)",
  width: "35px",
  height: "38px",
};
const iconsListStyle = {
  color: "var(--color-orange)",
  fontSize: "3rem",
  padding: "5px",
  marginRight: "10px",
  backgroundColor: "var(--color-gray-light)",
};
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 800 },
    items: 2,
  },
  tablet1: {
    breakpoint: { max: 800, min: 750 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};
function Nutrient({
  userProfile,
  gender,
  recommandedWeekDiet,
  getUserDetails,
}) {
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const { height, width } = useWindowDimensions();
  const [selectedSuplementType, setSelectedSuplementType] = useState("none");
  const [suplementModal, setSuplementModal] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState("");
  // eslint-disable-next-line
  const [dietSetupModal, setDietSetupModal] = useState(false);
  // eslint-disable-next-line
  const [mealsOfTheWeek, setMealsOfTheWeek] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [allDiets, setAllDiets] = useState([]);
  const [currentDay, setCurrentDay] = useState(() => localStorage.getItem("currentDay") || "monday");
  // eslint-disable-next-line
  const [bodyOverview, setBodyOverview] = useState({
    calories: null,
    bmi: null,
    bmr: null,
  });
  // eslint-disable-next-line
  const [recommandedNutrition, setRecommandedNutrition] = useState({
    protein: null,
    carbohydrates: null,
    fat: null,
  });
  // eslint-disable-next-line
  const [eatingBehave, setEatingBehave] = useState({
    eatingLate: false,
    dietSetup: [],
  });
  // eslint-disable-next-line
  const [selectedrRecipes, setSelectedRecipes] = useState([]);
  // eslint-disable-next-line
  const [fav, setFavRecipes] = useState([]);
  const [ingredientsSummary, setIngredientsSummary] = useState([]);
  const [pinnedRecipe, setPinnedRecipe] = useState(() => localStorage.getItem("pinnedRecipe") || "");
  // eslint-disable-next-line
  const [suggestedSupplements, setSuggestedSupplements] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [supplementSnapshot, setSupplementSnapshot] = useState(null);

  // =
  useEffect(() => {
    fetchData();
    let ingredients = selectedrRecipes.map((recipe) => recipe.ingredients);
    ingredients = ingredients.flat();
    ingredients = ingredients.filter(
      (thing, index, self) =>
        index === self.findIndex((t) => t.name === thing.name)
    );
    const {
      bmi,
      bmir,
      caloriesPerDay,
      amountOfCarbohydrate,
      amountOfFat,
      amountOfProtein,
      lateMeal,
      myDiet,
      supplementIntake,
    } = userProfile;
    setIngredientsSummary(ingredients);
    setBodyOverview({
      bmi: bmi,
      bmr: bmir,
      calories: caloriesPerDay,
    });
    setRecommandedNutrition({
      protein: amountOfProtein,
      fat: amountOfFat,
      carbohydrates: amountOfCarbohydrate,
    });
    setEatingBehave({
      ...eatingBehave,
      eatingLate: lateMeal ? lateMeal : false,
    });
    myDiet && myDiet[0] && setSelectedDiet(myDiet[0]._id);
    supplementIntake &&
      setSelectedSuplementType(supplementIntake.supplementOption);
    supplementIntake && setSelectedSupplements(supplementIntake.recipes);

    recommandedWeekDiet &&
      recommandedWeekDiet.weeklyDietPlan &&
      setMealsForTheWeek(recommandedWeekDiet.weeklyDietPlan);
  }, []);

  async function fetchData() {
    const res = await getAllDietTypes(localStorage.getItem("locale") || "english");
    const rec = await getAllRecipes(localStorage.getItem("locale"));
    const allFavs = await getAllFavouriteRecipes(userInfo.id);
    allFavs && setFavRecipes(allFavs.favRecipes);

    setAllDiets(res.diets);
    setSuggestedSupplements(rec.recipes);

    const cartRes = await getShoppingCart(userInfo.id);
    if (cartRes && cartRes.shoppingCart) {
      const cartRecipes = cartRes.shoppingCart.map((recipe) => ({
        id: recipe._id,
        name: recipe.name,
        ingredients: recipe.ingredients || [],
      }));
      setSelectedRecipes(cartRecipes);
      const allIngredients = cartRecipes
        .flatMap((r) => r.ingredients)
        .filter(
          (item, idx, self) =>
            idx === self.findIndex((t) => t.name === item.name)
        );
      setIngredientsSummary(allIngredients);
    }
  }

  const givenObjectFindArray = (obj) => {
    const g = Object.entries(obj).map((l) => ({ ...l[1], foodType: l[0] }));
    return g;
  };

  const swapRecipe = async (meal) => {
    const res = await swapRecipeInRecommandedNutrients(userInfo.id, meal);
    if (res) {
      message.success(translate("userDashboard.nutrient.recipe_swapped"));
      getUserDetails();
    } else {
      message.error(translate("userDashboard.nutrient.swap_failed"));
    }
  };

  const pinRecipe = (id) => {
    setPinnedRecipe((prev) => (prev === id ? "" : id));
  };

  useEffect(() => {
    if (pinnedRecipe) {
      localStorage.setItem("pinnedRecipe", pinnedRecipe);
    } else {
      localStorage.removeItem("pinnedRecipe");
    }
  }, [pinnedRecipe]);

  useEffect(() => {
    localStorage.setItem("currentDay", currentDay);
  }, [currentDay]);
  const unfouriteReceipe = async (id) => {
    await unFavouriteRecipeById({ recipeId: id }, userInfo.id);
    setFavRecipes((prev) => prev.filter((r) => r._id !== id));
  };
  const setMealsForTheWeek = (recipes) => {
    const obj = {
      monday: recipes[0] ? givenObjectFindArray(recipes[0]) : [],
      tuesday: recipes[1] ? givenObjectFindArray(recipes[1]) : [],
      wednesday: recipes[2] ? givenObjectFindArray(recipes[2]) : [],
      thursday: recipes[3] ? givenObjectFindArray(recipes[3]) : [],
      friday: recipes[4] ? givenObjectFindArray(recipes[4]) : [],
      saturday: recipes[5] ? givenObjectFindArray(recipes[5]) : [],
      sunday: recipes[6] ? givenObjectFindArray(recipes[6]) : [],
    };
    setMealsOfTheWeek(obj);
  };
  const getDietNameFromId = (id) => {
    const s = allDiets
      .map((g) => {
        if (g._id === id) {
          return g;
        }
      })
      .filter((l) => l !== undefined);
    return s[0];
  };

  function remmoveFromSelectedSuplemets(id) {
    let t = selectedSupplements.filter((s) => s._id !== id);
    setSelectedSupplements(t);
  }

  async function saveUserSupplementSettings() {
    if (selectedSuplementType !== "none") {
      if (selectedSupplements.length < 2) {
        message.warning(translate("userDashboard.nutrient.min_supplements"));
        return;
      }
    }
    await createCustomerDetails(
      {
        supplementIntake: {
          supplementOption: selectedSuplementType,
          recipes: selectedSuplementType === "none" ? [] : selectedSupplements,
        },
      },
      userInfo.id
    );
    getUserDetails();
    setSuplementModal(false);
  }

  async function saveUserDietSetup() {
    if (!selectedDiet) {
      message.warning(translate("userDashboard.nutrient.select_diet"));
      return;
    }
    const res = await createCustomerDetails(
      { myDiet: [selectedDiet] },
      userInfo.id
    );
    if (res) {
      message.success(translate("userDashboard.nutrient.diet_saved"));
      getUserDetails();
      setDietSetupModal(false);
    } else {
      message.error(translate("userDashboard.nutrient.diet_save_failed"));
    }
  }

  async function saveUserEatingLateSetting() {
    setEatingBehave({
      ...eatingBehave,
      eatingLate: !eatingBehave.eatingLate,
    });
    await createCustomerDetails(
      { lateMeal: !eatingBehave.eatingLate },
      userInfo.id
    );
    getUserDetails();
  }

  const addToShoppingCart = async (day, meal) => {
    if (selectedrRecipes.some((r) => r.id === meal._id)) {
      message.info(translate("userDashboard.nutrient.already_in_cart"));
      return;
    }
    const res = await addToShoppingCartApi({ recipeId: meal._id }, userInfo.id);
    if (!res) {
      message.error(translate("userDashboard.nutrient.cart_add_failed"));
      return;
    }
    const newRecipes = [
      ...selectedrRecipes,
      { id: meal._id, name: meal.name, ingredients: meal.ingredients || [] },
    ];
    setSelectedRecipes(newRecipes);
    const allIngredients = newRecipes
      .flatMap((r) => r.ingredients)
      .filter(
        (item, idx, self) =>
          idx === self.findIndex((t) => t.name === item.name)
      );
    setIngredientsSummary(allIngredients);
    message.success(translate("userDashboard.nutrient.added_to_cart"));
  };

  const removeFromShoppingCart = async (id) => {
    await removeFromShoppingCartApi({ recipeId: id }, userInfo.id);
    const remaining = selectedrRecipes.filter((g) => g.id !== id);
    setSelectedRecipes(remaining);
    const allIngredients = remaining
      .flatMap((r) => r.ingredients)
      .filter(
        (item, idx, self) =>
          idx === self.findIndex((t) => t.name === item.name)
      );
    setIngredientsSummary(allIngredients);
  };

  return (
    <>
      {/* suplemet modal starts */}
      <Modal
        title={
          <>
            <div className="font-card-heading">
              <T>userDashboard.nutrient.sup</T>
            </div>
            <div className="divider"></div>
          </>
        }
        bodyStyle={{ marginTop: "-40px" }}
        visible={suplementModal}
        width={width >= 600 ? "60%" : "100%"}
        onCancel={() => {
          if (supplementSnapshot) {
            setSelectedSuplementType(supplementSnapshot.type);
            setSelectedSupplements(supplementSnapshot.supplements);
          }
          setSuplementModal(false);
        }}
        footer={false}
      >
        <div className="supplement-container">
          <div
            className="diet-setup-container-inbox"
            onClick={() => setSelectedSuplementType("none")}
          >
            <span className="font-paragraph-white">
              <T>userDashboard.nutrient.none</T>
            </span>
            <Checkbox
              checked={selectedSuplementType === "none" ? true : false}
              style={{ marginLeft: "auto", paddingLeft: "10px" }}
            />
          </div>
          <div
            className="diet-setup-container-inbox"
            onClick={() => setSelectedSuplementType("during-the-day")}
          >
            <span className="font-paragraph-white">
              <T>userDashboard.nutrient.du</T>
            </span>
            <Checkbox
              checked={
                selectedSuplementType === "during-the-day" ? true : false
              }
              style={{ marginLeft: "auto", paddingLeft: "10px" }}
            />
          </div>
          <div
            className="diet-setup-container-inbox"
            onClick={() => setSelectedSuplementType("extra-meal")}
          >
            <span className="font-paragraph-white">
              <T>userDashboard.nutrient.meal</T>
            </span>
            <Checkbox
              checked={selectedSuplementType === "extra-meal" ? true : false}
              style={{ marginLeft: "auto", paddingLeft: "10px" }}
            />
          </div>
        </div>
        {selectedSuplementType === "extra-meal" ||
        selectedSuplementType === "during-the-day" ? (
          <>
            <div className="selected-meals-container">
              {selectedSupplements.map((meal) => (
                <div className="suggested-meal-container" key={meal._id}>
                  <div
                    style={{
                      height: "150px",
                      background: `url(${meal.image ? meal.image.replaceAll(" ", "%20") : ""})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>
                  <div
                    className="font-paragraph-white"
                    style={{ fontSize: "1.8rem" }}
                  >
                    {meal.name}
                  </div>
                  <div
                    className="font-paragraph-white"
                    style={{ fontSize: "1.3rem", opacity: "0.8" }}
                  >
                    {meal.kCalPerPerson}
                  </div>
                  <button
                    className="common-orange-button font-paragraph-white"
                    onClick={() => remmoveFromSelectedSuplemets(meal._id)}
                  >
                    <T>userDashboard.nutrient.unselect</T>
                  </button>
                  <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                    <button
                      className="common-transparent-button font-paragraph-white"
                      style={{ marginLeft: "10px" }}
                    >
                      <T>userDashboard.nutrient.mi</T>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px" }}>
              <h3 className="font-card-heading">
                <T>userDashboard.nutrient.selectPi</T>
              </h3>
              <div className="divider"></div>
              <div className="selected-meals-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {suggestedSupplements
                  .filter((meal) => !selectedSupplements.some((s) => s._id === meal._id))
                  .map((meal) => (
                    <div className="suggested-meal-container" key={meal._id}>
                      <div
                        style={{
                          height: "150px",
                          background: `url(${meal.image ? meal.image.replaceAll(" ", "%20") : ""})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                      <div className="font-paragraph-white" style={{ fontSize: "1.8rem" }}>
                        {meal.name}
                      </div>
                      <div className="font-paragraph-white" style={{ fontSize: "1.3rem", opacity: "0.8" }}>
                        {meal.kCalPerPerson}
                      </div>
                      <button
                        className="common-orange-button font-paragraph-white"
                        onClick={() => {
                          if (selectedSupplements.length >= 4) {
                            message.warning(translate("userDashboard.nutrient.max_supplements"));
                            return;
                          }
                          setSelectedSupplements([...selectedSupplements, meal]);
                        }}
                      >
                        <T>userDashboard.nutrient.select</T>
                      </button>
                      <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                        <button
                          className="common-transparent-button font-paragraph-white"
                          style={{ marginLeft: "10px" }}
                        >
                          <T>userDashboard.nutrient.moreInfo</T>
                        </button>
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          ""
        )}
        <button
          style={{ marginTop: "10px" }}
          className="common-orange-button font-paragraph-white"
          onClick={() => saveUserSupplementSettings()}
        >
          <T>userDashboard.nutrient.done</T>
        </button>
      </Modal>
      {/* suplemet modal ends */}
      {/* diet setup modal starts */}
      <Modal
        title={
          <>
            <div className="font-card-heading">
              <T>userDashboard.nutrient.ds</T>
            </div>
            <div className="divider"></div>
          </>
        }
        bodyStyle={{ marginTop: "-40px" }}
        visible={dietSetupModal}
        width="30%"
        onCancel={() => setDietSetupModal(false)}
        footer={false}
      >
        <div className="diet-setup-container">
          {allDiets.map((p) => (
            <div
              className="diet-setup-container-inbox"
              key={p._id}
              onClick={() => setSelectedDiet(p._id)}
            >
              {/* <AppleOutlined style={iconsListStyle} /> */}
              <span className="font-paragraph-white">{p.name}</span>
              <Checkbox
                checked={selectedDiet === p._id ? true : false}
                style={{ marginLeft: "auto", paddingLeft: "10px" }}
              />
            </div>
          ))}
        </div>
        <button
          className="common-orange-button font-paragraph-white"
          onClick={() => saveUserDietSetup()}
        >
          <T>userDashboard.nutrient.done</T>
        </button>
      </Modal>
      {/* diet setup modal ends */}
      <div className="dashboard-feed-container">
        <div className="dashboard-nutrient-row1">
          <div className="dashboard-challenges-mychallenge-heading font-card-heading">
            <T>userDashboard.nutrient.currentV</T>
          </div>
          <div className="divider"></div>
          <div className="dashboard-nutrient-row1-container">
            <div className="dashboard-nutrient-row1-col dashboard-nutrient-row1-col1">
              <div className="dashboard-nutrient-row1-col-heading font-card-heading-light">
                <T>userDashboard.nutrient.bodyV</T>
              </div>
              <div className="divider"></div>
              <div className="dashboard-nutrient-row1-col-container">
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Fire} style={iconsStyle} alt="" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{bodyOverview.calories}</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.calories</T>
                    </span>
                  </div>
                </div>
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Weight} style={iconsStyle} alt="" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{bodyOverview.bmi}</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.your-bmi</T>
                    </span>
                  </div>
                </div>
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Fat} style={iconsStyle} alt="" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{bodyOverview.bmr}</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.your-body-fat</T>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-nutrient-row1-col dashboard-nutrient-row1-col2">
              <div className="dashboard-nutrient-row1-col-heading font-card-heading-light">
                <T>userDashboard.nutrient.nr</T>
              </div>
              <div className="divider"></div>
              <div className="dashboard-nutrient-row1-col-container">
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Avacdado} style={iconsStyle} alt="" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{recommandedNutrition.protein} %</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.protein</T>
                    </span>
                  </div>
                </div>
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Icecream} alt="" style={iconsStyle} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{recommandedNutrition.carbohydrates} %</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.carbohydrates</T>
                    </span>
                  </div>
                </div>
                <div className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white">
                  <img src={Sweat} alt="" style={iconsStyle} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{recommandedNutrition.fat} %</span>
                    <span style={{ fontSize: "1.5rem" }}>
                      <T>userDashboard.nutrient.fat</T>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-nutrient-row1-col dashboard-nutrient-row1-col3">
              <div className="dashboard-nutrient-row1-col-heading font-card-heading-light">
                <T>userDashboard.nutrient.eb</T>
              </div>
              <div className="divider"></div>
              <div className="dashboard-nutrient-row1-col-container">
                <div
                  className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white"
                  style={{
                    backgroundColor: "var(--color-gray-dark)",
                    borderBottom: "2px solid black",
                    padding: "15px 0",
                  }}
                >
                  <img src={KnifeFork} alt="" style={iconsStyle} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span><T>userDashboard.nutrient.eating_late</T></span>
                    <span style={{ fontSize: "1.2rem" }}>
                      {" "}
                      <Switch
                        checkedChildren="ON"
                        checked={eatingBehave.eatingLate}
                        unCheckedChildren="OFF"
                        onChange={(e) => saveUserEatingLateSetting()}
                      />
                    </span>
                  </div>
                </div>
                <div
                  className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white"
                  style={{
                    backgroundColor: "var(--color-gray-dark)",
                    borderBottom: "2px solid black",
                    cursor: "pointer",
                    padding: "15px 0",
                  }}
                  onClick={() => {
                    setSupplementSnapshot({
                      type: selectedSuplementType,
                      supplements: selectedSupplements,
                    });
                    setSuplementModal(true);
                  }}
                >
                  <img src={Supplements} alt="" style={iconsStyle} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span><T>userDashboard.nutrient.supplement_options</T></span>
                    <span style={{ fontSize: "1.6rem" }}>
                      {selectedSuplementType}
                    </span>
                  </div>
                  <CaretDownOutlined
                    style={{
                      position: "absolute",
                      right: 0,
                      marginRight: "10px",
                    }}
                  />
                </div>
                <div
                  className="dashboard-nutrient-row1-col-container-insideBox font-paragraph-white"
                  style={{
                    backgroundColor: "var(--color-gray-dark)",
                    cursor: "pointer",
                  }}
                  onClick={() => setDietSetupModal(true)}
                >
                  <img src={Carrot} alt="" style={iconsStyle} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span><T>userDashboard.nutrient.my_diet_setup</T></span>
                    <span style={{ fontSize: "1.6rem" }}>
                      {getDietNameFromId(selectedDiet)
                        ? getDietNameFromId(selectedDiet).name
                        : ""}
                    </span>
                  </div>
                  <CaretDownOutlined
                    style={{
                      position: "absolute",
                      right: 0,
                      marginRight: "10px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 2nd rpw */}
      <div className="dashboard-nutrient-row2">
        <div
          className="dashboard-challenges-mychallenge-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap-reverse",
          }}
        >
          <span className="font-card-heading">
            <T>userDashboard.nutrient.nfrw</T>
          </span>

          {width > 700 && (
            <div style={{ marginBottom: "10px", marginTop: "10px" }}>
              <Link
                to="/nutrition"
                className="common-orange-button font-paragraph-white"
              >
                <T>userDashboard.nutrient.discoverR</T>
              </Link>
              <Link
                to="/pricing"
                style={{ marginLeft: "10px" }}
                className="common-transparent-button font-paragraph-white"
              >
                <T>userDashboard.nutrient.seeP</T>
              </Link>
            </div>
          )}
        </div>

        <div className="dashboard-nutrient-row2-container-days font-paragraph-whites">
          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
            <span
              key={day}
              className="dashboard-nutrient-row2-container-day font-paragraph-white"
              style={{
                color: currentDay === day ? "var(--color-orange)" : "#677182",
              }}
              onClick={() => setCurrentDay(day)}
            >
              {currentDay === day && (
                <img src={pin} alt="" style={{ marginRight: "10px" }} />
              )}
              <T>{`userDashboard.nutrient.${day}`}</T>
            </span>
          ))}
        </div>
        <div className="divider"></div>
        <div className="dashboard-nutrient-row2-container">
          <Carousel responsive={responsive}>
            {mealsOfTheWeek[currentDay].length > 0 ? (
              mealsOfTheWeek[currentDay].map((meal) => (
                <div
                  className="dashboard-nutrient-row2-container-card"
                  style={{
                    border:
                      pinnedRecipe === meal._id ? "3px solid #f37720" : "",
                  }}
                  key={meal._id}
                >
                  <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                    <div
                      style={{
                        background: `url(${process.env.REACT_APP_SERVER}/api${meal.image ? meal.image.replaceAll(" ", "%20") : ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "200px",
                      }}
                    ></div>
                    <div className="dashboard-nutrient-row2-container-card-bob font-paragraph-black">
                      {meal.foodType ? meal.foodType.replace(/[0-9]/g, "") : ""}
                    </div>
                    <div className="dashboard-nutrient-row2-container-card-heading font-paragraph-white">
                      {meal.name}
                    </div>
                    <div
                      className="dashboard-nutrient-row2-container-card-about font-paragraph-white"
                      dangerouslySetInnerHTML={{ __html: meal.description || "" }}
                    />
                  </Link>
                  <div className="dashboard-nutrient-row2-container-card-buttons">
                    <div className="font-paragraph-white">
                      <img
                        src={GrayFire}
                        alt=""
                        height="16px"
                        style={{ margin: "0 5px" }}
                      />
                      <span>{meal.kCalPerPerson} kCAL</span>
                    </div>
                    <div
                      style={{ cursor: "pointer", textAlign: "center" }}
                      onClick={() => pinRecipe(meal._id)}
                    >
                      <img
                        src={meal._id === pinnedRecipe ? pin : GrayPin}
                        alt=""
                        height="16px"
                      />
                    </div>
                    <div
                      style={{ cursor: "pointer", textAlign: "center" }}
                      onClick={() => swapRecipe(meal)}
                    >
                      <img src={SwapIcon} alt="" height="16px" />
                    </div>
                    <button
                      className="font-paragraph-white"
                      onClick={() => addToShoppingCart(currentDay, meal)}
                    >
                      <PlusOutlined style={{ color: "#fff" }} />
                      <T>userDashboard.nutrient.atsl</T>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  margin: "50px 0",
                }}
              >
                <h3 className="font-paragraph-white">
                  {userProfile.myDiet && userProfile.supplementIntake
                    ? <T>userDashboard.nutrient.no_recipes_found</T>
                    : <T>userDashboard.nutrient.complete_diet_setup</T>}
                </h3>
              </div>
            )}
          </Carousel>
        </div>
        {width < 700 && (
          <div
            style={{
              marginBottom: "10px",
              marginTop: "10px",
              paddingLeft: "15px",
            }}
          >
            <Link
              to="/nutrition"
              className="common-orange-button font-paragraph-white"
            >
              <T>userDashboard.nutrient.discoverR</T>
            </Link>
            <Link
              to="/pricing"
              style={{ marginLeft: "10px" }}
              className="common-transparent-button font-paragraph-white"
            >
              <T>userDashboard.nutrient.seeP</T>
            </Link>
          </div>
        )}
      </div>
      <div className="dashboard-nutrient-row3">
        <div className="dashboard-challenges-mychallenge-heading font-card-heading">
          <T>userDashboard.nutrient.mysl</T>
        </div>
        <div className="divider"></div>
        <div className="dashboard-nutrient-row3-container">
          <div className="dashboard-nutrient-row3-container-selectedRecipes">
            <div
              className="font-paragraph-white"
              style={{ fontSize: "1.8rem" }}
            >
              <T>userDashboard.nutrient.sr</T>
            </div>
            <div className="dashboard-nutrient-row3-container-selectedRecipes-container">
              {selectedrRecipes.length === 0 ? (
                <div className="font-paragraph-white" style={{ opacity: 0.6, padding: "10px 0" }}>
                  <T>userDashboard.nutrient.no_recipes_in_cart</T>
                </div>
              ) : (
                selectedrRecipes.map((recipe) => (
                  <div className="recipe-block font-paragraph-white" key={recipe.id}>
                    <span style={{ color: "#f37720", opacity: "1" }}>
                      {recipe.name}
                    </span>{" "}
                    <CloseSquareFilled
                      style={{
                        fontSize: "2.4rem",
                        cursor: "pointer",
                        color: "#f37720",
                        marginLeft: "10px",
                      }}
                      onClick={() => removeFromShoppingCart(recipe.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="dashboard-nutrient-row3-container-ingredientsSummary">
            <div
              className="font-paragraph-white"
              style={{ fontSize: "1.8rem" }}
            >
              <T>userDashboard.nutrient.ingres</T>
            </div>
            <div className="dashboard-nutrient-row3-container-ingredientsSummary-container">
              {ingredientsSummary.length === 0 ? (
                <div className="font-paragraph-white" style={{ opacity: 0.6, padding: "10px 0" }}>
                  <T>userDashboard.nutrient.no_ingredients</T>
                </div>
              ) : (
                ingredientsSummary.map((ingredient, idx) => (
                  <div className="ingredientContainer font-paragraph-white" key={ingredient._id || `${ingredient.name?.name || "ingredient"}-${idx}`}>
                    <span style={{ textTransform: "capitalize" }}>
                      {ingredient.name?.name || ingredient.name}
                    </span>
                    <span>{ingredient.weight ? `${ingredient.weight} g` : ""}</span>
                  </div>
                ))
              )}
            </div>
            <div className="dashboard-nutrient-row2-container-card-buttons">
              <button
                className="font-paragraph-white"
                style={{ width: "200px", padding: "10px", margin: "10px" }}
              >
                <T>userDashboard.nutrient.ogl</T>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-nutrient-row4">
        <div className="dashboard-challenges-mychallenge-heading font-card-heading">
          <T>userDashboard.nutrient.mfr</T>
        </div>
        <div className="divider"></div>
        {fav.length <= 0 ? (
          <div className="dashboard-nutrient-row4-container">
            <div style={{ textAlign: "center" }}>
              <img src={NoFavs} alt="no-favs" />
              <div
                className="font-paragraph-white"
                style={{
                  color: "var(--color-orange)",
                  fontSize: "2rem",
                  paddingTop: "5px",
                }}
              >
                <T>userDashboard.nutrient.nrf</T>
              </div>
            </div>
          </div>
        ) : (
          <div className="favourite-recipes-container">
            {fav.map((meal) => (
              <div
                style={{ width: "35rem" }}
                className="dashboard-nutrient-row2-container-card"
                key={meal._id}
              >
                <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                  <div
                    style={{
                      background: `url(${meal.image ? meal.image.replaceAll(" ", "%20") : ""})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "200px",
                    }}
                  ></div>
                  <div className="dashboard-nutrient-row2-container-card-heading font-paragraph-white">
                    {meal.name}
                  </div>
                  <div
                    className="dashboard-nutrient-row2-container-card-about font-paragraph-white"
                    dangerouslySetInnerHTML={{ __html: meal.description || "" }}
                  />
                </Link>
                <div
                  className="dashboard-nutrient-row2-container-card-buttons"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <div className="font-paragraph-white">
                    <img src={GrayFire} alt="" style={{ margin: "0 5px" }} />
                    <span>{meal.kCalPerPerson} kCAL</span>
                  </div>
                  <div
                    style={{ cursor: "pointer", textAlign: "center" }}
                    onClick={() => unfouriteReceipe(meal._id)}
                  >
                    <HeartFilled
                      style={{
                        fontSize: "3rem",
                        cursor: "pointer",
                        color: "#ff7700",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Nutrient;
