import React, { useState, useEffect } from "react";
import "../../assets/home.css";
import "../../assets/trainers.css";
import { Collapse, Input, Slider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../../assets/nutrition.css";

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
    setFilterMeals(r);
  }, [allRecipies]);

  useEffect(() => {
    const search = mealName.trim().toLowerCase();

    const getIngredientIds = (meal) =>
      (meal.ingredients || []).map((i) => {
        if (!i || !i.name) return "";
        return String(typeof i.name === "object" ? i.name._id : i.name);
      });

    const filtered = allMeals.filter((meal) => {
      if (search && !(meal.name || "").toLowerCase().includes(search)) {
        return false;
      }

      if (mealTypeFilters.length > 0) {
        const mealTypeIds = (meal.mealTypes || []).map(String);
        if (!mealTypeFilters.some((id) => mealTypeIds.includes(id))) {
          return false;
        }
      }

      if (ingredientsTypeFilter.length > 0) {
        const ingIds = getIngredientIds(meal);
        if (!ingredientsTypeFilter.some((id) => ingIds.includes(id))) {
          return false;
        }
      }

      if (dietTypeFilter.length > 0) {
        const dietIds = (meal.diet || []).map(String);
        if (!dietTypeFilter.some((id) => dietIds.includes(id))) {
          return false;
        }
      }

      const pt = Number(meal.prepTime) || 0;
      if (pt < preprationTimeFilter[0] || pt > preprationTimeFilter[1]) {
        return false;
      }

      const cal = Number(meal.kCalPerPerson) || 0;
      if (cal < caloriesFilter[0] || cal > caloriesFilter[1]) {
        return false;
      }

      return true;
    });

    setFilterMeals(filtered);
  }, [
    allMeals,
    mealName,
    mealTypeFilters,
    ingredientsTypeFilter,
    dietTypeFilter,
    preprationTimeFilter,
    caloriesFilter,
  ]);

  function onSelectFilter(type, value) {
    if (type === "mealType") {
      setMealTypeFilters((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
    if (type === "ingredientsType") {
      setIngredientsTypeFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
    if (type === "diet") {
      setDietTypeFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  }
  function removeAllFilters() {
    setMealName("");
    setMealTypeFilters([]);
    setIngredientsTypeFilter([]);
    setDietTypeFilter([]);
    setPreprationTimeFilter([5, 55]);
    setCaloriesFilter([100, 955]);
  }
  return (
    <div className="search-nutrition-container">
      {/* trainers */}
      <div className="trainers-3-row">
        <Input
          size="large"
          placeholder="Search Keyword"
          className="nutrition-search-input"
          style={{
            backgroundColor: "transparent",
            padding: "20px",
            fontSize: "2rem",
          }}
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#fff", opacity: 0.8 }} />}
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
            {filterMeals.length === 0 ? (
              <div
                className="font-paragraph-white"
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "16px",
                }}
              >
                <T>userDashboard.nutrient.no_recipes</T>
              </div>
            ) : (
              filterMeals.map((meal) => (
                <Link
                  key={meal._id}
                  to={`/recipe/${slug(meal.name)}/${meal._id}`}
                >
                  <ChallengeCard
                    picture={meal.image ? meal.image.replaceAll(" ", "%20") : ""}
                    name={meal.name}
                    rating={meal.rating}
                    newc={false}
                    preprationTime={meal.prepTime}
                    recipe={true}
                  />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchNutrition;
