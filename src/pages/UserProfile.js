import React, { useState } from "react";
import "../assets/trainerprofile.css";
import "../assets/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { StarOutlined, ForwardOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
// import "react-modal-video/scss/modal-video.scss";

import ChallengeCard from "../components/Cards/ChallengeCard";
import { T } from "../components/Translate";

function UserProfile() {
  // eslint-disable-next-line
  const [trainer, setTrainer] = useState({
    id: 12313123123,
    name: "Anton Fekete",
    about:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    avatar:
      "https://realchallenge.fit/wp-content/uploads/2020/05/Nadine-de-Ruiter.jpg",
    challenges: [
      {
        name: "Danish challenge",
        picture:
          "https://realchallenge.fit/wp-content/uploads/2020/05/Didi-photo-1.jpg",
        rating: 5,
      },
      {
        name: "Danish challenge",
        picture:
          "https://realchallenge.fit/wp-content/uploads/2020/05/Didi-photo-1.jpg",
        rating: 5,
      },
      {
        name: "Englsih challenge",
        picture:
          "https://realchallenge.fit/wp-content/uploads/2020/05/Didi-photo-1.jpg",
        rating: 3,
      },
    ],
  });
  return (
    <div>
      <Navbar />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{ alignItems: "center" }}
        >
          <div className="profile-box" style={{ margin: 0 }}>
            <div
              className="profile-box-row1"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="profile-box-row1-avatar">
                <img src={trainer.avatar} alt="trainer-profile" />
              </div>
              <div className="profile-box-row1-information">
                <h2 className="font-heading-white">{trainer.name}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="trainer-profile-container-column2">
          <div className="trainer-profile-aboutme">
            <div
              className="trainer-profile-aboutme-heading font-paragraph-white"
              style={{ color: "#333b44", textTransform: "uppercase" }}
            >
              <T>user_profile.about_me</T>
            </div>
            <div className="trainer-profile-aboutme-container font-paragraph-white">
              {trainer.about}
            </div>
          </div>
          <div className="trainer-profile-challenges">
            <div
              className="trainer-profile-challenges-heading font-paragraph-white"
              style={{ color: "#333b44", textTransform: "uppercase" }}
            >
              <T>user_profile.challenges</T>
            </div>
            <div className="trainer-profile-challenges-container">
              {trainer.challenges.map((challenge) => (
                <Link to={`/trainers/${challenge.id}`}>
                  <ChallengeCard
                    picture={challenge.picture}
                    name={challenge.name}
                    rating={challenge.rating}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserProfile;
