import axios from "axios";
import { notification } from "antd";

const notify = (type, message, description) =>
  notification[type]({ message, description });

const BASE = () => `${process.env.REACT_APP_SERVER}/api/meal-plan`;

// GET active This Week plan (backend lazily builds+persists if absent).
export function getCurrentWeek(customerId, language) {
  const q = language ? `?language=${encodeURIComponent(language)}` : "";
  return axios
    .get(`${BASE()}/current/${customerId}${q}`)
    .then((res) => res.data.plan)
    .catch((err) => {
      notify("error", "Unable to load this week's plan", "");
      console.log(err);
    });
}

// GET Next Week (planning) plan.
export function getNextWeek(customerId, language) {
  const q = language ? `?language=${encodeURIComponent(language)}` : "";
  return axios
    .get(`${BASE()}/next/${customerId}${q}`)
    .then((res) => res.data.plan)
    .catch((err) => {
      notify("error", "Unable to load next week's plan", "");
      console.log(err);
    });
}

// Regenerate Next Week (preserves valid pins; may return a soft warning).
export function regenerateNextWeek(customerId, language) {
  const q = language ? `?language=${encodeURIComponent(language)}` : "";
  return axios
    .post(`${BASE()}/generate-next/${customerId}${q}`)
    .then((res) => res.data) // { plan, warning }
    .catch((err) => {
      notify("error", "Unable to regenerate next week", "");
      console.log(err);
    });
}

// Swap a slot in Next Week. Resolves to { ok, conflict?, data }.
// conflict=true means the slot is pinned (HTTP 409) — caller shows
// "unpin first" rather than an error toast.
export function swapMeal(customerId, weekday, mealSlot) {
  return axios
    .post(`${BASE()}/swap/${customerId}`, { weekday, meal_slot: mealSlot })
    .then((res) => ({ ok: true, data: res.data }))
    .catch((err) => {
      if (err.response && err.response.status === 409) {
        return {
          ok: false,
          conflict: true,
          message: err.response.data.message,
        };
      }
      const beMsg =
        err.response && err.response.data && err.response.data.message;
      return { ok: false, message: beMsg || null };
    });
}

// Create/replace a recipe pin. mode = "just_once" | "always".
export function pinRecipe(customerId, payload) {
  return axios
    .post(`${BASE()}/pin/recipe/${customerId}`, payload)
    .then((res) => res.data.pin)
    .catch((err) => {
      notify("error", "Unable to pin recipe", "");
      console.log(err);
    });
}

export function removeRecipePin(customerId, pinId) {
  return axios
    .post(`${BASE()}/pin/recipe/${customerId}`, { remove: true, pin_id: pinId })
    .then((res) => res.data)
    .catch((err) => {
      notify("error", "Unable to remove pin", "");
      console.log(err);
    });
}

// Create/replace a day pin. locked_meals = [{ meal_slot, recipe_id }, ...].
export function pinDay(customerId, payload) {
  return axios
    .post(`${BASE()}/pin/day/${customerId}`, payload)
    .then((res) => res.data.pin)
    .catch((err) => {
      notify("error", "Unable to pin day", "");
      console.log(err);
    });
}

export function removeDayPin(customerId, pinId) {
  return axios
    .post(`${BASE()}/pin/day/${customerId}`, { remove: true, pin_id: pinId })
    .then((res) => res.data)
    .catch((err) => {
      notify("error", "Unable to remove day pin", "");
      console.log(err);
    });
}

// ---- Shopping list ----

export function getShoppingList(customerId) {
  return axios
    .get(`${BASE()}/shopping-list/${customerId}`)
    .then((res) => res.data.list)
    .catch((err) => {
      console.log(err);
      return { items: [] };
    });
}

// Recipe-level add — allowed in This Week AND Next Week.
export function addRecipeToShopping(customerId, recipeId) {
  return axios
    .post(`${BASE()}/shopping-list/add-recipe/${customerId}`, {
      recipe_id: recipeId,
    })
    .then((res) => res.data) // { list, prompt }
    .catch((err) => {
      notify("error", "Unable to add to shopping list", "");
      console.log(err);
    });
}

// Recipe-level remove — drops the recipe chip + subtracts its
// contributed quantities from the shopping items.
export function removeRecipeFromShopping(customerId, recipeId) {
  return axios
    .post(`${BASE()}/shopping-list/remove-recipe/${customerId}`, {
      recipe_id: recipeId,
    })
    .then((res) => res.data.list)
    .catch((err) => {
      notify("error", "Unable to remove recipe", "");
      console.log(err);
    });
}

// Full-week sync — Next Week only (backend enforces).
export function syncWeekShopping(customerId) {
  return axios
    .post(`${BASE()}/shopping-list/sync-week/${customerId}`)
    .then((res) => res.data) // { list, prompt }
    .catch((err) => {
      notify("error", "Unable to update shopping list", "");
      console.log(err);
    });
}

export function updateShoppingItem(customerId, payload) {
  return axios
    .put(`${BASE()}/shopping-list/item/${customerId}`, payload)
    .then((res) => res.data.list)
    .catch((err) => {
      notify("error", "Unable to update item", "");
      console.log(err);
    });
}

// ---- Delivery (ordering disabled this sprint) ----

export function getDeliveryStatus(customerId) {
  return axios
    .get(`${BASE()}/delivery-status/${customerId}`)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return { orderingEnabled: false };
    });
}

// ---- Pins (settings-change invalidation) ----

export function getPinCount(customerId) {
  return axios
    .get(`${BASE()}/pins/count/${customerId}`)
    .then((res) => res.data)
    .catch(() => ({ total: 0 }));
}

export function invalidatePins(customerId, reason) {
  return axios
    .post(`${BASE()}/pins/invalidate/${customerId}`, { reason })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}
