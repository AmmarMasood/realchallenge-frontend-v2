import React, { useState, useEffect, useContext } from "react";
import "react-multi-carousel/lib/styles.css";
import "../../assets/userDashboard.css";
import { Switch, Modal, Checkbox } from "antd";
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
} from "../../services/recipes";
import { createCustomerDetails } from "../../services/customer";
import { swapRecipeInRecommandedNutrients } from "../../services/users";
import slug from "elegant-slug";
import { T } from "../Translate";

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
  const [currentDay, setCurrentDay] = useState("monday");
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
  const [pinnedRecipe, setPinnedRecipe] = useState("");
  // eslint-disable-next-line
  const [suggestedSupplements, setSuggestedSupplements] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);

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

    // setSelectedSuplementType();
    console.log("user profile", userProfile);
    console.log("recommnaded diet", recommandedWeekDiet);
    recommandedWeekDiet &&
      recommandedWeekDiet.weeklyDietPlan &&
      setMealsForTheWeek(recommandedWeekDiet.weeklyDietPlan);
  }, []);

  async function fetchData() {
    const res = await getAllDietTypes();
    const rec = await getAllRecipes(localStorage.getItem("locale"));
    const allFavs = await getAllFavouriteRecipes(userInfo.id);
    allFavs && setFavRecipes(allFavs.favRecipes);

    setAllDiets(res.diets);
    setSuggestedSupplements(rec.recipes);
  }

  const givenObjectFindArray = (obj) => {
    const g = Object.entries(obj).map((l) => ({ ...l[1], foodType: l[0] }));
    return g;
  };

  const swapRecipe = async (meal) => {
    const res = await swapRecipeInRecommandedNutrients(userInfo.id, meal);
    console.log("swap", res);
  };

  const pinRecipe = (id) => {
    // console.log(id);
    setPinnedRecipe(id);
  };
  const unfouriteReceipe = async (id) => {
    await unFavouriteRecipeById({ recipeId: id }, userInfo.id);
    fetchData();
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
    console.log("booo", obj);
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
        window.alert("Please add atleast 2 supplements");
        return;
      }
    }
    const res = await createCustomerDetails(
      {
        supplementIntake: {
          supplementOption: selectedSuplementType,
          recipes: selectedSuplementType === "none" ? [] : selectedSupplements,
        },
      },
      userInfo.id
    );
    console.log("work please dient", res);
    getUserDetails();
    setSuplementModal(false);
  }

  async function saveUserDietSetup() {
    const res = await createCustomerDetails(
      { myDiet: [selectedDiet] },
      userInfo.id
    );
    // if(res.success === true){
    //   setS
    // }
    getUserDetails();
    setDietSetupModal(false);
    console.log("work please dient", res);
  }

  async function saveUserEatingLateSetting() {
    setEatingBehave({
      ...eatingBehave,
      eatingLate: !eatingBehave.eatingLate,
    });
    const res = await createCustomerDetails(
      { lateMeal: !eatingBehave.eatingLate },
      userInfo.id
    );
    getUserDetails();
    console.log("work please eating late", res);
  }

  const addToShoppingCart = (day, meal) => {
    setSelectedRecipes([
      ...selectedrRecipes,
      { id: meal._id, name: meal.name, ingredients: meal.ingredients },
    ]);
    console.log("mealing", meal);
    meal.ingredients &&
      setIngredientsSummary([...ingredientsSummary, ...meal.ingredients]);
  };

  const removeFromShoppingCart = (id, ingredients) => {
    const s = selectedrRecipes.filter((g) => g.id !== id);
    let i = ingredientsSummary.map((p) => {
      if (ingredients.some((item) => item._id === p._id)) {
        // console.log(ingredients.filter((item) => item.id === p._id));
        return undefined;
      } else {
        return p;
      }
    });

    i = i.filter(function (el) {
      return el != null;
    });
    setIngredientsSummary(i);

    setSelectedRecipes(s);
  };

  return (
    <>
      {console.log("selected", selectedSupplements, suggestedSupplements)}
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
        onCancel={() => setSuplementModal(false)}
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
                <div className="suggested-meal-container">
                  <div
                    style={{
                      height: "150px",
                      background: `url(${process.env.REACT_APP_SERVER}/uploads/${meal.image})`,
                      backgroundSize: "cover",
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
                      onClick={() => console.log(false)}
                      style={{ marginLeft: "10px" }}
                    >
                      <T>userDashboard.nutrient.mi</T>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
            {/* todo do later */}
            {/* <Scrollbars style={{ height: "400px" }}>
              <div className="meals-list-container">
                <h3 className="font-card-heading">
                  <T>userDashboard.nutrient.selectPi</T>
                </h3>
                <div className="divider"></div>
                {suggestedSupplements.map((meal) => (
                  <div className="suggested-meal-container">
                    <div
                      style={{
                        height: "150px",
                        background: `url(${process.env.REACT_APP_SERVER}/uploads/${meal.image})`,
                        backgroundSize: "cover",
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
                      onClick={() => {
                        if (selectedSupplements.length >= 4) {
                          window.alert("Only 4 supplements can be choosen!");
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
                        onClick={() => console.log(false)}
                        style={{ marginLeft: "10px" }}
                      >
                        <T>userDashboard.nutrient.moreInfo</T>
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </Scrollbars> */}
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
        onOk={() => saveUserDietSetup()}
        onCancel={() => saveUserDietSetup()}
        footer={false}
      >
        <div className="diet-setup-container">
          {allDiets.map((p) => (
            <div
              className="diet-setup-container-inbox"
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
                      <T>userDashboard.nutrient.your-bmr</T>
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
                    <span>I'm eating too late</span>
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
                    borderBottom: "2px solid black",
                    cursor: "pointer",
                    padding: "15px 0",
                  }}
                  onClick={() => setSuplementModal(true)}
                >
                  <img src={Supplements} alt="" style={iconsStyle} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>Supplement Options</span>
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
                    <span>My diet setup</span>
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
          <span
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            style={{
              color:
                currentDay === "monday" ? "var(--color-orange)" : "#677182",
            }}
            onClick={() => setCurrentDay("monday")}
          >
            {currentDay === "monday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.monday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "tuesday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("tuesday")}
          >
            {" "}
            {currentDay === "tuesday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.tuesday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "wednesday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("wednesday")}
          >
            {currentDay === "wednesday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.wednesday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "thursday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("thursday")}
          >
            {currentDay === "thursday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}

            <T>userDashboard.nutrient.thursday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "friday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("friday")}
          >
            {currentDay === "friday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.friday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "saturday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("saturday")}
          >
            {currentDay === "saturday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.saturday</T>
          </span>
          <span
            style={{
              color:
                currentDay === "sunday" ? "var(--color-orange)" : "#677182",
            }}
            className="dashboard-nutrient-row2-container-day font-paragraph-white"
            onClick={() => setCurrentDay("sunday")}
          >
            {currentDay === "sunday" && (
              <img src={pin} alt="" style={{ marginRight: "10px" }} />
            )}
            <T>userDashboard.nutrient.sunday</T>
          </span>
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
                        background: `url(${process.env.REACT_APP_SERVER}/api${meal.image})`,
                        backgroundSize: "cover",
                        height: "200px",
                      }}
                    ></div>
                    <div className="dashboard-nutrient-row2-container-card-bob font-paragraph-black">
                      {meal.foodType.replace(/[0-9]/g, "")}
                    </div>
                    <div className="dashboard-nutrient-row2-container-card-heading font-paragraph-white">
                      {meal.name}
                    </div>
                    <div className="dashboard-nutrient-row2-container-card-about font-paragraph-white">
                      {meal.description}
                    </div>
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
                    ? `Sorry, cant find recipes that fills your diet plan. We are
                    working on making new recipes possible!`
                    : `Please complete your diet setup so that we can show you, your recommanded recipes`}
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
              {selectedrRecipes.map((recipe) => (
                <div className="recipe-block font-paragraph-white">
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
                    onClick={() =>
                      removeFromShoppingCart(recipe.id, recipe.ingredients)
                    }
                  />
                </div>
              ))}
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
              {ingredientsSummary.map((ingredient) => (
                <div className="ingredientContainer font-paragraph-white">
                  <span style={{ textTransform: "capitalize" }}>
                    {console.log("ingre", ingredient)}
                    {ingredient.name.name}
                  </span>
                  <span>{ingredient.weight} g</span>
                </div>
              ))}
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
                      background: `url(${process.env.REACT_APP_SERVER}/uploads/${meal.image})`,
                      backgroundSize: "cover",
                      height: "200px",
                    }}
                  ></div>
                  <div className="dashboard-nutrient-row2-container-card-heading font-paragraph-white">
                    {meal.name}
                  </div>
                  <div className="dashboard-nutrient-row2-container-card-about font-paragraph-white">
                    {meal.description}
                  </div>
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
