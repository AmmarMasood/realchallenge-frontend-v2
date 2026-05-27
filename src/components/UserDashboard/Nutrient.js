import React, { useState, useEffect, useContext } from "react";
import "react-multi-carousel/lib/styles.css";
import "../../assets/userDashboard.css";
import { Switch, Modal, Checkbox, message } from "antd";
import {
  CaretDownOutlined,
  CloseSquareFilled,
  CloseOutlined,
  PlusOutlined,
  HeartFilled,
  LoadingOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
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
import slug from "elegant-slug";
import { T, translate } from "../Translate";
import PinPopover from "./PinPopover";
import {
  getCurrentWeek,
  getNextWeek,
  regenerateNextWeek,
  swapMeal as swapMealApi,
  pinRecipe as pinRecipeApi,
  removeRecipePin as removeRecipePinApi,
  pinDay as pinDayApi,
  removeDayPin as removeDayPinApi,
  getShoppingList,
  addRecipeToShopping,
  removeRecipeFromShopping,
  syncWeekShopping,
  updateShoppingItem,
  getDeliveryStatus,
  getPinCount,
  invalidatePins,
} from "../../services/mealPlan";

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

// Format a shopping-list quantity for display.
//  - "pieces" → ceil to a whole number with a space ("0.5 → 1 pieces")
//    because half a piece of an ingredient isn't a real purchasable unit.
//  - "g" / "ml" → round to 1 decimal, drop trailing .0 ("0.45 → 0.5g",
//    "300.0 → 300g"), no space (matches the Figma's "650g" style).
function formatShoppingQty(quantity, unit) {
  if (typeof quantity !== "number" || Number.isNaN(quantity)) return "";
  if (unit === "pieces") {
    const n = Math.max(1, Math.ceil(quantity));
    return `${n} pieces`;
  }
  const rounded = Math.round(quantity * 10) / 10;
  const str = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
  return `${str}${unit || ""}`;
}

// Strip HTML tags from a rich-text string so block-level <p>/<br> don't
// break the line-clamp ellipsis on the description.
function stripHtml(html) {
  if (!html) return "";
  if (typeof window !== "undefined" && window.DOMParser) {
    try {
      const doc = new window.DOMParser().parseFromString(
        String(html),
        "text/html"
      );
      return (doc.body && doc.body.textContent) || "";
    } catch (_) {
      // fall through to regex
    }
  }
  return String(html).replace(/<[^>]+>/g, "");
}

// Render a slot key (breakfast, morningSnack, ...) as a user-facing label.
// Prefers the i18n entry (mealType.<key>); falls back to camelCase → "Title
// Case" so a missing translation still reads naturally.
function formatMealSlot(slot) {
  if (!slot) return "";
  const key = `mealType.${slot}`;
  const translated = translate(key);
  if (translated && translated !== key) return translated;
  return slot
    .replace(/[0-9]/g, "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function Nutrient({ userProfile, gender, getUserDetails }) {
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
  const [currentDay, setCurrentDay] = useState(
    () => localStorage.getItem("currentDay") || "monday",
  );
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
  const [fav, setFavRecipes] = useState([]);
  // Backend WeekPlan model. weekMode toggles This Week (execution) vs
  // Next Week (planning). The raw plan keeps per-day date/lock info that
  // the mapped mealsOfTheWeek shape drops.
  // Signup-day default focus (spec §43):
  //  - Mon-Wed → default to This Week (the user can act on their plan now)
  //  - Thu-Sun → default to Next Week (this week is mostly past; planning
  //    matters more, with the "your first plan starts Monday" copy)
  // User can still freely toggle between modes; this only sets the initial
  // view on first mount.
  const [weekMode, setWeekMode] = useState(() => {
    const d = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return d >= 1 && d <= 3 ? "this_week" : "next_week";
  });
  const [weekPlan, setWeekPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planWarning, setPlanWarning] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [actionSlotKey, setActionSlotKey] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  // Person-count multiplier for the shopping list. Backend stores
  // ingredient quantities per single serving (recipeToLineItems scales
  // by recipe.persons), so we multiply on display.
  const [personCount, setPersonCount] = useState(1);

  useEffect(() => {
    if (!confirmModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        confirmModal.resolve(false);
        setConfirmModal(null);
      } else if (e.key === "Enter") {
        confirmModal.resolve(true);
        setConfirmModal(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmModal]);

  useEffect(() => {
    if (!planWarning) return;
    const t = setTimeout(() => setPlanWarning(null), 15000);
    return () => clearTimeout(t);
  }, [planWarning]);
  const [pinPopover, setPinPopover] = useState(null);
  const [dayPinMenu, setDayPinMenu] = useState(false);
  // eslint-disable-next-line
  const [suggestedSupplements, setSuggestedSupplements] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [supplementSnapshot, setSupplementSnapshot] = useState(null);
  // Phase 4/5: backend shopping list, delivery, supplement structure.
  const [shoppingList, setShoppingList] = useState({ items: [] });
  const [shoppingPrompt, setShoppingPrompt] = useState([]);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [fuelMomentSlot, setFuelMomentSlot] = useState(null);
  const [supplementSchedule, setSupplementSchedule] = useState({});

  // =
  useEffect(() => {
    fetchData();
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
    if (supplementIntake) {
      setSelectedSuplementType(supplementIntake.supplementOption);
      setSelectedSupplements(supplementIntake.recipes || []);
      setFuelMomentSlot(supplementIntake.fuelMomentSlot || null);
      const sched = {};
      (supplementIntake.schedule || []).forEach((s) => {
        sched[s.recipe] = {
          everyDay: s.everyDay !== false,
          days: s.days || [],
        };
      });
      setSupplementSchedule(sched);
    }
  }, []);

  // Load the WeekPlan from the backend whenever the week mode changes.
  // resetDay: only true on initial load / week switch — NOT after an
  // action (pin/swap/regenerate) so the user stays on the day they're
  // editing and sees the change apply in place.
  const loadPlan = async (resetDay = false, silent = false) => {
    if (!userInfo.id) return;
    const locale = localStorage.getItem("locale") || "english";
    if (!silent) setPlanLoading(true);
    try {
      const plan =
        weekMode === "next_week"
          ? await getNextWeek(userInfo.id, locale)
          : await getCurrentWeek(userInfo.id, locale);
      if (plan) {
        setWeekPlan(plan);
        setMealsForTheWeek(plan);
        if (resetDay) {
          const today = todayWeekday();
          if (plan.days && plan.days.some((d) => d.weekday === today)) {
            setCurrentDay(today);
          }
        }
      }
    } finally {
      if (!silent) setPlanLoading(false);
    }
  };

  useEffect(() => {
    loadPlan(true);
    loadShopping();
    loadDelivery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekMode, userInfo.id]);

  async function fetchData() {
    const res = await getAllDietTypes(
      localStorage.getItem("locale") || "english",
    );
    const rec = await getAllRecipes(localStorage.getItem("locale"));
    const allFavs = await getAllFavouriteRecipes(userInfo.id);
    allFavs && setFavRecipes(allFavs.favRecipes);

    setAllDiets(res.diets);
    setSuggestedSupplements(rec.recipes);
  }

  const WEEKDAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayWeekday = () => WEEKDAYS[new Date().getDay()];

  // Per-day metadata from the raw plan: date, past/today flags, day pin.
  const dayMeta = (weekday) => {
    const d =
      weekPlan && weekPlan.days
        ? weekPlan.days.find((x) => x.weekday === weekday)
        : null;
    if (!d) return { isPast: false, isToday: false, isDayPinned: false };
    const planDate = new Date(d.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    planDate.setHours(0, 0, 0, 0);
    return {
      date: d.date,
      isPast: weekMode === "this_week" && planDate < today,
      isToday:
        weekMode === "this_week" && planDate.getTime() === today.getTime(),
      isDayPinned: !!d.is_day_pinned,
    };
  };

  // Past days in This Week are read-only (client 2026-05-16). Swap is a
  // Next-Week-only action; pinning is allowed from either week.
  const isDayReadOnly = (weekday) => dayMeta(weekday).isPast;

  // Map the backend WeekPlan into the existing card shape: each meal slot
  // becomes a recipe-like object carrying slot/lock metadata.
  const setMealsForTheWeek = (plan) => {
    const obj = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    (plan.days || []).forEach((day) => {
      obj[day.weekday] = (day.meals || [])
        .filter((mlt) => mlt.recipe_id && mlt.recipe_id._id)
        .map((mlt) => ({
          ...mlt.recipe_id,
          foodType: mlt.meal_slot,
          _mealSlot: mlt.meal_slot,
          _lockType: mlt.lock_type,
          _pinId: mlt.pin_id,
          _pinMode: mlt.pin_mode || null,
          _weekday: day.weekday,
        }));
    });
    setMealsOfTheWeek(obj);
  };

  const findPin = (meal) =>
    meal && (meal._lockType === "recipe_pin" || meal._lockType === "day_pin");

  const openPinPopover = (e, meal) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDayReadOnly(currentDay)) {
      message.info(
        translate("userDashboard.nutrient.past_day_readonly") ||
          "Passed days are read-only.",
      );
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPinPopover((prev) =>
      prev && prev.recipeId === meal._id
        ? null
        : {
            rect,
            recipeId: meal._id,
            mealSlot: meal._mealSlot,
            pinId: meal._pinId,
            pinMode: meal._pinMode,
          },
    );
  };

  const confirmAsync = (content, opts = {}) =>
    new Promise((resolve) => {
      setConfirmModal({
        title: opts.title || null,
        content,
        okText: opts.okText || translate("userDashboard.nutrient.confirm_yes"),
        cancelText:
          opts.cancelText || translate("userDashboard.nutrient.confirm_no"),
        resolve,
      });
    });

  const handlePinSelect = async (mode) => {
    if (!pinPopover) return;
    const { recipeId, mealSlot, pinId, pinMode } = pinPopover;
    const slotKey = `${currentDay}|${mealSlot}`;
    // No-op if the user picked the mode that's already active — skip BE.
    if (mode !== null && mode === pinMode) {
      setPinPopover(null);
      return;
    }
    if (mode === null) {
      if (pinId) {
        setActionSlotKey(slotKey);
        try {
          await removeRecipePinApi(userInfo.id, pinId);
          setMealsOfTheWeek((prev) => {
            const next = { ...prev };
            next[currentDay] = (prev[currentDay] || []).map((m) =>
              m._mealSlot === mealSlot
                ? { ...m, _lockType: null, _pinId: null, _pinMode: null }
                : m,
            );
            return next;
          });
        } finally {
          setActionSlotKey(null);
        }
      }
    } else {
      // Spec §9 applies only when pinning FROM This Week (it targets Next
      // Week, so confirm + check the Next-Week slot for a conflict).
      // Pinning while already on Next Week edits it directly — no
      // confirm, no extra round-trip.
      if (weekMode === "this_week") {
        const ok = await confirmAsync(
          translate("userDashboard.nutrient.add_to_next_week_confirm") ||
            "Add this to your Next Week plan?",
        );
        if (!ok) {
          setPinPopover(null);
          return;
        }
        const nw = await getNextWeek(
          userInfo.id,
          localStorage.getItem("locale") || "english",
        );
        const nwSlot =
          nw &&
          nw.days &&
          (nw.days.find((d) => d.weekday === currentDay) || {}).meals;
        const target = nwSlot && nwSlot.find((s) => s.meal_slot === mealSlot);
        if (
          target &&
          (target.lock_type === "recipe_pin" ||
            target.lock_type === "day_pin" ||
            target.source === "swapped")
        ) {
          const ok2 = await confirmAsync(
            translate("userDashboard.nutrient.slot_conflict_confirm") ||
              "That slot in Next Week was already changed or pinned. Replace it?",
          );
          if (!ok2) {
            setPinPopover(null);
            return;
          }
        }
      }
      setActionSlotKey(slotKey);
      // Optimistic local update FIRST — show pin highlight immediately on
      // click rather than waiting for the BE round-trip. (On This Week the
      // pin targets Next Week, so the current view's slot doesn't change
      // — skip optimistic there.)
      if (weekMode === "next_week") {
        setMealsOfTheWeek((prev) => {
          const next = { ...prev };
          next[currentDay] = (prev[currentDay] || []).map((m) =>
            m._mealSlot === mealSlot
              ? {
                  ...m,
                  _lockType: "recipe_pin",
                  _pinMode: mode,
                }
              : m,
          );
          return next;
        });
      }
      const savedPin = await pinRecipeApi(userInfo.id, {
        recipe_id: recipeId,
        weekday: currentDay,
        meal_slot: mealSlot,
        mode,
        source_week_type: weekMode,
      });
      if (savedPin && weekMode === "next_week") {
        setMealsOfTheWeek((prev) => {
          const next = { ...prev };
          next[currentDay] = (prev[currentDay] || []).map((m) =>
            m._mealSlot === mealSlot ? { ...m, _pinId: savedPin._id } : m,
          );
          return next;
        });
      }
      message.success(
        mode === "always"
          ? translate("userDashboard.nutrient.pin_saved_always") ||
              "Pinned weekly"
          : translate("userDashboard.nutrient.pin_saved_once") ||
              "Pinned for next week",
      );
    }
    setPinPopover(null);
    try {
      await loadPlan(false, true);
    } finally {
      setActionSlotKey(null);
    }
  };

  const swapRecipe = async (meal) => {
    if (weekMode !== "next_week") {
      message.info(
        translate("userDashboard.nutrient.swap_next_only") ||
          "Swapping is only available on Next Week.",
      );
      return;
    }
    if (findPin(meal)) {
      message.warning(
        translate("userDashboard.nutrient.swap_pinned_blocked") ||
          "The recipe is pinned. Unpin it to swap.",
      );
      return;
    }
    const slotKey = `${currentDay}|${meal._mealSlot}`;
    setActionSlotKey(slotKey);
    try {
      const r = await swapMealApi(userInfo.id, currentDay, meal._mealSlot);
      if (r.ok) {
        message.success(translate("userDashboard.nutrient.recipe_swapped"));
        await loadPlan(false, true);
      } else if (r.conflict) {
        message.warning(r.message);
      } else if (r.message) {
        message.info(r.message);
      } else {
        message.error(
          translate("userDashboard.nutrient.swap_failed") ||
            "Unable to swap recipe",
        );
      }
    } finally {
      setActionSlotKey(null);
    }
  };

  const handleRegenerate = async () => {
    if (weekMode !== "next_week") return;
    if (regenerating) return;
    setRegenerating(true);
    try {
      const res = await regenerateNextWeek(
        userInfo.id,
        localStorage.getItem("locale") || "english",
      );
      if (res) {
        setPlanWarning(res.warning || null);
        message.success(
          translate("userDashboard.nutrient.week_regenerated") ||
            "Next week regenerated",
        );
        await loadPlan();
      }
    } finally {
      setRegenerating(false);
    }
  };

  // ---- Day pin (locks the exact recipes visible that day) ----

  const currentDayDoc = () =>
    weekPlan && weekPlan.days
      ? weekPlan.days.find((d) => d.weekday === currentDay)
      : null;

  const handleDayPin = async (mode) => {
    setDayPinMenu(false);
    const meals = mealsOfTheWeek[currentDay] || [];
    const locked_meals = meals
      .filter((mlt) => mlt._mealSlot && mlt._id)
      .map((mlt) => ({ meal_slot: mlt._mealSlot, recipe_id: mlt._id }));
    if (!locked_meals.length) {
      message.warning(
        translate("userDashboard.nutrient.nothing_to_pin") ||
          "Nothing to pin on this day yet.",
      );
      return;
    }
    await pinDayApi(userInfo.id, {
      weekday: currentDay,
      locked_meals,
      mode,
      source_week_type: weekMode,
    });
    message.success(
      translate("userDashboard.nutrient.day_pinned") || "Day pinned",
    );
    await loadPlan();
  };

  const handleRemoveDayPin = async () => {
    const d = currentDayDoc();
    if (!d || !d.day_pin_id) return;
    await removeDayPinApi(userInfo.id, d.day_pin_id);
    message.success(
      translate("userDashboard.nutrient.day_unpinned") || "Day unpinned",
    );
    await loadPlan();
  };

  useEffect(() => {
    localStorage.setItem("currentDay", currentDay);
  }, [currentDay]);
  const unfouriteReceipe = async (id) => {
    await unFavouriteRecipeById({ recipeId: id }, userInfo.id);
    setFavRecipes((prev) => prev.filter((r) => r._id !== id));
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

  // A meal-structure / restriction change that touches pinned content
  // must confirm before silently breaking pins (client 2026-05-16).
  // Returns true to proceed, false to abort.
  async function confirmPinInvalidation() {
    const c = await getPinCount(userInfo.id);
    if (!c || !c.total) return true;
    const ok = await confirmAsync(
      translate("userDashboard.nutrient.pins_affected_confirm") ||
        "This change affects one or more pinned days or recipes. Continue and remove the affected pin(s)?",
    );
    if (!ok) return false;
    await invalidatePins(userInfo.id, "settings_change");
    return true;
  }

  async function saveUserSupplementSettings() {
    if (selectedSuplementType !== "none") {
      if (selectedSupplements.length < 2) {
        message.warning(translate("userDashboard.nutrient.min_supplements"));
        return;
      }
    }
    if (!(await confirmPinInvalidation())) return;
    await createCustomerDetails(
      {
        supplementIntake: {
          supplementOption: selectedSuplementType,
          recipes: selectedSuplementType === "none" ? [] : selectedSupplements,
          // Fuel Moment (during-the-day) replaces a user-chosen snack.
          fuelMomentSlot:
            selectedSuplementType === "during-the-day" ? fuelMomentSlot : null,
          // Per-supplement day scheduling (not one global set).
          schedule:
            selectedSuplementType === "none"
              ? []
              : selectedSupplements.map((s) => {
                  const sc = supplementSchedule[s._id] || {};
                  return {
                    recipe: s._id,
                    everyDay: sc.everyDay !== false,
                    days: sc.everyDay === false ? sc.days || [] : [],
                  };
                }),
        },
      },
      userInfo.id,
    );
    getUserDetails();
    loadPlan();
    setSuplementModal(false);
  }

  async function saveUserDietSetup() {
    if (!selectedDiet) {
      message.warning(translate("userDashboard.nutrient.select_diet"));
      return;
    }
    if (!(await confirmPinInvalidation())) return;
    const res = await createCustomerDetails(
      { myDiet: [selectedDiet] },
      userInfo.id,
    );
    if (res) {
      message.success(translate("userDashboard.nutrient.diet_saved"));
      getUserDetails();
      loadPlan();
      setDietSetupModal(false);
    } else {
      message.error(translate("userDashboard.nutrient.diet_save_failed"));
    }
  }

  // Late Meal is its own meal-structure setting (separate from supplement
  // mode, coexists with any of them — client 2026-05-16).
  async function saveUserEatingLateSetting() {
    if (!(await confirmPinInvalidation())) return;
    const next = !eatingBehave.eatingLate;
    setEatingBehave({ ...eatingBehave, eatingLate: next });
    await createCustomerDetails({ lateMeal: next }, userInfo.id);
    getUserDetails();
    loadPlan();
  }

  // ---- Shopping list (backend ShoppingList, itemId+unit aggregated) ----

  const loadShopping = async () => {
    if (!userInfo.id) return;
    const list = await getShoppingList(userInfo.id);
    setShoppingList(list || { items: [] });
  };

  const loadDelivery = async () => {
    if (!userInfo.id) return;
    setDeliveryStatus(await getDeliveryStatus(userInfo.id));
  };

  const addToShoppingCart = async (day, meal) => {
    const res = await addRecipeToShopping(userInfo.id, meal._id);
    if (!res) return;
    setShoppingList(res.list || { items: [] });
    setShoppingPrompt(res.prompt || []);
    const added = res.added || { pushed: 0, merged: 0, emitted: 0 };
    if (res.prompt && res.prompt.length) {
      message.info(
        translate("userDashboard.nutrient.some_items_previously_removed") ||
          "Some ingredients you removed earlier are needed again — review below.",
      );
    } else if (added.emitted === 0) {
      message.warning(
        translate("userDashboard.nutrient.recipe_no_items") ||
          "This recipe has no ingredients with quantities to add.",
      );
    } else if (added.pushed === 0 && added.merged > 0) {
      message.info(
        translate("userDashboard.nutrient.shopping_qty_updated") ||
          `Already in your list — updated ${added.merged} quantit${
            added.merged === 1 ? "y" : "ies"
          }.`,
      );
    } else {
      message.success(
        translate("userDashboard.nutrient.added_to_cart") ||
          `Added ${added.pushed} item${added.pushed === 1 ? "" : "s"}`,
      );
    }
  };

  const handleRemoveRecipeFromShopping = async (recipeId) => {
    if (!recipeId) return;
    const list = await removeRecipeFromShopping(userInfo.id, recipeId);
    if (list) setShoppingList(list);
  };

  // Full-week add — Next Week only (client 2026-05-16).
  const handleSyncWeek = async () => {
    if (weekMode !== "next_week") return;
    const res = await syncWeekShopping(userInfo.id);
    if (!res) return;
    setShoppingList(res.list || { items: [] });
    setShoppingPrompt(res.prompt || []);
    await loadPlan(); // shopping_sync_status -> synced
    message.success(
      translate("userDashboard.nutrient.shopping_updated") ||
        "Shopping list updated",
    );
  };

  const mutateShoppingItem = async (payload) => {
    const list = await updateShoppingItem(userInfo.id, payload);
    if (list) setShoppingList(list);
  };

  const reAddShoppingItem = async (p) => {
    await mutateShoppingItem({
      itemId: p.itemId,
      unit: p.unit,
      quantity: p.quantity,
      readd: true,
    });
    setShoppingPrompt((prev) =>
      prev.filter((x) => !(x.itemId === p.itemId && x.unit === p.unit)),
    );
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
        {selectedSuplementType === "during-the-day" && (
          <div style={{ margin: "12px 0" }}>
            <span className="font-paragraph-white">
              <T>userDashboard.nutrient.fuel_moment_replaces</T>
            </span>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {["morningSnack", "afternoonSnack"].map((slot) => (
                <button
                  key={slot}
                  className="font-paragraph-white"
                  onClick={() => setFuelMomentSlot(slot)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-orange)",
                    background:
                      fuelMomentSlot === slot
                        ? "var(--color-orange)"
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <T>{`mealType.${slot}`}</T>
                </button>
              ))}
            </div>
          </div>
        )}
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
                  {/* Per-supplement day scheduling (not one global set) */}
                  <div style={{ marginTop: "10px" }}>
                    <Checkbox
                      checked={
                        (supplementSchedule[meal._id] || {}).everyDay !== false
                      }
                      onChange={(e) =>
                        setSupplementSchedule((prev) => ({
                          ...prev,
                          [meal._id]: {
                            everyDay: e.target.checked,
                            days: (prev[meal._id] || {}).days || [],
                          },
                        }))
                      }
                    >
                      <span className="font-paragraph-white">
                        <T>userDashboard.nutrient.every_day</T>
                      </span>
                    </Checkbox>
                    {(supplementSchedule[meal._id] || {}).everyDay ===
                      false && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          marginTop: "6px",
                        }}
                      >
                        {[
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                          "sunday",
                        ].map((d) => {
                          const sc = supplementSchedule[meal._id] || {
                            days: [],
                          };
                          const on = (sc.days || []).includes(d);
                          return (
                            <button
                              key={d}
                              className="font-paragraph-white"
                              onClick={() =>
                                setSupplementSchedule((prev) => {
                                  const cur = prev[meal._id] || {
                                    everyDay: false,
                                    days: [],
                                  };
                                  const days = on
                                    ? cur.days.filter((x) => x !== d)
                                    : [...(cur.days || []), d];
                                  return {
                                    ...prev,
                                    [meal._id]: { everyDay: false, days },
                                  };
                                })
                              }
                              style={{
                                padding: "3px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--color-orange)",
                                background: on
                                  ? "var(--color-orange)"
                                  : "transparent",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                              }}
                            >
                              <T>{`userDashboard.nutrient.${d}`}</T>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px" }}>
              <h3 className="font-card-heading">
                <T>userDashboard.nutrient.selectPi</T>
              </h3>
              <div className="divider"></div>
              <div
                className="selected-meals-container"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {suggestedSupplements
                  .filter(
                    (meal) =>
                      !selectedSupplements.some((s) => s._id === meal._id),
                  )
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
                            message.warning(
                              translate(
                                "userDashboard.nutrient.max_supplements",
                              ),
                            );
                            return;
                          }
                          setSelectedSupplements([
                            ...selectedSupplements,
                            meal,
                          ]);
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
                    <span>
                      <T>userDashboard.nutrient.eating_late</T>
                    </span>
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
                    <span>
                      <T>userDashboard.nutrient.supplement_options</T>
                    </span>
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
                    <span>
                      <T>userDashboard.nutrient.my_diet_setup</T>
                    </span>
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

          <div
            style={{
              marginBottom: "10px",
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setWeekMode("this_week")}
              className={
                weekMode === "this_week"
                  ? "common-orange-button font-paragraph-white"
                  : "common-transparent-button font-paragraph-white"
              }
            >
              <T>userDashboard.nutrient.current_week</T>
            </button>
            <button
              type="button"
              onClick={() => setWeekMode("next_week")}
              className={
                weekMode === "next_week"
                  ? "common-orange-button font-paragraph-white"
                  : "common-transparent-button font-paragraph-white"
              }
            >
              <T>userDashboard.nutrient.next_week</T>
            </button>
          </div>
        </div>
        {weekMode === "next_week" &&
          localStorage.getItem("userRecentlySignedUp") === "true" &&
          [0, 4, 5, 6].includes(new Date().getDay()) && (
            <div
              className="font-paragraph-white"
              style={{
                background: "rgba(243,119,32,0.15)",
                border: "1px solid var(--color-orange)",
                borderRadius: "6px",
                padding: "10px 14px",
                margin: "10px 0",
              }}
            >
              <T>userDashboard.nutrient.first_plan_starts_monday</T>
            </div>
          )}
        {planWarning && weekMode === "next_week" && (
          <div
            className="font-paragraph-white"
            style={{
              background: "rgba(243,119,32,0.15)",
              border: "1px solid var(--color-orange)",
              borderRadius: "6px",
              padding: "10px 14px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span style={{ flex: 1 }}>{planWarning}</span>
            <button
              type="button"
              onClick={() => setPlanWarning(null)}
              aria-label="Dismiss"
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: "0 4px",
              }}
            >
              <CloseSquareFilled style={{ color: "var(--color-orange)" }} />
            </button>
          </div>
        )}

        <div className="dashboard-nutrient-row2-container-days font-paragraph-whites">
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((day) => {
            const meta = dayMeta(day);
            return (
              <span
                key={day}
                className="dashboard-nutrient-row2-container-day font-paragraph-white"
                title={meta.isPast ? "Passed day (read-only)" : ""}
                style={{
                  color:
                    currentDay === day
                      ? "var(--color-orange)"
                      : meta.isToday
                        ? "#fff"
                        : "#677182",
                  opacity: meta.isPast ? 0.45 : 1,
                  fontWeight: meta.isToday ? 700 : 400,
                  position: "relative",
                }}
                onClick={() => setCurrentDay(day)}
              >
                <T>{`userDashboard.nutrient.${day}`}</T>
                {meta.isDayPinned && (
                  <img
                    src={pin}
                    alt="pinned"
                    height="11px"
                    style={{ marginLeft: "4px" }}
                  />
                )}
              </span>
            );
          })}
        </div>

        {weekMode === "next_week" && !isDayReadOnly(currentDay) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 0",
              flexWrap: "wrap",
            }}
          >
            {dayMeta(currentDay).isDayPinned ? (
              <button
                className="font-paragraph-white"
                onClick={handleRemoveDayPin}
                style={{
                  padding: "5px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-orange)",
                  background: "var(--color-orange)",
                  cursor: "pointer",
                }}
              >
                <T>userDashboard.nutrient.unpin_day</T>
              </button>
            ) : !dayPinMenu ? (
              <button
                className="font-paragraph-white"
                onClick={() => setDayPinMenu(true)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-orange)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={GrayPin}
                  alt=""
                  height="13px"
                  style={{ marginRight: "6px" }}
                />
                <T>userDashboard.nutrient.pin_this_day</T>
              </button>
            ) : (
              <>
                <span className="font-paragraph-white" style={{ opacity: 0.8 }}>
                  <T>userDashboard.nutrient.pin_day_as</T>
                </span>
                <button
                  className="font-paragraph-white"
                  onClick={() => handleDayPin("just_once")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-orange)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <T>userDashboard.nutrient.pin_just_once</T>
                </button>
                <button
                  className="font-paragraph-white"
                  onClick={() => handleDayPin("always")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-orange)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <T>userDashboard.nutrient.pin_always</T>
                </button>
                <button
                  className="font-paragraph-white"
                  onClick={() => setDayPinMenu(false)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid #677182",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <T>userDashboard.nutrient.cancel</T>
                </button>
              </>
            )}
          </div>
        )}

        <div className="divider"></div>
        <div className="dashboard-nutrient-row2-container">
          <Carousel responsive={responsive}>
            {planLoading ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  className="dashboard-nutrient-row2-container-card"
                  key={`skeleton-${i}`}
                >
                  <div
                    className="rc-skeleton-block"
                    style={{ height: "200px" }}
                  />
                  <div
                    className="rc-skeleton-block"
                    style={{
                      height: "16px",
                      width: "70px",
                      margin: "12px 0 8px",
                    }}
                  />
                  <div
                    className="rc-skeleton-block"
                    style={{ height: "22px", width: "75%", margin: "6px 0" }}
                  />
                  <div
                    className="rc-skeleton-block"
                    style={{
                      height: "12px",
                      width: "95%",
                      margin: "8px 0 4px",
                    }}
                  />
                  <div
                    className="rc-skeleton-block"
                    style={{ height: "12px", width: "80%", margin: "0 0 12px" }}
                  />
                  <div className="rc-skeleton-card-buttons">
                    <div
                      className="rc-skeleton-block"
                      style={{ height: "26px" }}
                    />
                    <div
                      className="rc-skeleton-block"
                      style={{ height: "26px" }}
                    />
                    <div
                      className="rc-skeleton-block"
                      style={{ height: "26px" }}
                    />
                    <div
                      className="rc-skeleton-block"
                      style={{ height: "26px" }}
                    />
                  </div>
                </div>
              ))
            ) : mealsOfTheWeek[currentDay].length > 0 ? (
              mealsOfTheWeek[currentDay].map((meal) => {
                const mealPin = findPin(meal);
                const readOnly = isDayReadOnly(currentDay);
                const cardLoading =
                  actionSlotKey === `${currentDay}|${meal._mealSlot}`;
                return (
                  <div
                    className="dashboard-nutrient-row2-container-card"
                    style={{
                      border: mealPin ? "3px solid #f37720" : "",
                      opacity: readOnly ? 0.55 : 1,
                      position: "relative",
                    }}
                    key={meal._id}
                  >
                    {cardLoading && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.55)",
                          borderRadius: "inherit",
                          zIndex: 5,
                        }}
                      >
                        <LoadingOutlined
                          style={{ fontSize: "40px", color: "#fff" }}
                          spin
                        />
                      </div>
                    )}
                    <Link to={`/recipe/${slug(meal.name)}/${meal._id}`}>
                      <div
                        style={{
                          background: meal.image
                            ? `url(${meal.image.replaceAll(" ", "%20")}) center center / cover`
                            : "var(--color-gray-dark)",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          height: "200px",
                        }}
                      ></div>
                      <div className="dashboard-nutrient-row2-container-card-bob font-paragraph-black">
                        {formatMealSlot(meal.foodType)}
                      </div>
                      <div className="dashboard-nutrient-row2-container-card-heading font-paragraph-white">
                        {meal.name}
                      </div>
                      <div className="dashboard-nutrient-row2-container-card-about font-paragraph-white">
                        {stripHtml(meal.description)}
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
                        style={{
                          cursor: readOnly ? "not-allowed" : "pointer",
                          textAlign: "center",
                          opacity: readOnly ? 0.4 : 1,
                        }}
                        onClick={(e) => openPinPopover(e, meal)}
                      >
                        <img
                          src={mealPin ? pin : GrayPin}
                          alt=""
                          height="16px"
                        />
                      </div>
                      {weekMode === "next_week" && (
                        <div
                          style={{ cursor: "pointer", textAlign: "center" }}
                          onClick={() => swapRecipe(meal)}
                        >
                          <img src={SwapIcon} alt="" height="16px" />
                        </div>
                      )}
                      <button
                        className="font-paragraph-white"
                        onClick={() => addToShoppingCart(currentDay, meal)}
                      >
                        <PlusOutlined style={{ color: "#fff" }} />
                        <T>userDashboard.nutrient.atsl</T>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  margin: "50px 0",
                }}
              >
                <h3 className="font-paragraph-white">
                  {userProfile.myDiet && userProfile.supplementIntake ? (
                    <T>userDashboard.nutrient.no_recipes_found</T>
                  ) : (
                    <T>userDashboard.nutrient.complete_diet_setup</T>
                  )}
                </h3>
              </div>
            )}
          </Carousel>
        </div>
        {weekMode === "next_week" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={handleSyncWeek}
              style={{
                background: "#1F5A2C",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 22px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PlusOutlined style={{ color: "#fff", fontSize: "16px" }} />
              <T>userDashboard.nutrient.add_week_to_shopping</T>
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                background: "#4F2A31",
                color: "#FF6C6C",
                border: "none",
                borderRadius: "6px",
                padding: "10px 22px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: regenerating ? "not-allowed" : "pointer",
                opacity: regenerating ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <SwapOutlined style={{ color: "#FF6C6C", fontSize: "16px" }} />
              {regenerating ? (
                <T>userDashboard.nutrient.regenerating</T>
              ) : (
                <T>userDashboard.nutrient.regenerate_week</T>
              )}
            </button>
          </div>
        )}
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
        <div
          className="dashboard-challenges-mychallenge-heading font-card-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span>
            <T>userDashboard.nutrient.mysl</T>
          </span>
          {/* "Update shopping list" full-week sync button — hidden for now.
              Uncomment to restore full-week shopping sync UX. */}
          {/* {weekMode === "next_week" && (
            <button
              className="font-paragraph-white"
              onClick={handleSyncWeek}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "1px solid var(--color-orange)",
                background: "var(--color-orange)",
                cursor: "pointer",
              }}
            >
              <T>userDashboard.nutrient.update_shopping_list</T>
            </button>
          )} */}
        </div>
        <div className="divider"></div>

        {weekPlan && weekPlan.shopping_sync_status === "needs_update" && (
          <div
            className="font-paragraph-white"
            style={{
              background: "rgba(243,119,32,0.15)",
              border: "1px solid var(--color-orange)",
              borderRadius: "6px",
              padding: "10px 14px",
              margin: "10px 0",
            }}
          >
            <T>userDashboard.nutrient.shopping_needs_update</T>
          </div>
        )}

        {shoppingPrompt.length > 0 && (
          <div
            className="font-paragraph-white"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px dashed var(--color-orange)",
              borderRadius: "6px",
              padding: "10px 14px",
              margin: "10px 0",
            }}
          >
            <div style={{ marginBottom: "6px" }}>
              <T>userDashboard.nutrient.previously_removed_prompt</T>
            </div>
            {shoppingPrompt.map((p, i) => (
              <div
                key={`${p.itemId}-${p.unit}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "3px 0",
                }}
              >
                <span style={{ textTransform: "capitalize", flex: 1 }}>
                  {p.name ||
                    translate("userDashboard.nutrient.ingredient_fallback") ||
                    "ingredient"}
                </span>
                <span>
                  {p.quantity} {p.unit}
                </span>
                <button
                  className="font-paragraph-white"
                  style={{
                    cursor: "pointer",
                    border: "1px solid #677182",
                    borderRadius: "4px",
                    padding: "2px 10px",
                    background: "transparent",
                  }}
                  onClick={() => reAddShoppingItem(p)}
                >
                  <T>userDashboard.nutrient.add_back</T>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-nutrient-row3-container">
          <div
            className="dashboard-nutrient-row3-container-ingredientsSummary"
            style={{ width: "100%" }}
          >
            <div
              className="font-paragraph-white"
              style={{ fontSize: "14px", marginBottom: "8px" }}
            >
              <T>userDashboard.nutrient.selected_recipes</T>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {Array.isArray(shoppingList.selectedRecipes) &&
              shoppingList.selectedRecipes.length > 0 ? (
                shoppingList.selectedRecipes.map((r, i) => {
                  const rid = r && (r._id || r);
                  return (
                    <span
                      key={rid || i}
                      style={{
                        padding: "2px 8px",
                        background: "#f3782046",
                        color: "#F37720",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ padding: "6px 10px 6px 0" }}>
                        {(r && r.name) ||
                          translate("userDashboard.nutrient.recipe_fallback") ||
                          "Recipe"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipeFromShopping(rid)}
                        aria-label="Remove recipe"
                        title={
                          translate("userDashboard.nutrient.remove_recipe") ||
                          "Remove recipe"
                        }
                        style={{
                          background: "#F37720",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CloseOutlined />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span
                  className="font-paragraph-white"
                  style={{ opacity: 0.6, fontSize: "14px" }}
                >
                  <T>userDashboard.nutrient.no_selected_recipes</T>
                </span>
              )}
            </div>
            <div
              className="font-paragraph-white"
              style={{
                fontSize: "14px",
                marginTop: "20px",
                marginBottom: "10px",
              }}
            >
              <T>userDashboard.nutrient.ingres</T>
            </div>
            <div className="dashboard-nutrient-row3-container-ingredientsSummary-container">
              {(() => {
                const visible = (shoppingList.items || []).filter(
                  (i) => !i.removedByUser,
                );
                if (visible.length === 0) {
                  return (
                    <div
                      className="font-paragraph-white"
                      style={{ opacity: 0.6, padding: "10px 0" }}
                    >
                      <T>userDashboard.nutrient.no_ingredients</T>
                    </div>
                  );
                }
                const regular = visible.filter((i) => !i.isSupplement);
                const supplements = visible.filter((i) => i.isSupplement);
                const renderRow = (it, idx) => (
                  <div
                    key={`${it.itemId && (it.itemId._id || it.itemId)}-${it.unit}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#171E27",
                      padding: "16px 16px",
                      marginBottom: "12px",
                      color: "#8083A0",
                      fontSize: "15px",
                    }}
                  >
                    <span style={{ textTransform: "capitalize", flex: 1 }}>
                      {(it.itemId && it.itemId.name) || "ingredient"}
                    </span>
                    <span>
                      {formatShoppingQty(it.quantity * personCount, it.unit)}
                    </span>
                  </div>
                );
                return (
                  <>
                    {regular.map(renderRow)}
                    {supplements.length > 0 && (
                      <>
                        <div
                          className="font-paragraph-white"
                          style={{
                            fontSize: "14px",
                            marginTop: regular.length > 0 ? "16px" : "0",
                            marginBottom: "10px",
                            opacity: 0.8,
                          }}
                        >
                          <T>userDashboard.nutrient.supplements</T>
                        </div>
                        {supplements.map(renderRow)}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #1F5A2C",
                  borderRadius: "4px",
                  background: "#1F5A2C",
                  color: "#fff",
                  fontSize: "14px",
                  overflow: "hidden",
                }}
              >
                <span style={{ padding: "8px 12px" }}>
                  <T>userDashboard.nutrient.add_persons</T>
                </span>
                <button
                  type="button"
                  onClick={() => setPersonCount((c) => Math.max(1, c - 1))}
                  aria-label="Decrease persons"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: personCount <= 1 ? "not-allowed" : "pointer",
                    opacity: personCount <= 1 ? 0.5 : 1,
                    padding: "8px 10px",
                    fontSize: "16px",
                    lineHeight: 1,
                  }}
                  disabled={personCount <= 1}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: "20px",
                    textAlign: "center",
                    padding: "8px 4px",
                  }}
                >
                  {personCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPersonCount((c) => c + 1)}
                  aria-label="Increase persons"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "8px 10px",
                    fontSize: "16px",
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                title={
                  deliveryStatus && deliveryStatus.firstDeliverableWeekId
                    ? `First deliverable week: ${deliveryStatus.firstDeliverableWeekId}`
                    : ""
                }
                onClick={() =>
                  message.info(
                    translate(
                      "userDashboard.nutrient.order_groceries_coming_soon",
                    ) || "Ordering coming soon",
                  )
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#53D470",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: "16px" }} />
                <T>userDashboard.nutrient.order_grocery_list</T>
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
      {pinPopover && (
        <PinPopover
          anchorRect={pinPopover.rect}
          currentMode={pinPopover.pinMode || null}
          onSelect={handlePinSelect}
          onClose={() => setPinPopover(null)}
        />
      )}
      {confirmModal && (
        <div
          onClick={() => {
            confirmModal.resolve(false);
            setConfirmModal(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--mirage, #1a222d)",
              border: "1px solid var(--color-orange, #f37720)",
              borderRadius: "10px",
              padding: "24px",
              width: "min(440px, 92vw)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
              color: "#fff",
            }}
          >
            {confirmModal.title && (
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                {confirmModal.title}
              </div>
            )}
            <div
              style={{
                fontSize: "15px",
                lineHeight: 1.5,
                marginBottom: "20px",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {confirmModal.content}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  confirmModal.resolve(false);
                  setConfirmModal(null);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "1px solid #677182",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.resolve(true);
                  setConfirmModal(null);
                }}
                autoFocus
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-orange, #f37720)",
                  background: "var(--color-orange, #f37720)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {confirmModal.okText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Nutrient;
