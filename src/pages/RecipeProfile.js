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
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Avatar, Input, Modal, Rate } from "antd";

import { withRouter } from "react-router-dom";
import {
  getRecipeById,
  favouriteRecipeById,
  addRecipeComment,
} from "../services/recipes";
import { userInfoContext } from "../contexts/UserStore";
import ChallengeReviewModal from "../components/Challenge/ChallengeReviewModal";
import ReviewsModal from "../components/Common/ReviewsModal";
import moment from "moment";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
{
  /* todo later */
}
// import ReactHtmlParser from "react-html-parser";

function RecipeProfile(props) {
  const { language, updateLanguage } = useContext(LanguageContext);
  const [allComments, setAllComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentButtonLoading, setCommentButtomLoading] = useState(false);
  const [userInfo, serUserInfo] = useContext(userInfoContext);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line
  const [recipe, setRecipe] = useState({});

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    if (Object.keys(recipe).length > 0) {
      if (recipe.language === language) {
      } else {
        if (recipe.alternativeLanguage) {
          window.location.href = `${
            process.env.REACT_APP_FRONTEND_SERVER
          }/recipe/${slug(recipe.alternativeLanguage.name)}/${
            recipe.alternativeLanguage._id
          }`;
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
              process.env.REACT_APP_SERVER
            }/uploads/${
              recipe.image ? recipe.image.replaceAll(" ", "%20") : ""
            })`,
            backgroundSize: "100% 100vh",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="profile-box">
            <div
              className="challenge-profile-box-1"
              style={{ borderBottom: "2px solid #222932", textAlign: "left" }}
            >
              <h1
                className="font-heading-white"
                style={{
                  fontSize: "4rem",
                }}
              >
                {recipe.name}
              </h1>
            </div>
            <div className="challenge-profile-box-2">
              <div className="challenge-profile-box-2-rating">
                {console.log("rating", recipe)}
                <div style={{ padding: "5px" }}>
                  <Rate value={recipe.rating} allowHalf disabled={true} />
                  {/* {new Array(recipe.rating ? recipe.rating : 1)
                    .fill(0)
                    .map(() => (
                      <StarOutlined
                        style={{
                          color: "var(--color-orange)",
                          fontSize: "2rem",
                        }}
                      />
                    ))} */}
                </div>
                <span onClick={() => setReviewOpen(true)}>
                  <T>recipe_profile.reviews</T>
                </span>
                {localStorage.getItem("jwtToken") ? (
                  <div className="recipe-likes">
                    <HeartFilled
                      onClick={() => favouriteRecipe(recipe._id)}
                      style={{ fontSize: "3rem", cursor: "pointer" }}
                    />{" "}
                    {recipe.likes}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="challenge-profile-box-2-info">
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
                  type: "Carbohydrates",
                  quantity: recipe.carbohydrate ? recipe.carbohydrate : "",
                },
                {
                  type: "Protein",
                  quantity: recipe.protein ? recipe.protein : "",
                },
                {
                  type: "Fat",
                  quantity: recipe.fat ? recipe.fat : "",
                },
                {
                  type: "Fiber",
                  quantity: recipe.fiber ? recipe.fiber : "",
                },
              ].map((value) => (
                <div className="recipe-mealValues-container-box">
                  <span>{value.type}</span>
                  <span>{value.quantity} g</span>
                </div>
              ))}
            </div>
          </div>
          {/* sdadasd */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.short_info</T>
            </div>
            <div className="recipe-mealValues-info">
              {/* todo later */}
              {/* {recipe.description ? ReactHtmlParser(recipe.description) : ""} */}
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
                      {line.weight ? `${line.weight}g` : line.weight}{" "}
                      {line.volume ? `${line.volume}ml` : line.volume}
                      {line.pieces ? ` ${line.pieces} piece` : line.pieces}
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
            <div
              className="recipe-mealValues-info"
              style={{
                backgroundColor: "#ffeee0",
                minHeight: "100px",
                padding: "10px",
              }}
            >
              {/* {ReactHtmlParser(recipe?.tips)} */}
            </div>
          </div>
          {/* sdasdasdas */}
          <div className="recipe-mealValues">
            <div className="recipe-mealValues-heading font-paragraph-white">
              <T>recipe_profile.notes</T>
            </div>
            <div
              className="recipe-mealValues-info"
              style={{
                backgroundColor: "#ffeee0",
                minHeight: "100px",
                padding: "10px",
                listStyle: "none",
              }}
            >
              {/* todo later */}
              {/* {ReactHtmlParser(recipe?.notes)} */}
            </div>
          </div>
          {/* sdasdasdas */}
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
          <div
            className="trainer-profile-goals"
            style={{
              borderBottom: "1px solid transparent",
              backgroundColor: "#e1e9f2",
              padding: "10px",
            }}
          >
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{
                color: "#72777B",
                textTransform: "uppercase",
              }}
            >
              <T>challenge_profile.comments</T>
            </div>
            {allComments.map((c) => (
              <div className="comment-container">
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
