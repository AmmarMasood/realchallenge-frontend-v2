import React, { useState, useEffect, useContext } from "react";
import "../assets/trainerprofile.css";
import "../assets/home.css";
import "../assets/challengeProfile.css";
import "../assets/recipeProfile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  StarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  LikeOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Avatar, Input, Modal, Rate, message } from "antd";
import ShareIcon from "../assets/icons/share-icon.svg";
import ClapOrange from "../assets/icons/clap-orange.svg";
import ClapGray from "../assets/icons/clap-gray.svg";
import ProteinIcon from "../assets/icons/protein_icon.svg";
import FatIcon from "../assets/icons/fat_Icon.svg";
import CarbIcon from "../assets/icons/carb_icon.svg";
import FiberIcon from "../assets/icons/fiber_icon.svg";
import NoteIcon from "../assets/icons/note_icon.svg";
import RelatedProductIcon from "../assets/icons/releated_product_icon.svg";
import TipIcon from "../assets/icons/tip_icon.svg";
import ShoppingIcon from "../assets/icons/shopping_cart_icon.svg";
import LoveIcon from "../assets/icons/love_icon.svg";

import { hasRole } from "../helpers/roleHelpers";
import { withRouter } from "react-router-dom";
import {
  getRecipeById,
  favouriteRecipeById,
  addRecipeComment,
  getRecipeByTranslationKey,
  clapRecipe as clapRecipeApi,
  unclapRecipe as unclapRecipeApi,
} from "../services/recipes";
import { userInfoContext } from "../contexts/UserStore";
import ChallengeReviewModal from "../components/Challenge/ChallengeReviewModal";
import ReviewsModal from "../components/Common/ReviewsModal";
import moment from "moment";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
// HTML content renderer (replaces ReactHtmlParser)
const HtmlContent = ({ html }) =>
  html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;

function RecipeProfile(props) {
  const { language, updateLanguage } = useContext(LanguageContext);
  const [allComments, setAllComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentButtonLoading, setCommentButtomLoading] = useState(false);
  const [userInfo, serUserInfo] = useContext(userInfoContext);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translationNotAvailable, setTranslationNotAvailable] = useState(false);

  // eslint-disable-next-line
  const [recipe, setRecipe] = useState({});

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    if (Object.keys(recipe).length > 0) {
      if (recipe.language === language) {
        // Language matches, re-fetch to get latest data (e.g. after review/comment)
        setTranslationNotAvailable(false);
        const res = await getRecipeById(recipe._id);
        if (res) {
          setAllComments(res.comments);
          setRecipe(res);
        }
      } else {
        // Use translationKey to find the recipe in the selected language
        if (recipe.translationKey) {
          const translatedRecipe = await getRecipeByTranslationKey(
            recipe.translationKey,
            language,
          );
          if (translatedRecipe && translatedRecipe.recipe) {
            setTranslationNotAvailable(false);
            window.location.href = `${
              process.env.REACT_APP_FRONTEND_SERVER
            }/recipe/${slug(translatedRecipe.recipe.name)}/${
              translatedRecipe.recipe._id
            }`;
          } else {
            // No translation available — show banner
            setTranslationNotAvailable(true);
          }
        } else {
          // No translationKey at all
          setTranslationNotAvailable(true);
        }
      }
    } else {
      const id = props.match.params.id;
      setLoading(true);
      const res = await getRecipeById(id);
      if (res) {
        setAllComments(res.comments);
        setRecipe(res);
        setLoading(false);
        updateLanguage(res.language);
        console.log(res);
      }
    }
  };

  const postCommentToBackend = async () => {
    setCommentButtomLoading(true);
    const res = await addRecipeComment(recipe._id, commentText);

    if (res) {
      setAllComments(res.comments);
    }
    setCommentButtomLoading(false);
    setCommentText("");
  };

  const favouriteRecipe = async (id) => {
    await favouriteRecipeById({ recipeId: id }, userInfo.id);
  };

  const isCreator = () => {
    if (!userInfo || !recipe.user) return false;
    const recipeUserId =
      typeof recipe.user === "object" ? recipe.user._id : recipe.user;
    return userInfo.id === recipeUserId?.toString();
  };

  const hasClapped = () => {
    if (!userInfo || !recipe.claps) return false;
    return recipe.claps.some((c) => c.user === userInfo.id);
  };

  const handleClap = async (id) => {
    if (hasClapped()) {
      const res = await unclapRecipeApi(id);
      if (res) {
        setRecipe({ ...recipe, claps: res });
      }
    } else {
      const res = await clapRecipeApi(id);
      if (res) {
        setRecipe({ ...recipe, claps: res });
      }
    }
  };
  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${recipe.name}`}</title>
        <meta name="description" content={recipe.description} />
        <meta property="og:title" content={recipe.name} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={recipe.description} />
        <meta
          property="og:url"
          content={`http://localhost:3001/recipe/${slug(recipe.name)}/${
            recipe._id
          }`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar color="dark" />
      {translationNotAvailable && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#2D3239",
            borderLeft: "3px solid #f37720",
            borderRadius: "6px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            maxWidth: "fit-content",
          }}
        >
          <span className="font-paragraph-white" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
            {language === "dutch"
              ? `Alleen beschikbaar in het ${
                  recipe.language === "english" ? "Engels" : "Nederlands"
                }`
              : `Only available in ${
                  recipe.language === "dutch" ? "Dutch" : recipe.language
                }`}
          </span>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => props.history.push("/recipes")}
              style={{
                background: "transparent",
                border: "1px solid #72777B",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
              className="font-paragraph-white"
            >
              {language === "dutch" ? "Overzicht" : "Overview"}
            </button>
            <button
              onClick={() => updateLanguage(recipe.language)}
              style={{
                background: "#f37720",
                border: "none",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
              className="font-paragraph-white"
            >
              {language === "dutch"
                ? `Bekijk in ${
                    recipe.language === "english" ? "Engels" : "Nederlands"
                  }`
                : `View in ${
                    recipe.language === "dutch" ? "Dutch" : recipe.language
                  }`}
            </button>
          </div>
        </div>
      )}
      <ReviewsModal
        visible={reviewOpen}
        setVisible={setReviewOpen}
        item={recipe}
        type="recipes"
        fetchData={fetchData}
      />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${
              recipe.image ? recipe.image.replaceAll(" ", "%20") : ""
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="profile-box">
            <div
              className="challenge-profile-box-1"
              style={{ borderBottom: "2px solid #222932", textAlign: "left" }}
            >
              <h1
                className="font-paragraph-white"
                style={{
                  fontWeight: 600,
                  fontSize: "29px",
                  lineHeight: "100%",
                  marginLeft: "5px",
                }}
              >
                {recipe.name}
              </h1>
            </div>
            <div className="challenge-profile-box-2">
              <div className="challenge-profile-box-2-rating">
                <div style={{ padding: "5px" }}>
                  <Rate value={recipe.rating} allowHalf disabled={true} />
                </div>
                <span onClick={() => setReviewOpen(true)}>
                  <T>recipe_profile.reviews</T>
                </span>
              </div>
              <div className="challenge-profile-box-2-info">
                <div style={{ display: "flex", gap: "5px" }}>
                  {recipe.mealTypes
                    ? recipe.mealTypes.map((meal) => (
                        <div
                          className="challenge-profile-box-2-container"
                          style={{ opacity: "0.7" }}
                        >
                          {meal.name}
                        </div>
                      ))
                    : ""}
                  {recipe.kCalPerPerson ? (
                    <div
                      className="challenge-profile-box-2-container"
                      style={{ opacity: "0.7" }}
                    >
                      {recipe.kCalPerPerson + " KCAL"}
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                {recipe._id && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={ShareIcon}
                      alt="share"
                      style={{
                        width: "34px",
                        height: "34px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const url = `${window.location.origin}/recipe/${slug(
                          recipe.name || "",
                        )}/${recipe._id}`;
                        navigator.clipboard
                          .writeText(url)
                          .then(() => {
                            message.success("Recipe link copied!");
                          })
                          .catch(() => {
                            message.error("Failed to copy link");
                          });
                      }}
                      title="Copy recipe link"
                    />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor:
                          localStorage.getItem("jwtToken") && !isCreator()
                            ? "pointer"
                            : "default",
                      }}
                      className="challenge-profile-box-2-container"
                      onClick={() => {
                        if (localStorage.getItem("jwtToken") && !isCreator()) {
                          handleClap(recipe._id);
                        }
                      }}
                      title={
                        !localStorage.getItem("jwtToken")
                          ? "Login to clap"
                          : isCreator()
                            ? "Cannot clap your own recipe"
                            : hasClapped()
                              ? "Remove clap"
                              : "Clap this recipe"
                      }
                    >
                      <img
                        src={hasClapped() ? ClapOrange : ClapGray}
                        alt="clap"
                        style={{
                          width: "23px",
                          height: "23px",
                          filter: hasClapped()
                            ? "none"
                            : "brightness(0) invert(1)",
                        }}
                      />
                      <span
                        className="font-paragraph-white"
                        style={{ marginLeft: "5px", fontSize: "14px" }}
                      >
                        {recipe.claps && recipe.claps.length > 0
                          ? `+ ${recipe.claps.length}`
                          : ""}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="challenge-profile-box-2-info">
                {recipe.prepTime ? (
                  <div className="recipe-info-block">
                    <ClockCircleOutlined
                      style={{ color: "var(--color-orange)" }}
                    />{" "}
                    {recipe.prepTime} <T>recipe_profile.minutes</T>
                  </div>
                ) : (
                  ""
                )}
                {recipe.persons ? (
                  <div className="recipe-info-block">
                    <UserOutlined style={{ color: "var(--color-orange)" }} />{" "}
                    {recipe.persons} <T>recipe_profile.persons</T>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="recipe-profile-container-column2">
          {/* hree we go */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.meal_values</T>
            </div>
            <div className="recipe-mealValues-container">
              {[
                {
                  type: "Protein",
                  quantity: recipe.protein,
                  icon: ProteinIcon,
                },
                {
                  type: "Carbohydrates",
                  quantity: recipe.carbohydrate,
                  icon: CarbIcon,
                },
                {
                  type: "Fat",
                  quantity: recipe.fat,
                  icon: FatIcon,
                },
                {
                  type: "Fiber",
                  quantity: recipe.fiber,
                  icon: FiberIcon,
                },
              ].map((value, i) => (
                <div className="recipe-mealValues-container-box" key={i}>
                  <span>{value.type}</span>
                  <span>
                    <img
                      src={value.icon}
                      alt={value.type}
                      className="recipe-mealValues-icon"
                      style={{ marginRight: "10px" }}
                    ></img>
                    <span style={{ fontWeight: "600" }}>
                      {value.quantity != null ? value.quantity : ""} g
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* sdadasd */}
          <div className="recipe-mealValues">
            <div
              className="recipe-mealValues-heading font-paragraph-white"
              style={{ marginBottom: "5px" }}
            >
              <T>recipe_profile.short_info</T>
            </div>
            <div className="recipe-mealValues-info">
              <HtmlContent html={recipe.description} />
            </div>
          </div>
          {/* asdasdasd */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.ingredients</T>
            </div>
            <div className="recipe-ingredients-box">
              {recipe.ingredients &&
                recipe.ingredients.map((line, i) => (
                  <div className="recipe-mealValues-info recipe-ingredients-box-line">
                    <span>
                      {line.name ? line.name.name : ""}{" "}
                      {line.method && `(${line.method})`}
                    </span>
                    <span>
                      {line.weight != null && line.weight !== ""
                        ? `${line.weight} g`
                        : ""}
                      {line.volume != null && line.volume !== ""
                        ? ` ${line.volume} ml`
                        : ""}
                      {line.pieces != null && line.pieces !== ""
                        ? ` ${line.pieces} piece`
                        : ""}
                      {line.other ? ` ${line.other}` : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          {/* sdcsadas */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.prepration</T>
            </div>
            <div className="recipe-prepration-box">
              {recipe.cookingProcess
                ? recipe.cookingProcess.map((line, i) => (
                    <div className="recipe-mealValues-info recipe-prepration-box-line">
                      <span className="recipe-mealValues-info-number">
                        {i + 1}
                      </span>{" "}
                      {line}
                    </div>
                  ))
                : ""}
            </div>
          </div>
          {/* dasdasdsad */}
          {/* dasdasdsad */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.tips</T>
            </div>
            <div className="recipe-highlight-box recipe-tips-box">
              <div className="recipe-highlight-icon">
                <img src={TipIcon} alt="tips" />
              </div>
              <div className="recipe-highlight-content">
                <HtmlContent html={recipe?.tips} />
              </div>
            </div>
          </div>
          {/* sdasdasdas */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.notes</T>
            </div>
            <div className="recipe-highlight-box recipe-notes-box">
              <div className="recipe-highlight-icon">
                <img src={NoteIcon} alt="tips" />
              </div>
              <div className="recipe-highlight-content">
                <HtmlContent html={recipe?.notes} />
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          {localStorage.getItem("jwtToken") && !isCreator() && hasRole(userInfo, "customer") && (
            <div className="recipe-action-buttons">
              <button
                className="recipe-love-button"
                onClick={() => favouriteRecipe(recipe._id)}
              >
                <img src={LoveIcon} alt="love" /> <T>recipe_profile.love</T>
              </button>
              <button
                className="recipe-shopping-button"
                style={{ background: "#19B97F" }}
              >
                <img src={ShoppingIcon} alt="tips" />{" "}
                <T>recipe_profile.add_to_shopping_list</T>
              </button>
            </div>
          )}
          {/* Get Full Nutrition Advice CTA */}
          <div className="recipe-nutrition-cta">
            <Link to="/challenges" className="recipe-nutrition-cta-button">
              <T>recipe_profile.get_full_nutrition_advice</T>
            </Link>
          </div>
          {/* <div className="trainer-profile-goals">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.comments</T>
            </div>
            <div
              className="trainer-profile-goals-container"
              style={{ backgroundColor: "#e1e9f2" }}
            > */}
          {/* {.map((comment) => (
                <div
                  className="challenge-profile-comment font-paragraph-white"
                  style={{ backgroundColor: "transparent" }}
                >
                  <span className="challenge-profile-comment-username">
                    <UserOutlined /> {comment.username}
                  </span>
                  <span style={{ color: "black" }}>{comment.comment}</span>
                </div>
              ))} */}
          {recipe.allowComments && (
            <div
              className="trainer-profile-goals"
              style={{
                borderBottom: "1px solid transparent",
                // backgroundColor: "#e1e9f2",
                padding: "10px",
              }}
            >
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{
                  color: "#ff7700",
                  textTransform: "uppercase",
                }}
              >
                <T>challenge_profile.comments</T>
              </div>
              {allComments.map((c) => (
                <div className="comment-container" key={c._id}>
                  <div className="comment-container-c1 font-paragraph-black">
                    <Avatar src={c.user.avatarLink} shape="square" />{" "}
                    <span style={{ marginLeft: "5px" }}>{c.user.username}</span>
                    <div className="comment-container-c2 font-paragraph-black">
                      {c.text}
                    </div>
                  </div>

                  <div
                    className="font-paragraph-white comment-container-c3"
                    style={{ color: "#82868b" }}
                  >
                    {moment(c.createdAt).format("MMM, Do YYYY")}
                  </div>
                </div>
              ))}
              {localStorage.getItem("jwtToken") && (
                <>
                  <div
                    className="trainer-profile-goals-container"
                    style={{ marginTop: "10px" }}
                  >
                    <Input.TextArea
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </div>
                  {commentButtonLoading ? (
                    <LoadingOutlined
                      style={{
                        color: "#ff7700",
                        fontSize: "30px",
                        marginTop: "10px",
                      }}
                    />
                  ) : (
                    <button
                      className="common-transparent-button font-paragraph-white"
                      onClick={postCommentToBackend}
                      style={{
                        color: "#ff7700",
                        borderColor: "#ff7700",
                        marginTop: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <T>common.postComment</T>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {/* </div>
          </div> */}
          {!localStorage.getItem("jwtToken") && (
            <div style={{ textAlign: "center", paddingTop: "10px" }}>
              <Link
                className="home-button font-paragraph-white"
                to="/challenges"
                style={{ width: "80%" }}
              >
                <span className="home-button-text">
                  <T>recipe_profile.start_today</T> <ArrowRightOutlined />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default withRouter(RecipeProfile);
