import React, { useState, useEffect } from "react";
import "../../assets/home.css";
import "../../assets/trainers.css";
import { Collapse, Input, Slider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../../assets/nutrition.css";
import _ from "lodash";

import ChallengeCard from "../Cards/ChallengeCard";
import { Link } from "react-router-dom";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import slug from "elegant-slug";
import { T } from "../Translate";

function SearchNutrition({
  allRecipies,
  allDiets,
  allMealTypes,
  allIngredients,
}) {
  const [mealName, setMealName] = useState("");
  const [allMeals, setAllMeals] = useState([]);
  const [mealTypeFilters, setMealTypeFilters] = useState([]);
  const [ingredientsTypeFilter, setIngredientsTypeFilter] = useState([]);
  const [dietTypeFilter, setDietTypeFilter] = useState([]);
  const [preprationTimeFilter, setPreprationTimeFilter] = useState([5, 55]);
  const [caloriesFilter, setCaloriesFilter] = useState([100, 955]);
  const [filterMeals, setFilterMeals] = useState([]);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const r = allRecipies ? allRecipies.filter((r) => r.isPublic) : [];
    setAllMeals(r);
    console.log(r);
    setFilterMeals(r);
  }, [allRecipies]);

  // useEffect(
  //   () => {
  //     let filteredWithMealType = allMeals.map((meal) => {
  //       if (mealTypeFilters.every((val) => meal.mealTypes.includes(val))) {
  //         return meal;
  //       } else {
  //         return undefined;
  //       }
  //     });
  //     filteredWithMealType = allMeals.map((meal) => {
  //       if (
  //         ingredientsTypeFilter.every((val) => meal.ingredients.includes(val))
  //       ) {
  //         return meal;
  //       } else {
  //         return undefined;
  //       }
  //     });
  //     filteredWithMealType = allMeals.map((meal) => {
  //       if (dietTypeFilter.every((val) => meal.diet.includes(val))) {
  //         return meal;
  //       } else {
  //         return undefined;
  //       }
  //     });
  //     filteredWithMealType = allMeals.map((meal) => {
  //       if (
  //         meal.preprationTime >= preprationTimeFilter[0] &&
  //         meal.preprationTime < preprationTimeFilter[1]
  //       ) {
  //         console.log("here");
  //         return meal;
  //       } else {
  //         return undefined;
  //       }
  //     });
  //     filteredWithMealType = allMeals.map((meal) => {
  //       if (
  //         meal.calories >= caloriesFilter[0] &&
  //         meal.calories < caloriesFilter[1]
  //       ) {
  //         console.log("here");
  //         return meal;
  //       } else {
  //         return undefined;
  //       }
  //     });
  //     setFilterMeals(_.compact(filteredWithMealType));
  //   },
  //   // eslint-disable-next-line
  //   [
  //     // filteredWithMealType,
  //     mealTypeFilters,
  //     ingredientsTypeFilter,
  //     dietTypeFilter,
  //     preprationTimeFilter,
  //     caloriesFilter,
  //   ]
  // );

  function onSelectFilter(type, value) {
    if (type === "mealType") {
      const check = mealTypeFilters.includes(value);
      if (check) {
        const newArray = mealTypeFilters.filter((str) => str !== value);
        setMealTypeFilters(newArray);
        // console.log("====>", newArray);
      } else {
        setMealTypeFilters((prev) => [...prev, value]);
      }
      console.log(value);
      console.log(check);
      console.log(mealTypeFilters);
    }
    if (type === "ingredientsType") {
      const check = ingredientsTypeFilter.includes(value);
      if (check) {
        const newArray = ingredientsTypeFilter.filter((str) => str !== value);
        setIngredientsTypeFilter(newArray);
        // console.log("====>", newArray);
      } else {
        setIngredientsTypeFilter((prev) => [...prev, value]);
      }
      console.log(value);
      console.log(check);
      console.log(mealTypeFilters);
    }
    if (type === "diet") {
      const check = dietTypeFilter.includes(value);
      if (check) {
        const newArray = dietTypeFilter.filter((str) => str !== value);
        setDietTypeFilter(newArray);
        // console.log("====>", newArray);
      } else {
        setDietTypeFilter((prev) => [...prev, value]);
      }

      console.log(value);
      console.log(check);
      console.log(mealTypeFilters);
    }
  }
  function removeAllFilters() {
    setMealTypeFilters([]);
    setIngredientsTypeFilter([]);
    setDietTypeFilter([]);
    setPreprationTimeFilter([5, 55]);
    setCaloriesFilter([100, 955]);
    setFilterMeals(allRecipies);
  }
  return (
    <div className="search-nutrition-container">
      {/* trainers */}
      <div className="trainers-3-row">
        <Input
          size="large"
          placeholder="Search Keyword"
          style={{
            backgroundColor: "transparent",
            padding: "20px",
            color: "#fff",
            fontSize: "2rem",
            opacity: "0.8",
          }}
          value={mealName}
          onChange={(e) => {
            console.log(e.target.value);
            setMealName(e.target.value);
            // setFilterMeals(
            console.log(
              allMeals.filter((meal) =>
                meal.name.toUpperCase().includes(e.target.value.toUpperCase())
              )
            );

            // );
          }}
          prefix={<SearchOutlined />}
        />
        {width <= 700 && (
          <Collapse ghost>
            <Collapse.Panel
              showArrow={false}
              header={
                <p
                  className="font-paragraph-white"
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: "18px",
                  }}
                >
                  Filter Nutritions
                </p>
              }
              key="1"
            >
              <div className="nutrition-filters">
                <div
                  className="nutrition-filters-mealtype"
                  style={{ paddingTop: "20px" }}
                >
                  <h2
                    style={{ color: "#fff", opacity: "0.8" }}
                    className="font-subheading-white"
                  >
                    <T>userDashboard.nutrient.mealtype</T>
                  </h2>
                  <div className="selectable-values">
                    {allMealTypes.map((value) => (
                      <div
                        className="selectable-values-value font-paragraph-white"
                        style={{
                          backgroundColor: mealTypeFilters.includes(value._id)
                            ? "#ff7700"
                            : "#333b44",
                        }}
                        onClick={() => onSelectFilter("mealType", value._id)}
                      >
                        {value.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="nutrition-filters-ingredients">
                  <h2
                    style={{ color: "#fff", opacity: "0.8" }}
                    className="font-subheading-white"
                  >
                    <T>userDashboard.nutrient.ingredients</T>
                  </h2>
                  <div className="selectable-values">
                    {allIngredients.map((value) => (
                      <div
                        className="selectable-values-value font-paragraph-white"
                        style={{
                          backgroundColor: ingredientsTypeFilter.includes(
                            value._id
                          )
                            ? "#ff7700"
                            : "#333b44",
                        }}
                        onClick={() =>
                          onSelectFilter("ingredientsType", value._id)
                        }
                      >
                        {value.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="nutrition-filters-preprationTime">
                  <h2
                    style={{ color: "#fff", opacity: "0.8" }}
                    className="font-subheading-white"
                  >
                    <T>userDashboard.nutrient.pt</T>
                  </h2>
                  {console.log("recipes all meals", allMeals)}
                  <Slider
                    min={5}
                    max={55}
                    range
                    onChange={(value) => setPreprationTimeFilter(value)}
                    defaultValue={preprationTimeFilter}
                  />
                  <div style={{ color: "#fff", fontSize: "1.5rem" }}>
                    {`${preprationTimeFilter[0]} - ${preprationTimeFilter[1]}`}
                  </div>
                </div>
                <div className="nutrition-filters-calories">
                  <h2
                    style={{ color: "#fff", opacity: "0.8" }}
                    className="font-subheading-white"
                  >
                    <T>userDashboard.nutrient.calories</T>
                  </h2>
                  <Slider
                    min={100}
                    max={955}
                    range
                    onChange={(value) => setCaloriesFilter(value)}
                    defaultValue={caloriesFilter}
                  />
                  <div style={{ color: "#fff", fontSize: "1.5rem" }}>
                    {`${caloriesFilter[0]} - ${caloriesFilter[1]}`}
                  </div>
                </div>
                <div className="nutrition-filters-diet">
                  <h2
                    style={{ color: "#fff", opacity: "0.8" }}
                    className="font-subheading-white"
                  >
                    <T>userDashboard.nutrient.diet</T>
                  </h2>
                  <div className="selectable-values">
                    {allDiets.map((value) => (
                      <div
                        className="selectable-values-value font-paragraph-white"
                        style={{
                          backgroundColor: dietTypeFilter.includes(value._id)
                            ? "#ff7700"
                            : "#333b44",
                        }}
                        onClick={() => onSelectFilter("diet", value._id)}
                      >
                        {value.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="reset-all-filters"
                  onClick={() => removeAllFilters()}
                >
                  <T>userDashboard.nutrient.raf</T>
                </div>
              </div>
            </Collapse.Panel>
          </Collapse>
        )}

        <div className="nutrition-container">
          {width > 700 && (
            <div className="nutrition-filters">
              <div
                className="nutrition-filters-mealtype"
                style={{ paddingTop: "20px" }}
              >
                <h2
                  style={{ color: "#fff", opacity: "0.8" }}
                  className="font-subheading-white"
                >
                  <T>userDashboard.nutrient.mealtype</T>
                </h2>
                <div className="selectable-values">
                  {allMealTypes.map((value) => (
                    <div
                      className="selectable-values-value font-paragraph-white"
                      style={{
                        backgroundColor: mealTypeFilters.includes(value._id)
                          ? "#ff7700"
                          : "#333b44",
                      }}
                      onClick={() => onSelectFilter("mealType", value._id)}
                    >
                      {value.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="nutrition-filters-ingredients">
                <h2
                  style={{ color: "#fff", opacity: "0.8" }}
                  className="font-subheading-white"
                >
                  <T>userDashboard.nutrient.ingredients</T>
                </h2>
                <div className="selectable-values">
                  {allIngredients.map((value) => (
                    <div
                      className="selectable-values-value font-paragraph-white"
                      style={{
                        backgroundColor: ingredientsTypeFilter.includes(
                          value._id
                        )
                          ? "#ff7700"
                          : "#333b44",
                      }}
                      onClick={() =>
                        onSelectFilter("ingredientsType", value._id)
                      }
                    >
                      {value.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="nutrition-filters-preprationTime">
                <h2
                  style={{ color: "#fff", opacity: "0.8" }}
                  className="font-subheading-white"
                >
                  <T>userDashboard.nutrient.pt</T>
                </h2>
                {console.log("recipes all meals", allMeals)}
                <Slider
                  min={5}
                  max={55}
                  range
                  onChange={(value) => setPreprationTimeFilter(value)}
                  defaultValue={preprationTimeFilter}
                />
                <div style={{ color: "#fff", fontSize: "1.5rem" }}>
                  {`${preprationTimeFilter[0]} - ${preprationTimeFilter[1]}`}
                </div>
              </div>
              <div className="nutrition-filters-calories">
                <h2
                  style={{ color: "#fff", opacity: "0.8" }}
                  className="font-subheading-white"
                >
                  <T>userDashboard.nutrient.calories</T>
                </h2>
                <Slider
                  min={100}
                  max={955}
                  range
                  onChange={(value) => setCaloriesFilter(value)}
                  defaultValue={caloriesFilter}
                />
                <div style={{ color: "#fff", fontSize: "1.5rem" }}>
                  {`${caloriesFilter[0]} - ${caloriesFilter[1]}`}
                </div>
              </div>
              <div className="nutrition-filters-diet">
                <h2
                  style={{ color: "#fff", opacity: "0.8" }}
                  className="font-subheading-white"
                >
                  <T>userDashboard.nutrient.diet</T>
                </h2>
                <div className="selectable-values">
                  {allDiets.map((value) => (
                    <div
                      className="selectable-values-value font-paragraph-white"
                      style={{
                        backgroundColor: dietTypeFilter.includes(value._id)
                          ? "#ff7700"
                          : "#333b44",
                      }}
                      onClick={() => onSelectFilter("diet", value._id)}
                    >
                      {value.name}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="reset-all-filters"
                onClick={() => removeAllFilters()}
              >
                <T>userDashboard.nutrient.raf</T>
              </div>
            </div>
          )}
          <div className="trainers-3-row-cards nutrition-cards">
            {filterMeals.map((meal) => (
              <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                {console.log(meal)}
                <ChallengeCard
                  picture={`${
                    process.env.REACT_APP_SERVER
                  }/uploads/${meal.image.replaceAll(" ", "%20")}`}
                  name={meal.name}
                  rating={meal.rating}
                  newc={true}
                  preprationTime={meal.prepTime}
                  recipe={true}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchNutrition;
