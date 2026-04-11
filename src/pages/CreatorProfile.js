import React, { useState, useEffect, useContext } from "react";
import "../assets/creatorprofile.css";
import "../assets/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import ChallengeCard from "../components/Cards/ChallengeCard";
import {
  getCreatorById,
  getChallengesByUserId,
  getRecipesByUserId,
} from "../services/creator";
import { addCommentToTrainer, getTrainerGoalsByTrainerId } from "../services/trainers";
import QuoteIcon from "../assets/icons/quote-icon.png";
import ChallengeProfileSubtract from "../assets/icons/challenge-profile-subtract.svg";
import { Avatar, Input, message } from "antd";
import ShareIcon from "../assets/icons/share-icon.svg";
import moment from "moment";
import StarFilled from "../assets/icons/star-orange.svg";
import StartTransparent from "../assets/icons/star-transparent.svg";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
import { hasRole } from "../helpers/roleHelpers";

const getThumbnailLink = (thumbnail) => {
  if (!thumbnail) return "";
  if (typeof thumbnail === "string") return thumbnail.replace(/ /g, "%20");
  if (thumbnail.link) return thumbnail.link.replace(/ /g, "%20");
  return "";
};

const cleanIntensityName = (name, hasGroup) => {
  if (!hasGroup) return name;
  return name
    .replace(/\s*[\(\[](Easy|Medium|Hard)[\)\]]\s*$/i, "")
    .replace(/\s+(Easy|Medium|Hard)\s*$/i, "");
};

function CreatorProfile(props) {
  const { language } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [filterChallenges, setFilterChallenges] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [filterRecipes, setFilterRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState({});
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [allComments, setAllComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentButtonLoading, setCommentButtonLoading] = useState(false);
  const [fitnessInterests, setFitnessInterests] = useState([]);

  const isTrainer = hasRole(creator, "trainer");
  const isNutrist = hasRole(creator, "nutrist");

  async function fetchData() {
    setLoading(true);
    const id = props.match.params.id;
    const res = await getCreatorById(id);
    if (!res || !res.creator) {
      setLoading(false);
      return;
    }
    const user = res.creator;
    setCreator(user);
    setAllComments(user.comments || []);

    const userIsTrainer = hasRole(user, "trainer");
    const userIsNutrist = hasRole(user, "nutrist");

    if (userIsTrainer) {
      const challengesRes = await getChallengesByUserId(id);
      const chs = challengesRes?.challenges || [];
      const rated = chs.filter((g) => g.rating > 0);
      let overR = 0;
      for (let i = 0; i < rated.length; i++) overR += rated[i].rating;
      setCalculatedRating(rated.length ? overR / rated.length : 0);
      setChallenges(chs);
      setFilterChallenges(
        chs.filter((c) => !c.language || c.language === language)
      );

      const goalsRes = await getTrainerGoalsByTrainerId(id, language);
      setFitnessInterests(goalsRes.goals || []);
    }

    if (userIsNutrist) {
      const recipesRes = await getRecipesByUserId(id);
      const rcps = recipesRes?.recipes || [];
      setRecipes(rcps);
      setFilterRecipes(
        rcps.filter((r) => !r.language || r.language === language)
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Re-filter challenges when language changes
  useEffect(() => {
    setFilterChallenges(
      challenges.filter((c) => !c.language || c.language === language)
    );
  }, [language, challenges]);

  // Re-filter recipes when language changes
  useEffect(() => {
    setFilterRecipes(
      recipes.filter((r) => !r.language || r.language === language)
    );
  }, [language, recipes]);

  // Re-fetch fitness interests when language changes (trainer only)
  useEffect(() => {
    const id = props.match.params.id;
    if (id && isTrainer) {
      getTrainerGoalsByTrainerId(id, language).then((res) => {
        setFitnessInterests(res.goals || []);
      });
    }
    // eslint-disable-next-line
  }, [language, isTrainer]);

  const postCommentToBackend = async () => {
    setCommentButtonLoading(true);
    const res = await addCommentToTrainer(creator._id, commentText);
    if (res) {
      setAllComments(res.comments);
    }
    setCommentButtonLoading(false);
    setCommentText("");
  };

  const hasContentSection = isTrainer || isNutrist;

  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${creator.firstName || ""}`}</title>
        <meta name="description" content={creator.motto} />
        <meta property="og:title" content={creator.firstName} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={creator.motto} />
        <meta
          property="og:url"
          content={`${window.location.origin}/creator/${slug(
            creator.firstName || ""
          )}/${creator._id}`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            backgroundImage: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39))${
              creator.heroBanner
                ? `, url(${creator.heroBanner.replaceAll(" ", "%20")})`
                : ""
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="profile-box">
            <div className="profile-box-row1">
              <div className="profile-box-row1-avatar">
                <img
                  src={`${
                    creator.avatarLink
                      ? creator.avatarLink.replaceAll(" ", "%20")
                      : ""
                  }`}
                  alt="creator-profile"
                />
              </div>
              <div className="profile-box-row1-information">
                <h2
                  className="font-heading-white"
                  style={{ margin: "0", padding: "0" }}
                >
                  {creator.firstName ? creator.firstName : ""}{" "}
                  {creator.lastName ? creator.lastName : ""}
                </h2>

                <div style={{ paddingTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <p
                      className="font-paragraph-white"
                      style={{ margin: "0", padding: "0" }}
                    >
                      {creator.country ? creator.country : ""}
                    </p>
                    <img
                      src={ShareIcon}
                      alt="share"
                      style={{
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const url = `${window.location.origin}/creator/${slug(
                          creator.firstName || ""
                        )}/${creator._id}`;
                        navigator.clipboard
                          .writeText(url)
                          .then(() => {
                            message.success("Profile link copied!");
                          })
                          .catch(() => {
                            message.error("Failed to copy link");
                          });
                      }}
                      title="Copy profile link"
                    />
                  </div>
                  {isTrainer && (
                    <>
                      {new Array(calculatedRating ? calculatedRating : 0)
                        .fill(0)
                        .map((_, i) => (
                          <img
                            key={`sf-${i}`}
                            src={StarFilled}
                            alt=""
                            style={{ height: "20px", margin: "2px" }}
                          />
                        ))}
                      {new Array(calculatedRating ? 5 - calculatedRating : 5)
                        .fill(0)
                        .map((_, i) => (
                          <img
                            key={`st-${i}`}
                            src={StartTransparent}
                            alt=""
                            style={{ height: "20px", margin: "2px" }}
                          />
                        ))}
                    </>
                  )}
                </div>
              </div>
              <div className="profile-box-row1-playericon">
                <img
                  src={ChallengeProfileSubtract}
                  alt=""
                  onClick={() => setOpen(true)}
                />
              </div>
            </div>
            <div className="profile-box-row2">
              <div className="profile-box-row2-quote font-paragraph-white">
                <img src={QuoteIcon} alt="" />
                <span style={{ marginLeft: "10px" }}>
                  {(language === "dutch" ? creator.motto_nl : creator.motto_en) ||
                    creator.motto ||
                    ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="trainer-profile-container-column2">
          {isTrainer && (
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#333b44", textTransform: "uppercase" }}
              >
                <T>trainer_profile.fitness_interests</T>
              </div>
              <div className="trainer-profile-goals-container">
                {fitnessInterests.map((goal) => (
                  <div
                    className="trainer-profile-goal font-paragraph-white"
                    key={goal._id}
                  >
                    {goal.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="trainer-profile-aboutme">
            <div
              className="trainer-profile-aboutme-heading font-paragraph-white"
              style={{ color: "#333b44", textTransform: "uppercase" }}
            >
              <T>trainer_profile.about_me</T>
            </div>
            <div className="trainer-profile-aboutme-container font-paragraph-white">
              {(language === "dutch" ? creator.bio_nl : creator.bio_en) ||
                creator.bio ||
                ""}
            </div>
          </div>

          {isTrainer && (
            <div className="trainer-profile-challenges">
              <div
                className="trainer-profile-challenges-heading font-paragraph-white"
                style={{ color: "#333b44", textTransform: "uppercase" }}
              >
                <T>trainer_profile.challenges</T>
              </div>
              <div className="trainer-profile-challenges-container">
                <Input
                  style={{
                    margin: "10px",
                    backgroundColor: "#262D36",
                    color: "#fff",
                  }}
                  onChange={(e) => {
                    const searchVal = e.target.value.toLowerCase();
                    const g = challenges.filter(
                      (c) =>
                        (!c.language || c.language === language) &&
                        c.challengeName.toLowerCase().includes(searchVal)
                    );
                    setFilterChallenges(g);
                  }}
                  placeholder="Search challenge"
                />
                {filterChallenges.length === 0 ? (
                  <div
                    className="font-paragraph-white"
                    style={{
                      padding: "20px 10px",
                      color: "#82868b",
                      fontSize: "14px",
                    }}
                  >
                    <T>trainer_profile.no_challenges</T>
                  </div>
                ) : (
                  filterChallenges.map((challenge) => (
                    <Link
                      to={`/challenge/${slug(challenge.challengeName)}/${
                        challenge._id
                      }`}
                      key={challenge._id}
                    >
                      <ChallengeCard
                        picture={getThumbnailLink(challenge.thumbnailLink)}
                        name={cleanIntensityName(
                          challenge.challengeName,
                          !!challenge.intensityGroupId ||
                            !!challenge.intensityVariants
                        )}
                        rating={challenge.rating}
                        newc={false}
                        hasIntensityGroup={
                          !!challenge.intensityGroupId ||
                          !!challenge.intensityVariants
                        }
                        intensityLevels={challenge.intensityVariants?.length}
                        intensity={challenge.intensity}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {isNutrist && (
            <div className="trainer-profile-challenges">
              <div
                className="trainer-profile-challenges-heading font-paragraph-white"
                style={{ color: "#333b44", textTransform: "uppercase" }}
              >
                <T>trainer_profile.recipes</T>
              </div>
              <div className="trainer-profile-challenges-container">
                <Input
                  style={{
                    margin: "10px",
                    backgroundColor: "#262D36",
                    color: "#fff",
                  }}
                  onChange={(e) => {
                    const searchVal = e.target.value.toLowerCase();
                    const g = recipes.filter(
                      (r) =>
                        (!r.language || r.language === language) &&
                        (r.name || "").toLowerCase().includes(searchVal)
                    );
                    setFilterRecipes(g);
                  }}
                  placeholder="Search recipe"
                />
                {filterRecipes.length === 0 ? (
                  <div
                    className="font-paragraph-white"
                    style={{
                      padding: "20px 10px",
                      color: "#82868b",
                      fontSize: "14px",
                    }}
                  >
                    <T>trainer_profile.no_recipes</T>
                  </div>
                ) : (
                  filterRecipes.map((recipe) => (
                    <Link
                      to={`/recipe/${slug(recipe.name || "")}/${recipe._id}`}
                      key={recipe._id}
                    >
                      <ChallengeCard
                        picture={
                          recipe.image
                            ? recipe.image.replaceAll(" ", "%20")
                            : ""
                        }
                        name={recipe.name}
                        rating={recipe.rating}
                        newc={false}
                        preprationTime={recipe.prepTime}
                        recipe={true}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {hasContentSection && (
            <div
              className="trainer-profile-goals"
              style={{ borderBottom: "1px solid transparent" }}
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
              {allComments.map((c, idx) => (
                <div className="comment-container" key={c._id || idx}>
                  <div className="comment-container-c1 font-paragraph-white">
                    <Avatar src={c.user?.avatarLink} shape="square" />{" "}
                    <span style={{ marginLeft: "5px" }}>
                      {c.user?.username}
                    </span>
                    <div className="comment-container-c2 font-paragraph-white">
                      {c.text}
                    </div>
                  </div>

                  <div
                    className="font-paragraph-white comment-container-c3"
                    style={{ color: "#82868b" }}
                  >
                    {moment(c.createdAt).format("MMM, Do YY")}
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
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withRouter(CreatorProfile);
