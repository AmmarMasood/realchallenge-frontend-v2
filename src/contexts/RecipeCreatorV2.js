import React, { createContext, useState, useContext } from "react";
import { v4 } from "uuid";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [persons, setPersons] = useState(0);
  const [kCalPerPerson, setKCalPerPerson] = useState(0);
  const [saturationIndex, setSaturationIndex] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbohydrate, setCarbohydrate] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cookingProcess, setCookingProcess] = useState([]);
  const [notes, setNotes] = useState("");
  const [tips, setTips] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [allowReviews, setAllowReviews] = useState(false);

  // Metadata lists
  const [allMealTypes, setAllMealTypes] = useState([]);
  const [allFoodTypes, setAllFoodTypes] = useState([]);
  const [allDiets, setAllDiets] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);

  const populateRecipeInfo = (recipeData) => {
    if (!recipeData) return;

    setRecipeName(recipeData.name || "");
    setRecipeDescription(recipeData.description || "");
    setFeaturedImage(recipeData.image ? { link: recipeData.image } : "");
    setPrepTime(recipeData.prepTime || 0);
    setPersons(recipeData.persons || 0);
    setKCalPerPerson(recipeData.kCalPerPerson || 0);
    setSaturationIndex(recipeData.saturationIndex || 0);
    setProtein(recipeData.protein || 0);
    setCarbohydrate(recipeData.carbohydrate || 0);
    setFat(recipeData.fat || 0);
    setFiber(recipeData.fiber || 0);

    // Meal types — store as [{_id, name}] objects
    setSelectedMealTypes(
      recipeData.mealTypes
        ? recipeData.mealTypes.map((mt) => ({
            _id: mt._id || mt,
            name: mt.name || "",
          }))
        : []
    );

    // Food types
    setSelectedFoodTypes(
      recipeData.foodTypes
        ? recipeData.foodTypes.map((ft) => ({
            _id: ft._id || ft,
            name: ft.name || "",
          }))
        : []
    );

    // Diet
    setSelectedDiet(
      recipeData.diet
        ? recipeData.diet.map((d) => ({
            _id: d._id || d,
            name: d.name || "",
          }))
        : []
    );

    // Ingredients — add UUIDs for dynamic list keying
    setIngredients(
      recipeData.ingredients
        ? recipeData.ingredients.map((ing) => ({
            id: v4(),
            name: ing.name?._id || ing.name || "",
            nameLabel: ing.name?.name || "",
            weight: ing.weight || "",
            volume: ing.volume || "",
            pieces: ing.pieces || "",
            method: ing.method || "",
            other: ing.other || "",
          }))
        : []
    );

    // Cooking process
    setCookingProcess(
      recipeData.cookingProcess
        ? recipeData.cookingProcess.map((step) => ({
            id: v4(),
            text: step,
          }))
        : []
    );

    setNotes(recipeData.notes || "");
    setTips(recipeData.tips || "");
    setIsPublic(recipeData.isPublic || false);
    setAdminApproved(recipeData.adminApproved || false);
    setAllowComments(recipeData.allowComments || false);
    setAllowReviews(recipeData.allowReviews || false);
  };

  return (
    <RecipeContext.Provider
      value={{
        loading,
        setLoading,
        recipeName,
        setRecipeName,
        recipeDescription,
        setRecipeDescription,
        featuredImage,
        setFeaturedImage,
        prepTime,
        setPrepTime,
        persons,
        setPersons,
        kCalPerPerson,
        setKCalPerPerson,
        saturationIndex,
        setSaturationIndex,
        protein,
        setProtein,
        carbohydrate,
        setCarbohydrate,
        fat,
        setFat,
        fiber,
        setFiber,
        selectedMealTypes,
        setSelectedMealTypes,
        selectedFoodTypes,
        setSelectedFoodTypes,
        selectedDiet,
        setSelectedDiet,
        ingredients,
        setIngredients,
        cookingProcess,
        setCookingProcess,
        notes,
        setNotes,
        tips,
        setTips,
        isPublic,
        setIsPublic,
        adminApproved,
        setAdminApproved,
        allowComments,
        setAllowComments,
        allowReviews,
        setAllowReviews,
        allMealTypes,
        setAllMealTypes,
        allFoodTypes,
        setAllFoodTypes,
        allDiets,
        setAllDiets,
        allIngredients,
        setAllIngredients,
        populateRecipeInfo,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  return useContext(RecipeContext);
}
