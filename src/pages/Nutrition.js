import React, { useState, useEffect, useContext } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
  ArrowRightOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../assets/nutrition.css";
import SearchNutrition from "../components/Nutrition/SearchNutrition";

import {
  getAllDietTypes,
  getAllIngredients,
  getAllMealTypes,
  getAllRecipes,
} from "../services/recipes";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";

function Nutrition() {
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [allMealTypes, setAllMealTypes] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allDiets, setAllDiets] = useState([]);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAllRecipes(language);
    const allMealT = await getAllMealTypes(language);
    const allIngre = await getAllIngredients(language);
    const allDiet = await getAllDietTypes(language);
    setLoading(false);
    console.log(allMealT);
    console.log(allIngre);
    console.log(allDiet);
    if (res.recipes) {
      setRecipes(res.recipes);
      console.log("first recipe", res.recipes);
    }
    if (allMealT.mealTypes) {
      setAllMealTypes(allMealT.mealTypes);
    }
    if (allIngre.ingredients) {
      setAllIngredients(allIngre.ingredients);
    }
    if (allDiet.diets) {
      setAllDiets(allDiet.diets);
    }
  };

  return (
    <div>
      <Navbar />
      {/* <Hero /> */}
      <div className="page-header nutrition-header background-nutrition">
        <div className="page-header-textbox">
          <h1 className="font-heading-white">
            <T>nutrition.skill</T>
          </h1>
          <p style={{ width: "50vw" }} className="font-paragraph-white">
            <T>nutrition.select</T>
          </p>
        </div>
      </div>
      <div>
        {loading ? (
          <div
            style={{
              backgroundColor: "#171e27",
              padding: "50px",
              height: "200px",
              textAlign: "center",
            }}
          >
            <LoadingOutlined
              style={{ color: "#ff7700", fontSize: "30px", margin: "0 auto" }}
            />
          </div>
        ) : (
          <SearchNutrition
            allRecipies={recipes}
            allDiets={allDiets}
            allIngredients={allIngredients}
            allMealTypes={allMealTypes}
          />
        )}
      </div>
      {/* 3nd row */}
      <div style={{ backgroundColor: "#222932" }}>
        <div className="nutrition-3-row">
          <h1
            style={{ fontSize: "5rem", color: "#fff" }}
            className="font-heading-white"
          >
            <T>nutrition.let_us</T>
          </h1>
          <p className="font-paragraph-white">
            <T>nutrition.your_personal</T>
          </p>
        </div>
      </div>
      {/* 4th row */}
      <div className="home-row-7 background-nutrition">
        <div className="home-row-7-container" style={{ padding: "50px" }}>
          <div className="home-row-7-container-text">
            {/* <h2 style={{ fontSize: "2rem" }}>Need more inspiration?</h2> */}
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>nutrition.1_week</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>nutrition.start_now</T>
            </p>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.nutrition_plan</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.no_calories</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.choose</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.keep</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.change_goal</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.swap</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.weekly</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.order_online</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                <T>nutrition.add_fav</T>
              </span>
            </div>

            <Link
              className="home-button"
              to="/new"
              style={{ marginTop: "20px" }}
            >
              <span className="home-button-text font-paragraph-white">
                <T>nutrition.start_7</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 7th row */}
      {/* 8th row */}

      {/* 4th row */}

      <Footer />
    </div>
  );
}

export default Nutrition;
