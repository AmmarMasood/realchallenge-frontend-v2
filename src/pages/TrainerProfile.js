import React, { useState, useEffect } from "react";
import "../assets/trainerprofile.css";
import "../assets/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
// import ModalVideo from "react-modal-video";
// import "react-modal-video/scss/modal-video.scss";
import ChallengeCard from "../components/Cards/ChallengeCard";
import { addCommentToTrainer, getTrainerById } from "../services/trainers";
import QuoteIcon from "../assets/icons/quote-icon.png";
import ChallengeProfileSubtract from "../assets/icons/challenge-profile-subtract.svg";
import { Avatar, Input } from "antd";
import moment from "moment";
import StarFilled from "../assets/icons/star-orange.svg";
import StartTransparent from "../assets/icons/star-transparent.svg";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";

function TrainerProfile(props) {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line
  const [challenges, setChallenges] = useState([]);
  const [filterChallenges, setFilterChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trainer, setTrainer] = useState({});
  const [calculatedRating, setCalculatedRating] = useState(0);
  // comments
  const [allComments, setAllComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentButtonLoading, setCommentButtonLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const id = props.match.params.id;
    const res = await getTrainerById(id);
    const c = res.challenges.filter((g) => g.rating > 0);
    console.log(res);

    var overR = 0;
    for (var i = 0; i < c.length; i++) {
      overR += c[i].rating;
    }
    setCalculatedRating(overR / c.length);
    setTrainer(res.trainer);
    setChallenges(res.challenges);
    setFilterChallenges(res.challenges);
    setAllComments(res.trainer.comments);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const postCommentToBackend = async () => {
    setCommentButtonLoading(true);
    const res = await addCommentToTrainer(trainer._id, commentText);

    if (res) {
      setAllComments(res.comments);
    }
    setCommentButtonLoading(false);
    setCommentText("");
    // console.log(res);
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
          content={`http://localhost:3001/trainer/${slug(trainer.firstName)}/${
            trainer._id
          }`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar />
      {/* video modal */}
      {/* todo do later */}
      {/* <ModalVideo
        channel="custom"
        autoplay
        isOpen={open}
        controlsList="nodownload"
        videoId={`${process.env.REACT_APP_SERVER}/uploads/${trainer.videoTrailerLink}`}
        onClose={() => setOpen(false)}
      /> */}
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${
              process.env.REACT_APP_SERVER
            }/uploads/${
              trainer.heroBanner
                ? trainer.heroBanner.replaceAll(" ", "%20")
                : ""
            })`,
            backgroundSize: "100% 100vh",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
          {console.log(
            `${process.env.REACT_APP_SERVER}/uploads/${
              trainer.heroBanner
                ? trainer.heroBanner.replaceAll(" ", "%20")
                : ""
            }`
          )}
          <div className="profile-box">
            <div className="profile-box-row1">
              <div className="profile-box-row1-avatar">
                <img
                  src={`${process.env.REACT_APP_SERVER}/uploads/${
                    trainer.avatarLink
                      ? trainer.avatarLink.replaceAll(" ", "%20")
                      : ""
                  }`}
                  alt="trainer-profile"
                />
              </div>
              <div className="profile-box-row1-information">
                <h2
                  className="font-heading-white"
                  style={{ margin: "0", padding: "0" }}
                >
                  {trainer.firstName ? trainer.firstName : ""}{" "}
                  {trainer.lastName ? trainer.lastName : ""}
                </h2>

                <div style={{ paddingTop: "20px" }}>
                  <p
                    className="font-paragraph-white"
                    style={{ margin: "0", padding: "0" }}
                  >
                    {trainer.country ? trainer.country : ""}
                  </p>
                  {new Array(calculatedRating ? calculatedRating : 0)
                    .fill(0)
                    .map(() => (
                      <img
                        src={StarFilled}
                        alt=""
                        style={{ height: "20px", margin: "2px" }}
                      />
                    ))}
                  {new Array(calculatedRating ? 5 - calculatedRating : 5)
                    .fill(0)
                    .map(() => (
                      <img
                        src={StartTransparent}
                        alt=""
                        style={{ height: "20px", margin: "2px" }}
                      />
                    ))}
                </div>
                <div>
                  {/* {new Array(trainer.rating).fill(0).map((e) => (
                    <StarOutlined
                      style={{ color: "#ff7700", textTransform: "uppercase" }}
                      className="challenge-carousel-body-textbox-icons"
                    />
                  ))} */}
                </div>
              </div>
              <div className="profile-box-row1-playericon">
                <img
                  src={ChallengeProfileSubtract}
                  onClick={() => setOpen(true)}
                />
              </div>
            </div>
            <div className="profile-box-row2">
              <div className="profile-box-row2-quote font-paragraph-white">
                <img src={QuoteIcon} alt="" />
                <span style={{ marginLeft: "10px" }}>
                  {trainer.motto ? trainer.motto : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="trainer-profile-container-column2">
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#333b44", textTransform: "uppercase" }}
            >
              Fitness Interests
            </div>
            <div className="trainer-profile-goals-container">
              {/* TODO */}
              {trainer.trainersFitnessInterest
                ? trainer.trainersFitnessInterest.map((goal) => (
                    <div
                      className="trainer-profile-goal font-paragraph-white"
                      key={goal._id}
                    >
                      {goal.name}
                    </div>
                  ))
                : ""}
            </div>
          </div>

          <div className="trainer-profile-aboutme">
            <div
              className="trainer-profile-aboutme-heading font-paragraph-white"
              style={{ color: "#333b44", textTransform: "uppercase" }}
            >
              <T>trainer_profile.about_me</T>
            </div>
            <div className="trainer-profile-aboutme-container font-paragraph-white">
              {trainer.bio ? trainer.bio : ""}
            </div>
          </div>
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
                  const g = challenges.filter((c) =>
                    c.challengeName
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                  );
                  setFilterChallenges(g);
                }}
                placeholder="Search challenge"
              />
              {/* TODO  */}
              {filterChallenges.map((challenge) => (
                <Link
                  to={`/challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                  key={challenge._id}
                >
                  <ChallengeCard
                    picture={`${process.env.REACT_APP_SERVER}/uploads/${
                      challenge.thumbnailLink
                        ? challenge.thumbnailLink.replaceAll(" ", "%20")
                        : ""
                    }`}
                    name={challenge.challengeName}
                    rating={challenge.rating}
                  />
                </Link>
              ))}
            </div>
          </div>

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
            {allComments.map((c) => (
              <div className="comment-container">
                <div className="comment-container-c1 font-paragraph-white">
                  <Avatar src={c.user.avatarLink} shape="square" />{" "}
                  <span style={{ marginLeft: "5px" }}>{c.user.username}</span>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withRouter(TrainerProfile);
