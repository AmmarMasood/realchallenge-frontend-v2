import React, { useState, useEffect } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Input, Collapse } from "antd";
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons";

import ChallengeCard from "../components/Cards/ChallengeCard";
import { getAllTrainers } from "../services/trainers";
import slug from "elegant-slug";
import { T } from "../components/Translate";

const { Panel } = Collapse;

const filterTextStyle = {
  margin: 0,
  padding: 0,
  cursor: "pointer",
  fontSize: "16px",
  padding: "5px 12px",
  marginRight: "10px",
};

function Trainers() {
  const [name, setName] = useState("");

  // eslint-disable-next-line
  const [allTrainers, setAllTrainers] = useState([]);
  const [filterTrainers, setFilterTrainers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterGender, setFilterGender] = useState("");

  useEffect(() => {
    // setFilterTrainers(allTrainers);
    fetchData();
  }, []);

  useEffect(() => {
    const g = allTrainers.filter((trainer) => trainer.gender === filterGender);
    setFilterTrainers(g.length ? g : allTrainers);
  }, [filterGender]);

  const fetchData = async () => {
    const data = await getAllTrainers();
    // console.log(data);
    setAllTrainers(data.trainers);
    setFilterTrainers(data.trainers);
    // setRecommandedChallenges(data.challenges);
  };

  return (
    <div>
      <Navbar />
      {/* <Hero /> */}
      <div className="page-header">
        <div className="page-header-textbox">
          <h1 className="font-heading-white">
            {" "}
            <T>trainers.skill</T>
          </h1>
          <p className="font-paragraph-white">
            {" "}
            <T>trainers.let_us</T>
          </p>
        </div>
      </div>
      {/* 2nd row */}
      <div style={{ backgroundColor: "#222932" }}>
        <div className="trainers-2-row">
          <p className="font-paragraph-white">
            <T>trainers.real_challenge_coach</T>
          </p>
        </div>
      </div>
      {/* trainers */}
      <div style={{ backgroundColor: "#171e27" }}>
        <div className="trainers-3-row">
          <Input
            size="large"
            placeholder="Search Trainers By Name"
            style={{
              // backgroundColor: "transparent",
              padding: "20px",
              color: "#fff",
              fontSize: "2rem",
              opacity: "0.8",
            }}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setFilterTrainers(
                allTrainers.filter((trainer) =>
                  trainer.username
                    .toUpperCase()
                    .includes(e.target.value.toUpperCase())
                )
              );
            }}
            prefix={<SearchOutlined />}
          />
          <Collapse ghost>
            <Panel
              showArrow={false}
              header={
                <p
                  className="font-paragraph-white"
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: "18px",
                  }}
                >
                  <T>trainers.filter_trainer</T>
                </p>
              }
              key="1"
            >
              <p className="font-paragraph-white">
                <T>trainers.filter_gender</T>
              </p>
              <div style={{ display: "flex" }}>
                <p
                  className="font-paragraph-white"
                  onClick={() =>
                    filterGender === "male"
                      ? setFilterGender("")
                      : setFilterGender("male")
                  }
                  style={{
                    ...filterTextStyle,
                    backgroundColor:
                      filterGender === "male" ? "#ff7700" : "#454b52",
                  }}
                >
                  <T>trainers.male</T>
                </p>
                <p
                  className="font-paragraph-white"
                  onClick={() =>
                    filterGender === "female"
                      ? setFilterGender("")
                      : setFilterGender("female")
                  }
                  style={{
                    ...filterTextStyle,
                    backgroundColor:
                      filterGender === "female" ? "#ff7700" : "#454b52",
                  }}
                >
                  <T>trainers.female</T>
                </p>
                <p
                  className="font-paragraph-white"
                  onClick={() =>
                    filterGender === "other"
                      ? setFilterGender("")
                      : setFilterGender("other")
                  }
                  style={{
                    ...filterTextStyle,
                    backgroundColor:
                      filterGender === "other" ? "#ff7700" : "#454b52",
                  }}
                >
                  <T>trainers.other</T>
                </p>
              </div>
            </Panel>
          </Collapse>
          <div className="trainers-3-row-cards">
            {filterTrainers.map((trainer) => (
              <Link to={`/trainer/${slug(trainer.username)}/${trainer._id}`}>
                <ChallengeCard
                  picture={
                    trainer.avatarLink
                      ? `${process.env.REACT_APP_SERVER}/uploads/${trainer.avatarLink}`
                      : ""
                  }
                  // rating={5}
                  name={trainer.username}
                  // location={trainer.location}
                  newc={false}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* 3th row */}
      <div className="home-row-7 background-trainers">
        <div className="home-row-7-container" style={{ minHeight: "350px" }}>
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              <T>trainers.need_more</T>
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>trainers.feel_better</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>trainers.become</T>
            </p>
            <Link className="home-button" to="/how-it-works">
              <span className="home-button-text font-paragraph-white">
                <T>trainers.inspire</T>
                <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 7th row */}

      <Footer />
    </div>
  );
}

export default Trainers;
