import React, { useState, useEffect, useContext } from "react";
import "../../assets/creatorprofile.css";
import "../../assets/adminDashboardV2.css";
import "../../assets/home.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { EditFilled, DeleteFilled, LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import { get } from "lodash";
import PopupPlayer from "../../components/PopupPlayer/PopupPlayer";
import ChallengeCard from "../../components/Cards/ChallengeCard";
import {
  getAllTrainerGoals,
  deleteTrainerGoals,
} from "../../services/trainers";
import QuoteIcon from "../../assets/icons/quote-icon.png";
import ChallengeProfileSubtract from "../../assets/icons/challenge-profile-subtract.svg";
import ShareIcon from "../../assets/icons/share-icon.svg";
import StarFilled from "../../assets/icons/star-orange.svg";
import StarTransparent from "../../assets/icons/star-transparent.svg";
import { Avatar, Button, Input, message } from "antd";
import CountryDropdown from "../../components/Admin/V2/Common/CountryDropdown";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../../components/Translate";
import { userInfoContext } from "../../contexts/UserStore";
import { hasRole, hasAnyRole } from "../../helpers/roleHelpers";
import {
  getUsersProfile,
  updateUserProfileByAdmin,
} from "../../services/users";
import { LanguageContext } from "../../contexts/LanguageContext";
import HeartIcon from "../../assets/icons/heart-icon.svg";
import UploadIcon from "../../assets/icons/upload-icon.svg";
import DumbBellIcon from "../../assets/icons/dumb-bell-icon.svg";
import GoalCreatorPopup from "./GoalCreatorPopup";
import {
  getAllChallenges,
  getAllUserChallenges,
  getAllUserExercises,
} from "../../services/createChallenge/main";
import { getAllUserRecipes } from "../../services/recipes";
import ModalForEditList from "../../components/Admin/V2/Common/ModalForEditList";
import ExerciseCreatorPopup from "./ExerciseCreatorPopup";
import RemoteMediaManager from "../../components/Admin/MediaManager/RemoteMediaManager";
import RecipeIcon from "../../assets/icons/create-recipe-icon.svg";
import BlogIcon from "../../assets/icons/create-blog-icon.svg";
import ChallengeIcon from "../../assets/icons/challenge-icon-white.svg";

function AdminDashboard(props) {
  const { language, strings } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const [loading, setLoading] = useState(false);
  const [trainer, setTrainer] = useState({});
  const [goals, setGoals] = useState([]);
  const [showTrainerGoalModal, setShowTrainerGoalModal] = useState(false);
  const [challenges, setAllChallenges] = useState([]);
  const [exercises, setAllExercises] = useState([]);
  const [openExerciseEditListModal, setOpenExerciseEditListModal] =
    useState(false);
  const [openChallengeEditListModal, setOpenChallengeEditListModal] =
    useState(false);
  const [openRecipeEditListModal, setOpenRecipeEditListModal] =
    useState(false);
  const [recipes, setAllRecipes] = useState([]);
  const [openExerciseCreatorPopup, setOpenExerciseCreatorPopup] =
    useState(false);
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState(null);
  const [motto, setMotto] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [heroBanner, setHeroBanner] = useState("");
  const [avatarLink, setAvatarLink] = useState("");
  const [videoTrailerLink, setVideoTrailerLink] = useState("");
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchTrainerGoals() {
    const { goals } = await getAllTrainerGoals(language);
    setGoals(goals);
  }

  const fetchChallenges = async () => {
    const { challenges } = await getAllUserChallenges(language, true);
    setAllChallenges(challenges);
  };

  const fetchExercises = async () => {
    const { exercises } = await getAllUserExercises(language, true);
    setAllExercises(exercises);
  };

  const fetchRecipes = async () => {
    const res = await getAllUserRecipes(language);
    if (res && res.recipes) setAllRecipes(res.recipes);
  };
  async function fetchData(id) {
    setLoading(true);
    const { user } = await getUsersProfile();
    await fetchTrainerGoals();
    await fetchChallenges();
    await fetchExercises();
    await fetchRecipes();
    // await fetchExercises();
    setTrainer(user);
    setLoading(false);
  }

  useEffect(() => {
    fetchData(adminInfo.id);
    const countries = require("../../assets/data/all-countries.json");
    setAllCountries(countries);
  }, [language]);

  // Load the correct language version of motto/bio when trainer data or language changes
  useEffect(() => {
    if (trainer._id) {
      const suffix = language === "dutch" ? "_nl" : "_en";
      setMotto(trainer[`motto${suffix}`] || trainer.motto || "");
      setBio(trainer[`bio${suffix}`] || trainer.bio || "");
    }
  }, [trainer._id, trainer.motto, trainer.motto_en, trainer.motto_nl, trainer.bio, trainer.bio_en, trainer.bio_nl, language]);

  useEffect(() => {
    if (trainer.country !== undefined) {
      setCountry(trainer.country || "");
    }
  }, [trainer.country]);

  useEffect(() => {
    if (trainer.heroBanner !== undefined) {
      setHeroBanner(trainer.heroBanner || "");
    }
  }, [trainer.heroBanner]);

  useEffect(() => {
    if (trainer.avatarLink !== undefined) {
      setAvatarLink(trainer.avatarLink || "");
    }
  }, [trainer.avatarLink]);

  useEffect(() => {
    if (trainer.videoTrailerLink !== undefined) {
      setVideoTrailerLink(trainer.videoTrailerLink || "");
    }
  }, [trainer.videoTrailerLink]);

  const handleMottoChange = (e) => setMotto(e.target.value);
  const handleBioChange = (e) => setBio(e.target.value);
  const handleCountryChange = (value) => setCountry(value);

  // Exit edit mode if language changes — each language is edited separately
  useEffect(() => {
    setEditMode(false);
  }, [language]);

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    const suffix = language === "dutch" ? "_nl" : "_en";
    setMotto(trainer[`motto${suffix}`] || trainer.motto || "");
    setBio(trainer[`bio${suffix}`] || trainer.bio || "");
    setCountry(trainer.country || "");
    setHeroBanner(trainer.heroBanner || "");
    setAvatarLink(trainer.avatarLink || "");
    setVideoTrailerLink(trainer.videoTrailerLink || "");
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!trainer._id) return;
    setSaving(true);
    try {
      const mottoField = language === "dutch" ? "motto_nl" : "motto_en";
      const bioField = language === "dutch" ? "bio_nl" : "bio_en";
      const payload = {
        [mottoField]: motto,
        [bioField]: bio,
        country,
        heroBanner,
        avatarLink,
        videoTrailerLink,
      };
      if (language !== "dutch") {
        payload.motto = motto;
        payload.bio = bio;
      }
      await updateUserProfileByAdmin(payload, trainer._id, adminInfo.role);
      const { user } = await getUsersProfile();
      setTrainer(user);
      setEditMode(false);
      message.success(
        get(strings, "adminv2.profile_saved", "Profile saved"),
      );
    } catch (error) {
      console.error("Failed to save profile:", error);
      message.error(
        get(strings, "adminv2.profile_save_failed", "Failed to save profile"),
      );
    } finally {
      setSaving(false);
    }
  };

  // Wrapper functions to extract just the link string from VFSBrowser's object response
  const handleHeroBannerSelect = (mediaObj) => {
    if (mediaObj && typeof mediaObj === "object" && mediaObj.link) {
      setHeroBanner(mediaObj.link);
    } else if (typeof mediaObj === "string") {
      setHeroBanner(mediaObj);
    }
  };

  const handleAvatarSelect = (mediaObj) => {
    if (mediaObj && typeof mediaObj === "object" && mediaObj.link) {
      setAvatarLink(mediaObj.link);
    } else if (typeof mediaObj === "string") {
      setAvatarLink(mediaObj);
    }
  };

  const handleTrailerSelect = (mediaObj) => {
    if (mediaObj && typeof mediaObj === "object" && mediaObj.link) {
      setVideoTrailerLink(mediaObj.link);
    } else if (typeof mediaObj === "string") {
      setVideoTrailerLink(mediaObj);
    }
  };

  const openForHeroBanner = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("images");
    setMediaManagerActions([heroBanner, handleHeroBannerSelect]);
  };

  const openForAvatar = (e) => {
    e.stopPropagation();
    setMediaManagerVisible(true);
    setMediaManagerType("images");
    setMediaManagerActions([avatarLink, handleAvatarSelect]);
  };

  const openForTrailer = (e) => {
    e.stopPropagation();
    setMediaManagerVisible(true);
    setMediaManagerType("videos");
    setMediaManagerActions([videoTrailerLink, handleTrailerSelect]);
  };

  const openNewInterestModal = () => {
    setSelectedGoalForEdit(null);
    setShowTrainerGoalModal(true);
  };

  const openEditInterestModal = (goal) => {
    setSelectedGoalForEdit(goal);
    setShowTrainerGoalModal(true);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteTrainerGoals(goalId);
      await fetchTrainerGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const goToChallengeCreator = () => {
    props.history.push("/admin/v2/challenge-studio");
  };
  const goToRecipeCreator = () => {
    props.history.push("/admin/v2/recipe-studio");
  };

  const goToBlogCreator = () => {
    props.history.push("/admin/dashboard?tab=new-blog");
  };

  const goToAllRecipes = () => {
    props.history.push("/admin/dashboard?tab=all-recipe");
  };

  const goToAllBlogs = () => {
    props.history.push("/admin/dashboard?tab=all-blog");
  };

  const goToNewExercise = () => {
    // props.history.push("/admin/dashboard?tab=new-exercise");
    setSelectedExerciseForEdit(null); // Clear any previously selected exercise
    setOpenExerciseCreatorPopup(true);
  };
  const goToEditExercise = (exerciseId) => {
    const exercise = exercises.find((e) => e._id === exerciseId);
    setSelectedExerciseForEdit(exercise);
    setOpenExerciseEditListModal(false);
    setOpenExerciseCreatorPopup(true);
  };

  const goToEditChallenge = (challengeId) => {
    window.open(
      `/admin/v2/challenge-studio/${challengeId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const goToEditRecipe = (recipeId) => {
    window.open(
      `/admin/v2/recipe-studio/${recipeId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${trainer.firstName}`}</title>
        <meta name="description" content={trainer.motto} />
        <meta property="og:title" content={trainer.name} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={trainer.motto} />
        <meta
          property="og:url"
          content={`${window.location.origin}/creator/${slug(trainer.firstName)}/${
            trainer._id
          }`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar />
      {/* video modal */}
      <PopupPlayer
        open={open}
        onCancel={() => setOpen(false)}
        video={videoTrailerLink}
      />
      <GoalCreatorPopup
        open={showTrainerGoalModal}
        setOpen={(isOpen) => {
          setShowTrainerGoalModal(isOpen);
          if (!isOpen) {
            setSelectedGoalForEdit(null);
          }
        }}
        onSuccess={fetchTrainerGoals}
        selectedGoalForEdit={selectedGoalForEdit}
      />
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            backgroundImage: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39))${
              heroBanner ? `, url(${heroBanner.replaceAll(" ", "%20")})` : ""
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            // position: "relative",
          }}
        >
          <div className="profile-box">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              {editMode ? (
                <>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      height: "34px",
                      padding: "0 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      background: "#ffffff",
                      borderColor: "#ff7700",
                      color: "#ff7700",
                    }}
                  >
                    {language === "dutch"
                      ? get(strings, "common.cancel", "Annuleren")
                      : get(strings, "common.cancel", "Cancel")}
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSave}
                    loading={saving}
                    style={{
                      height: "34px",
                      padding: "0 18px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      background: "#ff7700",
                      borderColor: "#ff7700",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {language === "dutch"
                      ? `${get(strings, "common.save", "Opslaan")} (NL)`
                      : `${get(strings, "common.save", "Save")} (EN)`}
                  </Button>
                </>
              ) : (
                <Button
                  type="primary"
                  onClick={handleEdit}
                  icon={<EditFilled />}
                  style={{
                    height: "34px",
                    padding: "0 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    background: "#ff7700",
                    borderColor: "#ff7700",
                    letterSpacing: "0.3px",
                  }}
                >
                  {language === "dutch"
                    ? `${get(strings, "common.edit", "Bewerken")} (NL)`
                    : `${get(strings, "common.edit", "Edit")} (EN)`}
                </Button>
              )}
            </div>
            {editMode && (
              <div
                onClick={openForHeroBanner}
                className="new-editable-border adminV2-bi-input"
                style={{
                  width: "200px",
                }}
              >
                <span
                  className="font-paragraph-white"
                  style={{ fontSize: "14px" }}
                >
                  {heroBanner ? (
                    <T>adminv2.change_cover</T>
                  ) : (
                    <T>adminv2.add_cover</T>
                  )}
                </span>
              </div>
            )}
            <div className="profile-box-row1">
              <div
                className={
                  editMode
                    ? "profile-box-row1-avatar new-editable-border adminV2-bi-input"
                    : "profile-box-row1-avatar"
                }
                onClick={editMode ? openForAvatar : undefined}
                style={{
                  position: "relative",
                  cursor: editMode ? "pointer" : "default",
                  width: "130px",
                  height: "130px",
                }}
              >
                <img
                  src={`${avatarLink ? avatarLink.replaceAll(" ", "%20") : ""}`}
                  alt="trainer-profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="profile-box-row1-information">
                <h2
                  className="font-heading-white"
                  style={{
                    margin: "0 0 10px 0",
                    padding: "0",
                    fontSize: "31px",
                  }}
                >
                  {trainer.firstName ? trainer.firstName : ""}{" "}
                  {trainer.lastName ? trainer.lastName : ""}
                </h2>

                <div
                  style={{
                    paddingTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {editMode ? (
                    <CountryDropdown
                      value={country}
                      onChange={handleCountryChange}
                      countries={allCountries}
                      placeholder="Select your country"
                      width={200}
                    />
                  ) : (
                    <p
                      className="font-paragraph-white"
                      style={{ margin: 0, padding: 0 }}
                    >
                      {country || ""}
                    </p>
                  )}
                  {hasAnyRole(adminInfo, ["admin", "trainer", "nutrist"]) && (
                    <img
                      src={ShareIcon}
                      alt="share"
                      style={{
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const url = `${window.location.origin}/creator/${slug(
                          trainer.username || trainer.firstName || "",
                        )}/${trainer._id}`;
                        navigator.clipboard
                          .writeText(url)
                          .then(() => {
                            message.success(
                              get(
                                strings,
                                "adminv2.link_copied",
                                "Profile link copied!",
                              ),
                            );
                          })
                          .catch(() => {
                            message.error(
                              get(
                                strings,
                                "adminv2.link_copy_failed",
                                "Failed to copy link",
                              ),
                            );
                          });
                      }}
                      title={get(
                        strings,
                        "adminv2.copy_profile_link",
                        "Copy profile link",
                      )}
                    />
                  )}
                </div>
                <div style={{ paddingTop: "10px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <img
                      key={star}
                      src={
                        star <= (trainer.rating || 0)
                          ? StarFilled
                          : StarTransparent
                      }
                      alt=""
                      style={{ height: "20px", margin: "2px" }}
                    />
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {editMode && (
                  <span
                    className="font-paragraph-white"
                    style={{ fontSize: "11px", marginBottom: "0px" }}
                    onClick={openForTrailer}
                  >
                    {videoTrailerLink ? (
                      <T>adminv2.update_trailer</T>
                    ) : (
                      <T>adminv2.add_trailer</T>
                    )}
                  </span>
                )}
                <div
                  className={
                    editMode
                      ? "profile-box-row1-playericon new-editable-border"
                      : "profile-box-row1-playericon"
                  }
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={editMode ? openForTrailer : undefined}
                >
                  <img
                    src={ChallengeProfileSubtract}
                    alt="play-icon"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      if (videoTrailerLink) {
                        e.stopPropagation();
                        setOpen(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="profile-box-row2">
              <div
                className="profile-box-row2-quote font-paragraph-white"
                style={{ alignItems: "center" }}
              >
                <img src={QuoteIcon} alt="" />
                {editMode ? (
                  <input
                    value={motto}
                    onChange={handleMottoChange}
                    placeholder={language === "dutch" ? "Voeg je motto toe" : "Add your motto"}
                    className="font-paragraph-white adminV2-bi-input"
                    style={{
                      marginLeft: "6px",
                      flex: 1,
                    }}
                  />
                ) : (
                  <span
                    className="font-paragraph-white"
                    style={{ marginLeft: "10px" }}
                  >
                    {motto || ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="trainer-profile-container-column2"
          style={{
            background: "#2a2f37",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <div
            className="trainer-profile-aboutme"
            style={{
              width: "100%",
              maxWidth: "650px",
            }}
          >
            <div
              className="trainer-profile-aboutme-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>trainer_profile.about_me</T>
            </div>
            {editMode ? (
              <textarea
                rows={4}
                value={bio}
                onChange={handleBioChange}
                placeholder={language === "dutch" ? "Voeg je bio toe" : "Add your bio"}
                className="font-paragraph-white adminV2-bi-input"
                style={{
                  width: "100%",
                  resize: "vertical",
                  height: "auto",
                }}
              />
            ) : (
              <div className="trainer-profile-aboutme-container font-paragraph-white">
                {bio || ""}
              </div>
            )}
          </div>

          <div className="adminv2-selector-container">
            <div className="adminv2-selector">
              <h1>
                <T>adminv2.welcome_trainer</T>
              </h1>
              <p>
                <T>adminv2.create</T>
              </p>
              <div
                className="adminv2-select"
                onClick={() => {
                  setMediaManagerVisible(true);
                  setMediaManagerType("images");
                  setMediaManagerActions([null, () => {}]);
                }}
              >
                <img src={UploadIcon} alt="heart-icon" />
                <p>
                  <T>adminv2.upload_media</T>
                </p>
              </div>
              {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
                <div className="adminv2-select" onClick={goToNewExercise}>
                  <img src={DumbBellIcon} alt="upload-icon" />
                  <p>
                    <T>adminv2.new_exercise</T>
                  </p>
                </div>
              )}
              {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
                <div className="adminv2-select" onClick={goToChallengeCreator}>
                  <img src={ChallengeIcon} alt="upload-icon" />
                  <p>
                    <T>adminv2.create_challenge</T>
                  </p>
                </div>
              )}
              {hasAnyRole(adminInfo, ["admin", "nutrist"]) && (
                <div className="adminv2-select" onClick={goToRecipeCreator}>
                  <img src={RecipeIcon} alt="upload-icon" />
                  <p>
                    <T>adminv2.create_recipe</T>
                  </p>
                </div>
              )}
              {hasAnyRole(adminInfo, ["admin", "blogger"]) && (
                <div className="adminv2-select" onClick={goToBlogCreator}>
                  <img src={BlogIcon} alt="upload-icon" />
                  <p>
                    <T>adminv2.create_blog</T>
                  </p>
                </div>
              )}
            </div>

            {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
              <div className="adminv2-selector">
                <h1
                  style={{
                    margin: "50px 0 40px 0",
                  }}
                >
                  <T>adminv2.interests</T>
                </h1>
                <div className="adminv2-selector-interests">
                  {goals.map((goal, i) => (
                    <div
                      className="adminv2-selector-interests-interest"
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {goal.icon && (
                        <img
                          src={goal.icon}
                          alt=""
                          style={{
                            width: "16px",
                            height: "16px",
                            objectFit: "contain",
                          }}
                        />
                      )}
                      <span>{goal.name}</span>
                      <EditFilled
                        style={{
                          cursor: "pointer",
                          color: "#FF950A",
                          fontSize: "14px",
                          marginLeft: "4px",
                        }}
                        onClick={() => openEditInterestModal(goal)}
                      />
                      <DeleteFilled
                        style={{
                          cursor: "pointer",
                          color: "#ff4444",
                          fontSize: "14px",
                        }}
                        onClick={() => handleDeleteGoal(goal._id)}
                      />
                    </div>
                  ))}
                  <Button
                    className="adminv2-interest-button"
                    onClick={openNewInterestModal}
                  >
                    <T>adminv2.add_new</T>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
            <div
              className="adminv2-selector-container"
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <div
                className="adminv2-selector"
                style={{ cursor: "pointer" }}
                onClick={() => setOpenExerciseEditListModal(true)}
              >
                {hasRole(adminInfo, "admin") ? (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.all_exercises</T>
                  </h1>
                ) : (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.my_exercises</T>
                  </h1>
                )}
              </div>
              <ModalForEditList
                data={exercises}
                open={openExerciseEditListModal}
                setOpen={setOpenExerciseEditListModal}
                onClickEdit={goToEditExercise}
                title={
                  hasRole(adminInfo, "admin")
                    ? get(strings, "adminv2.all_exercises", "All Exercises")
                    : get(strings, "adminv2.my_exercises", "My Exercises")
                }
                subtext={get(strings, "adminv2.exercise_id", "Exercise ID")}
                searchPlaceholder={get(
                  strings,
                  "adminv2.search_exercise",
                  "Search by exercise name",
                )}
                searchKeys={["title"]}
                type={"exercise"}
              />
            </div>
          )}

          {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
            <div
              className="adminv2-selector-container"
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <div
                className="adminv2-selector"
                style={{ cursor: "pointer" }}
                onClick={() => setOpenChallengeEditListModal(true)}
              >
                {hasRole(adminInfo, "admin") ? (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.all_challenges</T>
                  </h1>
                ) : (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.my_challenges</T>
                  </h1>
                )}
              </div>
              <ModalForEditList
                data={challenges}
                open={openChallengeEditListModal}
                setOpen={setOpenChallengeEditListModal}
                onClickEdit={goToEditChallenge}
                title={
                  hasRole(adminInfo, "admin")
                    ? get(strings, "adminv2.all_challenges", "All Challenges")
                    : get(strings, "adminv2.my_challenges", "My Challenges")
                }
                subtext={get(strings, "adminv2.challenge_id", "Challenge ID")}
                searchPlaceholder={get(
                  strings,
                  "adminv2.search_challenge",
                  "Search by challenge name",
                )}
                searchKeys={["challengeName"]}
                type="challenge"
              />
            </div>
          )}

          {hasAnyRole(adminInfo, ["admin", "nutrist"]) && (
            <div
              className="adminv2-selector-container"
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <div
                className="adminv2-selector"
                style={{ cursor: "pointer" }}
                onClick={() => setOpenRecipeEditListModal(true)}
              >
                {hasRole(adminInfo, "admin") ? (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.all_recipes</T>
                  </h1>
                ) : (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.my_recipes</T>
                  </h1>
                )}
              </div>
              <ModalForEditList
                data={recipes}
                open={openRecipeEditListModal}
                setOpen={setOpenRecipeEditListModal}
                onClickEdit={goToEditRecipe}
                title={
                  hasRole(adminInfo, "admin")
                    ? get(strings, "adminv2.all_recipes", "All Recipes")
                    : get(strings, "adminv2.my_recipes", "My Recipes")
                }
                subtext={get(strings, "adminv2.recipe_id", "Recipe ID")}
                searchPlaceholder={get(
                  strings,
                  "adminv2.search_recipe",
                  "Search by recipe name",
                )}
                searchKeys={["name"]}
                type="recipe"
              />
            </div>
          )}

          {hasAnyRole(adminInfo, ["admin", "blogger"]) && (
            <div
              className="adminv2-selector-container"
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              <div
                className="adminv2-selector"
                style={{ cursor: "pointer" }}
                onClick={goToAllBlogs}
              >
                {hasRole(adminInfo, "admin") ? (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.all_blogs</T>
                  </h1>
                ) : (
                  <h1
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    <T>adminv2.my_blogs</T>
                  </h1>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* modaks */}
      <ExerciseCreatorPopup
        open={openExerciseCreatorPopup}
        setOpen={(isOpen) => {
          setOpenExerciseCreatorPopup(isOpen);
          if (!isOpen) {
            // Clear selected exercise when modal closes
            setSelectedExerciseForEdit(null);
          }
        }}
        selectedExerciseForEdit={selectedExerciseForEdit}
        onSuccess={() => {
          setSelectedExerciseForEdit(null);
          fetchExercises();
        }}
      />
      <Footer />
    </div>
  );
}

export default withRouter(AdminDashboard);
