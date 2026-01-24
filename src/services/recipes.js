import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllRecipes(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe?language=${language}`,
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
    .post(
      `${process.env.REACT_APP_SERVER}/api/recipes/recipe/${id}/update`,
      values,
    )
    .then((res) => {
      openNotificationWithIcon("success", "Recipe updated successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
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

export function getAllMealTypes(language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/recipes/mealType?language=${language}`,
    )
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

export function removeMealType(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/recipes/mealType/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Meal Type deleted successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to remove meal type", "");
      console.log(err);
    });
}

export function createMealType(name, language) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/mealType/create`, {
      name: name,
      language,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Meal Type created successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      console.log(err.response.data);
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }

      openNotificationWithIcon("error", "Unable to create meal type", "");
    });
}

export function updateMealType(name, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/recipes/mealType/${id}`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Meal Type updated successfully", "");
    })
    .catch((err) => {
      if (err.response.data.header && err.response.data.header.message) {
        openNotificationWithIcon("error", err.response.data.header.message, "");
        return;
      }
      openNotificationWithIcon("error", "Unable to update meal type", "");
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

export function createIngredient(name, language) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/recipes/ingredient/create`, {
      name: name,
      language,
    })
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Ingredient created successfully",
        "",
      );
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
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/favouriteRecipe/${id}/update`,
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
    .post(
      `${process.env.REACT_APP_SERVER}/api/customerDetails/unfavouriteRecipe/${id}/update`,
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
