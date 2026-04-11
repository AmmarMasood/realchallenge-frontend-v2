import React, { useState, useEffect, useContext, useRef } from "react";
import "../../../../assets/creatorprofile.css";
import "../../../../assets/home.css";
import "../../../../assets/challengeProfile.css";
import "../../../../assets/recipeProfile.css";
import "../../../../assets/adminDashboardV2.css";
import Navbar from "../../../../components/Navbar";
import {
  LoadingOutlined,
  DeleteFilled,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { withRouter, Prompt } from "react-router-dom";
import {
  Tooltip,
  Modal,
  Input,
  Button,
  List,
  Checkbox,
  notification,
} from "antd";
import { userInfoContext } from "../../../../contexts/UserStore";
import { T } from "../../../../components/Translate";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import { get } from "lodash";
import { useRemoteMediaManager } from "../../../../contexts/RemoteMediaManagerContext";
import AddNewButton from "../Challenge/AddNewButton";
import EditTypeName from "../../RecipeManager/EditTypeName";
import { useRecipe } from "../../../../contexts/RecipeCreatorV2";
import { v4 } from "uuid";
import {
  createRecipe,
  updateRecipe,
  getRecipeById,
  getAllMealTypes,
  getAllFoodTypes,
  getAllDietTypes,
  getAllIngredients,
  createMealType,
  removeMealType,
  createFoodType,
  removeFoodType,
  createDiet,
  removeDiet,
  createIngredient,
  removeIngredient,
  getAllUserRecipes,
  getRecipeTranslationsByKey,
  acquireRecipeLock,
  releaseRecipeLock,
  renewRecipeLock,
} from "../../../../services/recipes";
import { useBrowserEvents } from "../../../../helpers/useBrowserEvents";
import { hasAnyRole } from "../../../../helpers/roleHelpers";
import setAuthToken from "../../../../helpers/setAuthToken";
import TextEditor from "../../../../components/TextEditor";
import ProteinIcon from "../../../../assets/icons/protein_icon.svg";
import FatIcon from "../../../../assets/icons/fat_Icon.svg";
import CarbIcon from "../../../../assets/icons/carb_icon.svg";
import FiberIcon from "../../../../assets/icons/fiber_icon.svg";
import TipIcon from "../../../../assets/icons/tip_icon.svg";
import NoteIcon from "../../../../assets/icons/note_icon.svg";
import ChallengeLockModal from "../../../Common/ChallengeLockModal";

function BasicInformation(props) {
  const { language, strings } = useContext(LanguageContext);
  const [userInfo] = useContext(userInfoContext);
  const [isUpdate, setIsUpdate] = useState(false);
  const {
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
  } = useRecipe();

  const {
    setMediaManagerVisible,
    setMediaManagerType,
    setMediaManagerActions,
  } = useRemoteMediaManager();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState({});

  // Edit/update modals
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  // Create new modals
  const [mealTypeModal, setMealTypeModal] = useState(false);
  const [newMealType, setNewMealType] = useState("");
  const [foodTypeModal, setFoodTypeModal] = useState(false);
  const [newFoodType, setNewFoodType] = useState("");
  const [dietModal, setDietModal] = useState(false);
  const [newDiet, setNewDiet] = useState("");
  const [ingredientModal, setIngredientModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  // Translation support
  const [allRecipesFromOtherLanguage, setAllRecipesFromOtherLanguage] =
    useState([]);
  const [sameLanguageTranslationKeys, setSameLanguageTranslationKeys] =
    useState(new Set());
  const [selectedRecipeForTranslation, setSelectedRecipeForTranslation] =
    useState("");
  const [translationKey, setTranslationKey] = useState(null);
  const [translationDropdownOpen, setTranslationDropdownOpen] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");
  const [translationLinkDirty, setTranslationLinkDirty] = useState(false);
  const translationDropdownRef = useRef(null);

  // Edit lock
  const [editLockBlocked, setEditLockBlocked] = useState(false);
  const [editLockDetails, setEditLockDetails] = useState(null);

  // Allows programmatic navigation (save, unauthorized redirect) to bypass <Prompt>
  const allowNavigationRef = useRef(false);

  // Dirty tracking: only block navigation when the user has actually edited something
  const [isDirty, setIsDirty] = useState(false);
  const dirtyTrackingReadyRef = useRef(false);

  // Store recipe's original language
  const [recipeLanguage, setRecipeLanguage] = useState(null);
  const [isFirstRender, setIsFirstRender] = useState(false);

  const { reloadWithoutConfirmation } = useBrowserEvents({
    enableBeforeUnloadConfirm: !editLockBlocked && isDirty,
    hasUnsavedChanges: !editLockBlocked && isDirty,
    backForwardMessage: get(
      strings,
      "recipeStudio.unsaved_changes_warning",
      "You have unsaved changes in this recipe. Are you sure you want to leave?",
    ),
    confirmMessage: get(
      strings,
      "recipeStudio.unsaved_work_lost",
      "Any unsaved work will be lost. Continue?",
    ),
  });

  // Enable dirty tracking once the initial data has settled into form state.
  // Deferred via setTimeout so it runs after the populate-triggered renders,
  // preventing the populate itself from being treated as a user edit.
  useEffect(() => {
    const hasRecipeId = Boolean(props.match.params.recipeId);
    const initialLoadDone = hasRecipeId ? isFirstRender : dataLoaded;
    if (!initialLoadDone) return;
    const id = setTimeout(() => {
      dirtyTrackingReadyRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, [dataLoaded, isFirstRender, props.match.params.recipeId]);

  // Mark form as dirty on any form-field change after tracking is enabled
  useEffect(() => {
    if (!dirtyTrackingReadyRef.current) return;
    setIsDirty(true);
  }, [
    recipeName,
    recipeDescription,
    featuredImage,
    prepTime,
    persons,
    kCalPerPerson,
    saturationIndex,
    protein,
    carbohydrate,
    fat,
    fiber,
    selectedMealTypes,
    selectedFoodTypes,
    selectedDiet,
    ingredients,
    cookingProcess,
    notes,
    tips,
    isPublic,
    adminApproved,
    allowComments,
    allowReviews,
  ]);

  // ── Data fetching ──
  const fetchDataV2 = async (effectiveLanguage) => {
    setAuthToken(localStorage.getItem("jwtToken"));
    setLoading(true);
    const langToUse = effectiveLanguage || language;

    const [mealTypesRes, foodTypesRes, dietTypesRes, ingredientsRes] =
      await Promise.all([
        getAllMealTypes(langToUse),
        getAllFoodTypes(langToUse),
        getAllDietTypes(langToUse),
        getAllIngredients(langToUse),
      ]);

    setAllMealTypes(mealTypesRes?.mealTypes || []);
    setAllFoodTypes(foodTypesRes?.foodTypes || []);
    setAllDiets(dietTypesRes?.diets || []);
    setAllIngredients(ingredientsRes?.ingredients || []);

    // Fetch recipes from other language for translation linking
    const otherLanguage = langToUse === "dutch" ? "english" : "dutch";
    const currentId = props.match.params.recipeId;
    const [recipesFromOtherLang, recipesFromSameLang] = await Promise.all([
      getAllUserRecipes(otherLanguage),
      getAllUserRecipes(langToUse),
    ]);

    setAllRecipesFromOtherLanguage(
      (recipesFromOtherLang?.recipes || []).filter((r) => r._id !== currentId),
    );
    const sameLangKeys = new Set(
      (recipesFromSameLang?.recipes || [])
        .filter((r) => r._id !== currentId && r.translationKey)
        .map((r) => r.translationKey),
    );
    setSameLanguageTranslationKeys(sameLangKeys);

    setDataLoaded(true);
    setLoading(false);
  };

  // Translation selection handler
  const handleSelectRecipeForTranslation = (recipeId, isUserAction = true) => {
    setSelectedRecipeForTranslation(recipeId);
    if (isUserAction) {
      setTranslationLinkDirty(true);
    }
    if (recipeId) {
      const recipe = allRecipesFromOtherLanguage.find(
        (r) => r._id === recipeId,
      );
      if (recipe && recipe.translationKey) {
        setTranslationKey(recipe.translationKey);
      } else if (isUserAction) {
        setTranslationKey(null);
      }
    } else if (isUserAction) {
      setTranslationKey("__unlink__");
    }
  };

  // Load recipe data when editing
  useEffect(() => {
    if (dataLoaded && props.match.params.recipeId) {
      setIsUpdate(true);
    }
    if (dataLoaded && props.match.params.recipeId && !isFirstRender) {
      const fetchRecipe = async () => {
        setLoading(true);
        const recipe = await getRecipeById(props.match.params.recipeId);

        // Authorization check
        const isAdmin = hasAnyRole(userInfo, ["admin"]);
        const recipeUserId =
          typeof recipe.user === "object" ? recipe.user?._id : recipe.user;
        const isCreator = recipeUserId === userInfo.id;

        if (!isAdmin && !isCreator) {
          notification.error({
            message: "Not Authorized",
            description: "You don't have permission to edit this recipe.",
          });
          allowNavigationRef.current = true;
          props.history.push("/admin/v2");
          return;
        }

        // Store recipe's original language
        if (recipe && recipe.language) {
          setRecipeLanguage(recipe.language);
        }

        populateRecipeInfo(recipe);
        setIsFirstRender(true);
      };
      fetchRecipe();
    }
  }, [dataLoaded, props.match.params.recipeId]);

  // Initial data fetch
  useEffect(() => {
    if (userInfo) {
      if (props.match.params.recipeId) {
        if (!recipeLanguage) {
          fetchDataV2();
        }
      } else {
        fetchDataV2();
      }
    }
  }, [userInfo, language, props.match.params.recipeId]);

  // Refetch data with correct language once recipeLanguage is set
  useEffect(() => {
    if (recipeLanguage && props.match.params.recipeId && userInfo) {
      setSelectedRecipeForTranslation("");
      fetchDataV2(recipeLanguage);
    }
  }, [recipeLanguage]);

  // Pre-populate translation link when editing
  useEffect(() => {
    if (
      dataLoaded &&
      recipeLanguage &&
      props.match.params.recipeId &&
      allRecipesFromOtherLanguage.length > 0
    ) {
      const fetchAndSetTranslation = async () => {
        const recipe = await getRecipeById(props.match.params.recipeId);
        if (recipe?.translationKey) {
          setTranslationKey(recipe.translationKey);
          const linked = allRecipesFromOtherLanguage.find(
            (r) => r.translationKey === recipe.translationKey,
          );
          if (linked) {
            handleSelectRecipeForTranslation(linked._id, false);
          }
        }
      };
      fetchAndSetTranslation();
    }
  }, [dataLoaded, recipeLanguage, allRecipesFromOtherLanguage]);

  // Close translation dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        translationDropdownRef.current &&
        !translationDropdownRef.current.contains(e.target)
      ) {
        setTranslationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Edit lock: acquire on mount
  useEffect(() => {
    const recipeId = props.match.params.recipeId;
    if (!recipeId) return;

    const tryAcquireLock = async () => {
      try {
        const result = await acquireRecipeLock(recipeId);
        if (result?.error === "RECIPE_LOCKED") {
          setEditLockDetails(result);
          setEditLockBlocked(true);
        }
      } catch (err) {
        console.log("Failed to acquire edit lock:", err);
      }
    };
    tryAcquireLock();
  }, [props.match.params.recipeId]);

  // Edit lock: heartbeat + cleanup
  useEffect(() => {
    const recipeId = props.match.params.recipeId;
    if (!recipeId) return;

    const heartbeatInterval = setInterval(() => {
      renewRecipeLock(recipeId);
    }, 10 * 1000);

    const sendUnlock = () => {
      const url = `${process.env.REACT_APP_SERVER}/api/recipes/recipe/${recipeId}/unlock`;
      const token = localStorage.getItem("jwtToken");
      const blob = new Blob([JSON.stringify({ token })], {
        type: "application/json",
      });
      navigator.sendBeacon(url, blob);
    };

    const handlePageHide = () => {
      sendUnlock();
    };
    const handleBeforeUnload = () => {
      sendUnlock();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      releaseRecipeLock(recipeId);
    };
  }, [props.match.params.recipeId]);

  const addBtnStyle = { background: "#ff7700" };
  const addBtnIconStyle = { filter: "brightness(0) invert(1)" };

  // ── Media Manager ──
  const openForCoverImage = () => {
    setErrors((prev) => ({ ...prev, featuredImage: "" }));
    setMediaManagerVisible(true);
    setMediaManagerType("images");
    setMediaManagerActions([featuredImage, setFeaturedImage]);
  };

  const getImageLink = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img.replace(/ /g, "%20");
    if (img.link) return img.link.replace(/ /g, "%20");
    return "";
  };

  // ── Ingredient helpers ──
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: v4(),
        name: "",
        nameLabel: "",
        weight: "",
        volume: "",
        pieces: "",
        method: "",
        other: "",
      },
    ]);
  };

  const updateIngredientField = (id, field, value) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing,
      ),
    );
  };

  const removeIngredientRow = (id) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  // ── Cooking process helpers ──
  const addCookingStep = () => {
    setCookingProcess([...cookingProcess, { id: v4(), text: "" }]);
  };

  const updateCookingStep = (id, value) => {
    setCookingProcess(
      cookingProcess.map((step) =>
        step.id === id ? { ...step, text: value } : step,
      ),
    );
  };

  const removeCookingStep = (id) => {
    setCookingProcess(cookingProcess.filter((step) => step.id !== id));
  };

  // ── Save ──
  const handleSaveRecipe = async () => {
    setLoading(true);

    const validationErrors = [];
    const errorToShow = {};
    if (!recipeName) {
      validationErrors.push("Recipe Name is required");
      errorToShow.recipeName = "Recipe Name is required";
    }

    setErrors(errorToShow);
    if (validationErrors.length > 0) {
      notification.error({
        message: "Please fill all required fields",
        description: (
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        ),
      });
      setLoading(false);
      return;
    }

    try {
      const effectiveLanguage =
        isUpdate && recipeLanguage ? recipeLanguage : language;

      const obj = {
        language: effectiveLanguage,
        name: recipeName,
        description: recipeDescription,
        image:
          typeof featuredImage === "object"
            ? featuredImage.link
            : featuredImage || "",
        prepTime: prepTime || 0,
        persons: persons || 0,
        kCalPerPerson: kCalPerPerson || 0,
        saturationIndex: saturationIndex || 0,
        protein: protein || 0,
        carbohydrate: carbohydrate || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        mealTypes: selectedMealTypes.map((mt) => mt._id),
        foodTypes: selectedFoodTypes.map((ft) => ft._id),
        diet: selectedDiet.map((d) => d._id),
        ingredients: ingredients
          .filter((ing) => ing.name)
          .map((ing) => ({
            name: ing.name,
            weight: ing.weight || undefined,
            volume: ing.volume || undefined,
            pieces: ing.pieces || undefined,
            method: ing.method || undefined,
            other: ing.other || undefined,
          })),
        cookingProcess: cookingProcess
          .map((step) => step.text)
          .filter((t) => t.trim()),
        notes,
        tips,
        allowComments,
        allowReviews,
        isPublic,
        ...(hasAnyRole(userInfo, ["admin"]) && { adminApproved }),
      };

      // Translation key
      if (!isUpdate) {
        if (translationKey && translationKey !== "__unlink__") {
          obj.translationKey = translationKey;
        }
      } else if (translationLinkDirty) {
        if (translationKey === "__unlink__") {
          obj.translationKey = null;
        } else if (translationKey) {
          obj.translationKey = translationKey;
        }
      }

      if (isUpdate) {
        await updateRecipe(obj, props.match.params.recipeId);
        setIsDirty(false);
        reloadWithoutConfirmation();
      } else {
        const res = await createRecipe(obj);
        if (res && res.newRecipe) {
          setIsDirty(false);
          allowNavigationRef.current = true;
          props.history.push(`/admin/v2/recipe-studio/${res.newRecipe._id}`);
        }
      }
      setLoading(false);
    } catch (err) {
      console.log("Error saving recipe:", err);
      setLoading(false);
    }
  };

  // Effective language for display
  const effectiveLanguage =
    isUpdate && recipeLanguage ? recipeLanguage : language;

  // Translation dropdown helpers
  const filteredTranslationRecipes = allRecipesFromOtherLanguage.filter((r) => {
    const matchesSearch =
      !translationSearch ||
      r.name?.toLowerCase().includes(translationSearch.toLowerCase());
    const alreadyLinked = sameLanguageTranslationKeys.has(r.translationKey);
    return matchesSearch && !alreadyLinked;
  });

  const selectedTranslationName = selectedRecipeForTranslation
    ? allRecipesFromOtherLanguage.find(
        (r) => r._id === selectedRecipeForTranslation,
      )?.name || "Selected"
    : "";

  return (
    <div>
      <Prompt
        when={!editLockBlocked && isDirty}
        message={() => {
          if (allowNavigationRef.current) {
            allowNavigationRef.current = false;
            return true;
          }
          return get(
            strings,
            "recipeStudio.unsaved_changes_warning",
            "You have unsaved changes in this recipe. Are you sure you want to leave?",
          );
        }}
      />
      {loading && (
        <div
          style={{
            background: "transparent",
            height: "100vh",
            zIndex: "9999",
            position: "fixed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <LoadingOutlined style={{ fontSize: "80px", color: "#ff7700" }} />
        </div>
      )}
      <Navbar color="dark" />

      <EditTypeName
        editCategoryNameModalVisible={editItemNameModalVisible}
        setEditCategoryModelVisible={setEditItemNameModalVisible}
        fethData={() => fetchDataV2(effectiveLanguage)}
        selectedForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />

      {/* Create Meal Type Modal */}
      <Modal
        onCancel={() => setMealTypeModal(false)}
        footer={false}
        visible={mealTypeModal}
      >
        <p className="font-paragraph-white">Create Meal Type</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newMealType}
            onChange={(e) => setNewMealType(e.target.value)}
          />
          <Button
            type="primary"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newMealType.length > 0) {
                await createMealType(newMealType, effectiveLanguage);
                setNewMealType("");
                fetchDataV2(effectiveLanguage);
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Meal Types</span>
          <List
            size="small"
            bordered
            dataSource={allMealTypes}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                <span>{g.name}</span>
                <span style={{ display: "flex", gap: "6px" }}>
                  <Tooltip
                    title={
                      selectedMealTypes.find((item) => item._id === g._id)
                        ? "Unselect"
                        : "Select"
                    }
                  >
                    <Button
                      onClick={() => {
                        setSelectedMealTypes((prev) => {
                          const isExist = prev.find(
                            (item) => item._id === g._id,
                          );
                          if (isExist)
                            return prev.filter((item) => item._id !== g._id);
                          else return [...prev, g];
                        });
                      }}
                      type="primary"
                      icon={
                        selectedMealTypes.find((item) => item._id === g._id) ? (
                          <CloseOutlined />
                        ) : (
                          <CheckOutlined />
                        )
                      }
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      onClick={async () => {
                        await removeMealType(g._id);
                        setSelectedMealTypes((prev) =>
                          prev.filter((item) => item._id !== g._id),
                        );
                        fetchDataV2(effectiveLanguage);
                      }}
                      type="primary"
                      danger
                      icon={<DeleteFilled />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Meal Type");
                        setSelectedItemForUpdate(g);
                        setEditItemNameModalVisible(true);
                      }}
                      icon={<EditOutlined />}
                      size="small"
                    />
                  </Tooltip>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* Create Food Type Modal */}
      <Modal
        onCancel={() => setFoodTypeModal(false)}
        footer={false}
        visible={foodTypeModal}
      >
        <p className="font-paragraph-white">Create Food Type</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newFoodType}
            onChange={(e) => setNewFoodType(e.target.value)}
          />
          <Button
            type="primary"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newFoodType.length > 0) {
                await createFoodType(newFoodType, effectiveLanguage);
                setNewFoodType("");
                fetchDataV2(effectiveLanguage);
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Food Types</span>
          <List
            size="small"
            bordered
            dataSource={allFoodTypes}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                <span>{g.name}</span>
                <span style={{ display: "flex", gap: "6px" }}>
                  <Tooltip
                    title={
                      selectedFoodTypes.find((item) => item._id === g._id)
                        ? "Unselect"
                        : "Select"
                    }
                  >
                    <Button
                      onClick={() => {
                        setSelectedFoodTypes((prev) => {
                          const isExist = prev.find(
                            (item) => item._id === g._id,
                          );
                          if (isExist)
                            return prev.filter((item) => item._id !== g._id);
                          else return [...prev, g];
                        });
                      }}
                      type="primary"
                      icon={
                        selectedFoodTypes.find((item) => item._id === g._id) ? (
                          <CloseOutlined />
                        ) : (
                          <CheckOutlined />
                        )
                      }
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      onClick={async () => {
                        await removeFoodType(g._id);
                        setSelectedFoodTypes((prev) =>
                          prev.filter((item) => item._id !== g._id),
                        );
                        fetchDataV2(effectiveLanguage);
                      }}
                      type="primary"
                      danger
                      icon={<DeleteFilled />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Food Type");
                        setSelectedItemForUpdate(g);
                        setEditItemNameModalVisible(true);
                      }}
                      icon={<EditOutlined />}
                      size="small"
                    />
                  </Tooltip>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* Create Diet Modal */}
      <Modal
        onCancel={() => setDietModal(false)}
        footer={false}
        visible={dietModal}
      >
        <p className="font-paragraph-white">Create Diet</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input value={newDiet} onChange={(e) => setNewDiet(e.target.value)} />
          <Button
            type="primary"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newDiet.length > 0) {
                await createDiet(newDiet, effectiveLanguage);
                setNewDiet("");
                fetchDataV2(effectiveLanguage);
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Diets</span>
          <List
            size="small"
            bordered
            dataSource={allDiets}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                <span>{g.name}</span>
                <span style={{ display: "flex", gap: "6px" }}>
                  <Tooltip
                    title={
                      selectedDiet.find((item) => item._id === g._id)
                        ? "Unselect"
                        : "Select"
                    }
                  >
                    <Button
                      onClick={() => {
                        setSelectedDiet((prev) => {
                          const isExist = prev.find(
                            (item) => item._id === g._id,
                          );
                          if (isExist)
                            return prev.filter((item) => item._id !== g._id);
                          else return [...prev, g];
                        });
                      }}
                      type="primary"
                      icon={
                        selectedDiet.find((item) => item._id === g._id) ? (
                          <CloseOutlined />
                        ) : (
                          <CheckOutlined />
                        )
                      }
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      onClick={async () => {
                        await removeDiet(g._id);
                        setSelectedDiet((prev) =>
                          prev.filter((item) => item._id !== g._id),
                        );
                        fetchDataV2(effectiveLanguage);
                      }}
                      type="primary"
                      danger
                      icon={<DeleteFilled />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Diet Type");
                        setSelectedItemForUpdate(g);
                        setEditItemNameModalVisible(true);
                      }}
                      icon={<EditOutlined />}
                      size="small"
                    />
                  </Tooltip>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* Create Ingredient Modal */}
      <Modal
        onCancel={() => setIngredientModal(false)}
        footer={false}
        visible={ingredientModal}
      >
        <p className="font-paragraph-white">Create Ingredient</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
          />
          <Button
            type="primary"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newIngredient.length > 0) {
                await createIngredient(newIngredient, effectiveLanguage);
                setNewIngredient("");
                fetchDataV2(effectiveLanguage);
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Ingredients</span>
          <List
            size="small"
            bordered
            dataSource={allIngredients}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "5px",
                }}
              >
                <span>{g.name}</span>
                <span style={{ display: "flex", gap: "6px" }}>
                  <Tooltip
                    title={
                      ingredients.find((item) => item.name === g._id)
                        ? "Unselect"
                        : "Select"
                    }
                  >
                    <Button
                      onClick={() => {
                        const isExist = ingredients.find(
                          (item) => item.name === g._id,
                        );
                        if (isExist) {
                          setIngredients((prev) =>
                            prev.filter((item) => item.name !== g._id),
                          );
                        } else {
                          setIngredients((prev) => [
                            ...prev,
                            {
                              id: v4(),
                              name: g._id,
                              nameLabel: g.name,
                              weight: "",
                              volume: "",
                              pieces: "",
                              method: "",
                              other: "",
                            },
                          ]);
                        }
                      }}
                      type="primary"
                      icon={
                        ingredients.find((item) => item.name === g._id) ? (
                          <CloseOutlined />
                        ) : (
                          <CheckOutlined />
                        )
                      }
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      onClick={async () => {
                        await removeIngredient(g._id);
                        setIngredients((prev) =>
                          prev.filter((item) => item.name !== g._id),
                        );
                        fetchDataV2(effectiveLanguage);
                      }}
                      type="primary"
                      danger
                      icon={<DeleteFilled />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedItemForUpdateTitle("Update Ingredient");
                        setSelectedItemForUpdate(g);
                        setEditItemNameModalVisible(true);
                      }}
                      icon={<EditOutlined />}
                      size="small"
                    />
                  </Tooltip>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* ── Main Page ── */}
      <div style={{ background: "#2a2f37" }}>
        <div className="trainer-profile-container">
          {/* ── Column 1: Cover Image + Name + Quick Info ── */}
          <div
            className="trainer-profile-container-column1 adminV2-bi-trainer-profile-container-column1"
            style={{
              background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${getImageLink(
                featuredImage,
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              overflow: "hidden",
            }}
          >
            {/* Add Cover Photo Box */}
            <div
              onClick={openForCoverImage}
              style={{
                width: "120px",
                height: "120px",
                border: errors.featuredImage
                  ? "2px solid red"
                  : "2px dashed rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 3,
                borderRadius: "8px",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "13px",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                {featuredImage ? "Change Cover" : "Add Cover"}
              </span>
            </div>
            <div
              className="profile-box adminV2-bi-profile-box"
              style={{ position: "relative", zIndex: 2 }}
            >
              <div
                className="challenge-profile-box-1 adminV2-bi-challenge-profile-box-1"
                style={{ borderBottom: "2px solid #222932", textAlign: "left" }}
              >
                <input
                  placeholder="Recipe Name"
                  style={{
                    border: errors.recipeName && "2px solid red",
                    fontWeight: 600,
                    fontSize: "29px",
                    fontStyle: "normal",
                    lineHeight: "100%",
                    marginLeft: "5px",
                  }}
                  className="font-paragraph-white adminV2-bi-input"
                  onChange={(e) => {
                    if (errors.recipeName) {
                      setErrors((prev) => ({ ...prev, recipeName: "" }));
                    }
                    setRecipeName(e.target.value);
                  }}
                  value={recipeName}
                />
              </div>
              <div className="challenge-profile-box-2 adminV2-bi-challenge-profile-box-2">
                {/* Meal Types + kCal - matching RecipeProfile layout */}
                <div className="challenge-profile-box-2-info">
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {selectedMealTypes.map((mt) => (
                      <div
                        className="challenge-profile-box-2-container"
                        style={{
                          opacity: "0.7",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                        key={mt._id}
                      >
                        {allMealTypes.find((a) => a._id === mt._id)?.name ||
                          mt.name}
                        <DeleteFilled
                          onClick={() =>
                            setSelectedMealTypes((prev) =>
                              prev.filter((item) => item._id !== mt._id),
                            )
                          }
                          style={{
                            color: "#ff7700",
                            fontSize: "14px",
                            marginLeft: "5px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    ))}
                    <AddNewButton
                      onClick={() => setMealTypeModal(true)}
                      type="small"
                      style={addBtnStyle}
                      iconStyle={addBtnIconStyle}
                    />
                    <div
                      className="challenge-profile-box-2-container"
                      style={{
                        opacity: "0.7",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <input
                        placeholder="0"
                        className="font-paragraph-white adminV2-bi-input"
                        style={{
                          width: "55px",
                          textAlign: "center",
                          fontSize: "1.8rem",
                          padding: "0",
                        }}
                        onChange={(e) => setKCalPerPerson(e.target.value)}
                        value={kCalPerPerson}
                        type="number"
                      />
                      <span>KCAL</span>
                    </div>
                  </div>
                </div>

                {/* Prep Time + Persons - matching RecipeProfile layout */}
                <div
                  className="challenge-profile-box-2-info"
                  style={{ marginTop: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "var(--color-orange)" }}
                    />{" "}
                    <input
                      placeholder="0"
                      className="font-paragraph-white adminV2-bi-input"
                      style={{
                        width: "40px",
                        textAlign: "center",
                        fontSize: "1.8rem",
                        padding: "0",
                      }}
                      onChange={(e) => setPrepTime(e.target.value)}
                      value={prepTime}
                      type="number"
                    />{" "}
                    <span className="font-paragraph-white">min</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <UserOutlined style={{ color: "var(--color-orange)" }} />{" "}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(persons) || 0;
                          if (current > 0) setPersons(current - 1);
                        }}
                        disabled={(Number(persons) || 0) <= 0}
                        aria-label="Decrease persons"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: "1px solid var(--color-orange)",
                          background: "transparent",
                          color: "var(--color-orange)",
                          fontSize: "1.4rem",
                          lineHeight: 1,
                          cursor:
                            (Number(persons) || 0) <= 0
                              ? "not-allowed"
                              : "pointer",
                          opacity: (Number(persons) || 0) <= 0 ? 0.4 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        −
                      </button>
                      <input
                        placeholder="0"
                        className="font-paragraph-white adminV2-bi-input"
                        style={{
                          width: "40px",
                          textAlign: "center",
                          fontSize: "1.8rem",
                          padding: "0",
                        }}
                        onChange={(e) => setPersons(e.target.value)}
                        value={persons}
                        type="number"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number(persons) || 0;
                          setPersons(current + 1);
                        }}
                        aria-label="Increase persons"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: "1px solid var(--color-orange)",
                          background: "transparent",
                          color: "var(--color-orange)",
                          fontSize: "1.4rem",
                          lineHeight: 1,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        +
                      </button>
                    </div>{" "}
                    <span className="font-paragraph-white">persons</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Column 2: Form Content ── */}
          <div className="recipe-profile-container-column2">
            {/* Translation Selector */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Translation Link (
                {effectiveLanguage === "dutch" ? "English" : "Dutch"} version)
              </div>
              <div
                ref={translationDropdownRef}
                style={{ position: "relative", marginTop: "8px" }}
              >
                <div
                  onClick={() =>
                    setTranslationDropdownOpen(!translationDropdownOpen)
                  }
                  style={{
                    background: "#f5f5f5",
                    padding: "8px 12px",
                    cursor: "pointer",
                    color: selectedRecipeForTranslation ? "#283443" : "#999",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  {selectedRecipeForTranslation
                    ? selectedTranslationName
                    : "Select a recipe to link..."}
                </div>
                {translationDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "0 0 4px 4px",
                      zIndex: 100,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <input
                      placeholder="Search..."
                      value={translationSearch}
                      onChange={(e) => setTranslationSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#f9f9f9",
                        border: "none",
                        borderBottom: "1px solid #ddd",
                        color: "#283443",
                        outline: "none",
                      }}
                    />
                    {selectedRecipeForTranslation && (
                      <div
                        onClick={() => {
                          handleSelectRecipeForTranslation("");
                          setTranslationDropdownOpen(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          color: "#ff4d4f",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Remove link
                      </div>
                    )}
                    {filteredTranslationRecipes.map((r) => (
                      <div
                        key={r._id}
                        onClick={() => {
                          handleSelectRecipeForTranslation(r._id);
                          setTranslationDropdownOpen(false);
                          setTranslationSearch("");
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          background:
                            r._id === selectedRecipeForTranslation
                              ? "#ff7700"
                              : "transparent",
                          color:
                            r._id === selectedRecipeForTranslation
                              ? "#fff"
                              : "#283443",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background =
                            r._id === selectedRecipeForTranslation
                              ? "#ff7700"
                              : "#f0f0f0")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background =
                            r._id === selectedRecipeForTranslation
                              ? "#ff7700"
                              : "transparent")
                        }
                      >
                        {r.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meal Values */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Meal Values
              </div>
              <div className="recipe-mealValues-container">
                {[
                  {
                    label: "Protein",
                    value: protein,
                    setter: setProtein,
                    icon: ProteinIcon,
                  },
                  {
                    label: "Carbohydrates",
                    value: carbohydrate,
                    setter: setCarbohydrate,
                    icon: CarbIcon,
                  },
                  { label: "Fat", value: fat, setter: setFat, icon: FatIcon },
                  {
                    label: "Fiber",
                    value: fiber,
                    setter: setFiber,
                    icon: FiberIcon,
                  },
                ].map((item, i) => (
                  <div className="recipe-mealValues-container-box" key={i}>
                    <span>{item.label}</span>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="recipe-mealValues-icon"
                        style={{ marginRight: "10px" }}
                      />
                      <input
                        className="adminV2-bi-input"
                        style={{
                          width: "80px",
                          color: "#283443",
                          borderColor: "#ccc",
                        }}
                        type="number"
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                        placeholder="g"
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="recipe-mealValues">
              <div
                className="recipe-mealValues-heading font-paragraph-white"
                style={{ marginBottom: "5px" }}
              >
                Short Info / Description
              </div>
              <div className="recipe-mealValues-info">
                <TextEditor
                  value={recipeDescription}
                  setValue={setRecipeDescription}
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Ingredients
              </div>
              <div style={{ marginTop: "8px" }}>
                {ingredients.map((ing, idx) => (
                  <div
                    key={ing.id}
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: "2",
                        minWidth: "150px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="adminV2-bi-input"
                        style={{
                          width: "100%",
                          color: "#283443",
                          borderColor: "#ccc",
                          padding: "6px 8px",
                          fontWeight: 500,
                        }}
                      >
                        {ing.nameLabel ||
                          allIngredients.find((ai) => ai._id === ing.name)
                            ?.name ||
                          ing.name}
                      </span>
                    </div>
                    <input
                      className="adminV2-bi-input"
                      style={{
                        width: "70px",
                        color: "#283443",
                        borderColor: "#ccc",
                      }}
                      type="number"
                      placeholder="g"
                      value={ing.weight}
                      onChange={(e) =>
                        updateIngredientField(ing.id, "weight", e.target.value)
                      }
                    />
                    <input
                      className="adminV2-bi-input"
                      style={{
                        width: "70px",
                        color: "#283443",
                        borderColor: "#ccc",
                      }}
                      type="number"
                      placeholder="ml"
                      value={ing.volume}
                      onChange={(e) =>
                        updateIngredientField(ing.id, "volume", e.target.value)
                      }
                    />
                    <input
                      className="adminV2-bi-input"
                      style={{
                        width: "70px",
                        color: "#283443",
                        borderColor: "#ccc",
                      }}
                      type="number"
                      placeholder="pcs"
                      value={ing.pieces}
                      onChange={(e) =>
                        updateIngredientField(ing.id, "pieces", e.target.value)
                      }
                    />
                    <input
                      className="adminV2-bi-input"
                      style={{
                        width: "100px",
                        color: "#283443",
                        borderColor: "#ccc",
                      }}
                      type="text"
                      placeholder="Method"
                      value={ing.method}
                      onChange={(e) =>
                        updateIngredientField(ing.id, "method", e.target.value)
                      }
                    />
                    <input
                      className="adminV2-bi-input"
                      style={{
                        width: "80px",
                        color: "#283443",
                        borderColor: "#ccc",
                      }}
                      type="text"
                      placeholder="Other"
                      value={ing.other}
                      onChange={(e) =>
                        updateIngredientField(ing.id, "other", e.target.value)
                      }
                    />
                    <Tooltip title="Remove">
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteFilled />}
                        size="small"
                        onClick={() => removeIngredientRow(ing.id)}
                      />
                    </Tooltip>
                  </div>
                ))}
                <AddNewButton
                  onClick={() => setIngredientModal(true)}
                  type="small"
                  style={addBtnStyle}
                  iconStyle={addBtnIconStyle}
                />
              </div>
            </div>

            {/* Cooking Process */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Preparation Steps
              </div>
              <div
                className="recipe-prepration-box"
                style={{ marginTop: "8px" }}
              >
                {cookingProcess.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      className="recipe-mealValues-info-number"
                      style={{ minWidth: "25px" }}
                    >
                      {i + 1}
                    </span>
                    <Input.TextArea
                      rows={2}
                      value={step.text}
                      onChange={(e) =>
                        updateCookingStep(step.id, e.target.value)
                      }
                      style={{
                        background: "#fff",
                        color: "#283443",
                        border: "1px solid #ddd",
                      }}
                    />
                    <Tooltip title="Remove">
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteFilled />}
                        size="small"
                        onClick={() => removeCookingStep(step.id)}
                      />
                    </Tooltip>
                  </div>
                ))}
                <AddNewButton
                  onClick={addCookingStep}
                  type="small"
                  style={addBtnStyle}
                  iconStyle={addBtnIconStyle}
                />
              </div>
            </div>

            {/* Tips */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Tips
              </div>
              <div
                className="recipe-highlight-box recipe-tips-box"
                style={{ marginTop: "8px" }}
              >
                <div className="recipe-highlight-icon">
                  <img src={TipIcon} alt="tips" />
                </div>
                <div className="recipe-highlight-content">
                  <TextEditor value={tips} setValue={setTips} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Notes
              </div>
              <div
                className="recipe-highlight-box recipe-notes-box"
                style={{ marginTop: "8px" }}
              >
                <div className="recipe-highlight-icon">
                  <img src={NoteIcon} alt="notes" />
                </div>
                <div className="recipe-highlight-content">
                  <TextEditor value={notes} setValue={setNotes} />
                </div>
              </div>
            </div>

            {/* Food Types */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Food Types
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                {selectedFoodTypes.map((ft) => (
                  <div
                    className="challenge-profile-box-2-container"
                    style={{
                      opacity: "0.7",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#283443",
                      opacity: 1,
                    }}
                    key={ft._id}
                  >
                    <span>
                      {allFoodTypes.find((a) => a._id === ft._id)?.name ||
                        ft.name}
                    </span>
                    <DeleteFilled
                      onClick={() =>
                        setSelectedFoodTypes((prev) =>
                          prev.filter((item) => item._id !== ft._id),
                        )
                      }
                      style={{
                        color: "#ff7700",
                        fontSize: "14px",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}
                <AddNewButton
                  onClick={() => setFoodTypeModal(true)}
                  type="small"
                  style={{
                    marginLeft: "10px",
                    height: "36px",
                    marginTop: "5px",
                    ...addBtnStyle,
                  }}
                  iconStyle={addBtnIconStyle}
                />
              </div>
            </div>

            {/* Diet */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Diet
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                {selectedDiet.map((d) => (
                  <div
                    className="challenge-profile-box-2-container"
                    style={{
                      opacity: "0.7",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "#283443",
                      opacity: 1,
                    }}
                    key={d._id}
                  >
                    <span>
                      {allDiets.find((a) => a._id === d._id)?.name || d.name}
                    </span>
                    <DeleteFilled
                      onClick={() =>
                        setSelectedDiet((prev) =>
                          prev.filter((item) => item._id !== d._id),
                        )
                      }
                      style={{
                        color: "#ff7700",
                        fontSize: "14px",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}
                <AddNewButton
                  onClick={() => setDietModal(true)}
                  type="small"
                  style={{
                    marginLeft: "10px",
                    height: "36px",
                    marginTop: "5px",
                    ...addBtnStyle,
                  }}
                  iconStyle={addBtnIconStyle}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="recipe-mealValues">
              <div className="recipe-mealValues-heading font-paragraph-white">
                Settings
              </div>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Checkbox
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                >
                  <span style={{ color: "#283443" }}>Allow Comments</span>
                </Checkbox>
                <Checkbox
                  checked={allowReviews}
                  onChange={(e) => setAllowReviews(e.target.checked)}
                  style={{ marginLeft: 0 }}
                >
                  <span style={{ color: "#283443" }}>Allow Reviews</span>
                </Checkbox>
                <Checkbox
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ marginLeft: 0 }}
                >
                  <span style={{ color: "#283443" }}>Make Public</span>
                </Checkbox>
                {hasAnyRole(userInfo, ["admin"]) && (
                  <Checkbox
                    checked={adminApproved}
                    onChange={(e) => setAdminApproved(e.target.checked)}
                    style={{ marginLeft: 0 }}
                  >
                    <span style={{ color: "#283443" }}>Admin Approved</span>
                  </Checkbox>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: "20px", marginBottom: "40px" }}>
              <button
                className="common-transparent-button font-paragraph-white"
                onClick={handleSaveRecipe}
                disabled={loading || editLockBlocked}
                style={{
                  color: "#fff",
                  borderColor: "#ff7700",
                  backgroundColor: "#ff7700",
                  cursor:
                    loading || editLockBlocked ? "not-allowed" : "pointer",
                  padding: "10px 40px",
                  fontSize: "16px",
                  width: "100%",
                }}
              >
                {loading ? (
                  <LoadingOutlined />
                ) : isUpdate ? (
                  "Update Recipe"
                ) : (
                  "Create Recipe"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChallengeLockModal
        visible={editLockBlocked}
        lockDetails={editLockDetails}
      />
    </div>
  );
}

export default withRouter(BasicInformation);
