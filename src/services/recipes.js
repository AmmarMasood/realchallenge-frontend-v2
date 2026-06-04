import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllRecipes(language, opts = {}) {
  const params = new URLSearchParams({ language });
  if (opts.supplementOnly) params.set("supplementOnly", "true");
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe?${params.toString()}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get recipes", "");
      console.log(err);
    });
}

export function getAllUserRecipes(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/all/users?language=${language}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get recipes", "");
      console.log(err);
    });
}

export function createRecipe(values) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/create`, values)
    .then((res) => {
      openNotificationWithIcon("success", "Recipe created successfully", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      if (err.response) {
        console.log(" err.response.headers.message", err.response);
        if (err.response.data) {
          openNotificationWithIcon(
            "error",
            err.response.data.header.message,
            "",
          );
          return;
        }
      }
      openNotificationWithIcon("error", "Unable to create recipe", "");
      console.log(err);
    });
}

export function updateRecipe(values, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}`,
      values,
    )
    .then((res) => {
      openNotificationWithIcon("success", "Recipe updated successfully", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response?.data?.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update recipe", "");
      console.log(err);
    });
}
export function deleteRecipeWithId(id) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}/delete`)
    .then((res) => {
      openNotificationWithIcon("success", "recipe delete successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get recipes", "");
      console.log(err);
    });
}

export function getAllMealTypes() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/recipes/mealType`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get meal types", "");
      console.log(err);
    });
}

export function getAllFoodTypes(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/foodType?language=${language}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get food types", "");
      console.log(err);
    });
}

export function createFoodType(name, language) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/foodType/create`, {
      name: name,
      language,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Food Type created successfully", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to create food type", "");
      console.log(err);
    });
}

export function removeFoodType(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/foodType/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Food Type deleted successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to remove food types", "");
      console.log(err);
    });
}

export function updateFoodType(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/foodType/${id}`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Food Type updated successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update food type", "");
      console.log(err);
    });
}

export function getAllDietTypes(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/diet?language=${language}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get diet types", "");
      console.log(err);
    });
}

export function createDiet(name, language) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/diet/create`, {
      name: name,
      language,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Diet created successfully", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to create diet", "");
      console.log(err);
    });
}

export function updateDiet(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/diet/${id}`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Diet updated successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update diet", "");
      console.log(err);
    });
}

export function removeDiet(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/diet/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Diet deleted successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to remove diet", "");
      console.log(err);
    });
}

export function getAllAllergens(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/allergen?language=${language}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get allergens", "");
      console.log(err);
    });
}

export function createAllergen(name, language) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/allergen/create`, {
      name: name,
      language,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Allergen created successfully", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to create allergen", "");
      console.log(err);
    });
}

export function updateAllergen(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/allergen/${id}`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Allergen updated successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update allergen", "");
      console.log(err);
    });
}

export function removeAllergen(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/allergen/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Allergen deleted successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to remove allergen", "");
      console.log(err);
    });
}

export function getAllIngredients(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/ingredient?language=${language}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to get ingredient", "");
      console.log(err);
    });
}

export function createIngredient(name, language, opts = {}) {
  const { isPantryStaple = false, category = "", defaultUnit = "" } = opts;
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/create`, {
      name: name,
      language,
      isPantryStaple,
      category,
      defaultUnit,
    })
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Ingredient created successfully",
        "",
      );
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to create ingredient", "");
      console.log(err);
    });
}

export function updateIngredient(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/${id}`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Ingredient updated successfully",
        "",
      );
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update ingredient", "");
      console.log(err);
    });
}

export function setIngredientPantryStaple(id, isPantryStaple) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/${id}`, {
      isPantryStaple,
    })
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update pantry flag", "");
      console.log(err);
    });
}

export function setIngredientActive(id, isActive) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/${id}`, {
      isActive,
    })
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update active state", "");
      console.log(err);
    });
}
export function removeIngredient(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/${id}`)
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Ingredient deleted successfully",
        "",
      );
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to remove ingredient", "");
      console.log(err);
    });
}

// Translation-related functions for multi-language support
export function getRecipeTranslationsByKey(
  translationKey,
  excludeLanguage = null,
) {
  const params = new URLSearchParams();
  if (excludeLanguage) params.append("excludeLanguage", excludeLanguage);
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/translations/${translationKey}?${params.toString()}`,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { translations: [], count: 0 };
    });
}

export function getRecipeByTranslationKey(translationKey, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/translation/${translationKey}/${language}`,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export function getRecipeById(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}`)
    .then((res) => {
      // setLoading(false);
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      // setLoading(false);
      openNotificationWithIcon("error", "Unable to remove ingredient", "");
      console.log(err);
    });
}

export function favouriteRecipeById(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/favouriteRecipe/${id}`,
      body,
    )
    .then((res) => {
      // setLoading(false);
      openNotificationWithIcon("success", "Recipe added to favourites!", "");
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      // setLoading(false);

      err.response.data.msg
        ? openNotificationWithIcon("error", err.response.data.msg, "")
        : openNotificationWithIcon(
            "error",
            "Unable to add recipe to favourite",
            "",
          );
    });
}

export function unFavouriteRecipeById(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/unfavouriteRecipe/${id}`,
      body,
    )
    .then((res) => {
      // setLoading(false);
      openNotificationWithIcon(
        "success",
        "Recipe removed from favourites!",
        "",
      );
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      // setLoading(false);

      err.response.data.msg
        ? openNotificationWithIcon("error", err.response.data.msg, "")
        : openNotificationWithIcon(
            "error",
            "Unable to remove recipe from favourite",
            "",
          );
    });
}

export function getAllFavouriteRecipes(id) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/favouriteRecipe/${id}`,
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      console.log(err);
      // err.response.data.msg
      //   ? openNotificationWithIcon("error", err.response.data.msg, "")
      //   : openNotificationWithIcon(
      //       "error",
      //       "Unable to get favourite recipes",
      //       ""
      //     );
    });
}

export function addToShoppingCart(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/shoppingCart/${id}`,
      body,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}

export function removeFromShoppingCart(body, id) {
  return axios
    .put(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/removeShoppingCart/${id}`,
      body,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}

export function getShoppingCart(id) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/shoppingCart/${id}`,
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}

export function addRecipeReview(recipeId, comment, rating) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/reviews`,
      {
        comment: comment,
        rating: rating,
      },
    )
    .then((res) => {
      return { success: true, data: res.data };
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      console.log(err);
      openNotificationWithIcon("error", "Unable to add review", "");
      return { success: false, data: err };
    });
}

export function addRecipeComment(recipeId, comment) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/comments`,
      { text: comment },
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to add comment", "");
    });
}

// Edit lock: acquire lock before editing
export function acquireRecipeLock(recipeId) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/lock`)
    .then((res) => res.data)
    .catch((err) => {
      // 423 = locked by someone else — return error data for the caller to handle
      if (err.response?.status === 423) {
        return { error: "RECIPE_LOCKED", ...err.response.data };
      }
      throw err;
    });
}

// Edit lock: release lock when done editing
export function releaseRecipeLock(recipeId) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/lock`)
    .then((res) => res.data)
    .catch((err) => {
      console.log("Failed to release lock:", err);
    });
}

// Edit lock: heartbeat to keep lock alive
export function renewRecipeLock(recipeId) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/lock`)
    .then((res) => res.data)
    .catch((err) => {
      console.log("Failed to renew lock:", err);
    });
}

export function clapRecipe(id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}/clap`)
    .then((res) => res.data)
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.msg) {
        openNotificationWithIcon("error", err.response.data.msg, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to clap the recipe.", "");
      console.log(err);
    });
}

export function unclapRecipe(id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}/unclap`)
    .then((res) => res.data)
    .catch((err) => {
      if (err.response && err.response.data && err.response.data.msg) {
        openNotificationWithIcon("error", err.response.data.msg, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to unclap the recipe.", "");
      console.log(err);
    });
}
