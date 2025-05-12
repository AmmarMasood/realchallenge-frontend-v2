import React, { useState, useEffect, useContext } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import "../assets/challenge.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Collapse } from "antd";

import { getAllChallenges } from "../services/createChallenge/main";
import ChallengeCard from "../components/Cards/ChallengeCard";
import { getAllChallengeGoals } from "../services/createChallenge/goals";
import { getAllBodyFocus } from "../services/createChallenge/bodyFocus";
import { getAllChallengeEquipments } from "../services/createChallenge/equipments";
import slug from "elegant-slug";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
import { LoadingOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const filterTextStyle = {
  margin: 0,
  padding: 0,
  cursor: "pointer",
  fontSize: "16px",
  padding: "5px 12px",
  marginRight: "10px",
  margin: "2px",
};

function AllChallenges() {
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const [name, setName] = useState("");
  const [filterChallenges, setFilterChallenges] = useState([]);
  // eslint-disable-next-line
  const [challanges, setChallenges] = useState([]);
  const [filterByGoal, setFilterByGoal] = useState("");
  const [filterByIntensity, setFilterByIntensity] = useState("");
  const [filterByBodyFocus, setFilterByBodyFocus] = useState("");
  const [filterByEquipments, setFilterbYEquipments] = useState("");
  // ALL GOALS
  const [allGoals, setAllGoals] = useState([]);
  const [allBodyFocus, setAllBodyFocus] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);

  useEffect(() => {
    fetchData();
  }, [language]);

  const getAllEquipmentsFromWeeks = (weeks) => {
    const workouts = weeks.map((w) => w.workouts);
    const eq = workouts.map((wo) => (wo[0] ? wo[0].relatedEquipments : []));
    const eqs = eq.flat().map((e) => e.name);
    return eqs;
  };

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllChallenges(language);
    const goals = await getAllChallengeGoals(language);
    const bodyFocus = await getAllBodyFocus(language);
    const equipments = await getAllChallengeEquipments(language);
    setLoading(false);
    const chal = data.challenges.map((c) => ({
      ...c,
      difficulty: c.difficulty ? [c.difficulty] : "",
      body: c.body ? c.body.map((b) => b.name) : [],
      challengeGoals: c.challengeGoals
        ? c.challengeGoals.map((g) => g.name)
        : [],
      equipment: getAllEquipmentsFromWeeks(c.weeks),
    }));

    bodyFocus && setAllBodyFocus(bodyFocus.body);
    goals && setAllGoals(goals.challengeGoals);
    equipments && setAllEquipments(equipments.equipments);
    setChallenges(chal ? chal.reverse() : []);
    setFilterChallenges(chal ? chal.reverse() : []);
  };

  useEffect(() => {
    const challenges = challanges.map((f) => {
      var c = [];
      if (filterByBodyFocus && f.body.includes(filterByBodyFocus)) {
        c = [...c, f];
      }
      if (filterByEquipments && f.equipment.includes(filterByEquipments)) {
        c = [...c, f];
      }
      if (filterByGoal && f.challengeGoals.includes(filterByGoal)) {
        c = [...c, f];
      }
      if (filterByIntensity && f.difficulty.includes(filterByIntensity)) {
        c = [...c, f];
      }
      return c;
    });
    console.log("popopopop", challenges.flat());
    challenges.flat().length > 0
      ? setFilterChallenges(challenges.flat())
      : setFilterChallenges(challanges);
    // setFilterChallenges(challenges);
  }, [filterByBodyFocus, filterByEquipments, filterByGoal, filterByIntensity]);
  return (
    <div>
      <Navbar />
      {/* <Hero /> */}
      <div className="page-header challenge-background">
        <div
          className="page-header-textbox"
          style={{ padding: "50px", width: "600px" }}
        >
          <h1 className="font-heading-white">
            <T>challenges.find_the</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.our_real</T>
          </p>
        </div>
      </div>
      {/* challanges */}
      <div className="trainers-3-row">
        <Input
          size="large"
          placeholder="Search Challenges"
          style={{
            padding: "20px",
            color: "#fff",
            fontSize: "2rem",
            opacity: "0.8",
          }}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setFilterChallenges(
              challanges.filter((challenge) =>
                challenge.challengeName
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
                <T>challenges.filter</T>
              </p>
            }
            key="1"
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p className="font-paragraph-white">
                  <T>challenges.goals</T>
                </p>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "wrap",
                    width: "250px",
                    marginRight: "10px",
                  }}
                >
                  {allGoals.map((g) => (
                    <p
                      className="font-paragraph-white"
                      onClick={() =>
                        filterByGoal === g.name
                          ? setFilterByGoal("")
                          : setFilterByGoal(g.name)
                      }
                      style={{
                        ...filterTextStyle,
                        backgroundColor:
                          filterByGoal === g.name ? "#ff7700" : "#454b52",
                      }}
                    >
                      {g.name.replace("-", " ")}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-paragraph-white">
                  <T>challenges.intensity</T>
                </p>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "wrap",
                    width: "250px",
                    marginRight: "10px",
                  }}
                >
                  {["easy", "medium", "hard"].map((g) => (
                    <p
                      className="font-paragraph-white"
                      onClick={() =>
                        filterByIntensity === g
                          ? setFilterByIntensity("")
                          : setFilterByIntensity(g)
                      }
                      style={{
                        ...filterTextStyle,
                        backgroundColor:
                          filterByIntensity === g ? "#ff7700" : "#454b52",
                      }}
                    >
                      {g}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-paragraph-white">
                  <T>challenges.body_focus</T>
                </p>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "wrap",
                    width: "250px",
                    marginRight: "10px",
                  }}
                >
                  {allBodyFocus.map((g) => (
                    <p
                      className="font-paragraph-white"
                      onClick={() =>
                        filterByBodyFocus === g.name
                          ? setFilterByBodyFocus("")
                          : setFilterByBodyFocus(g.name)
                      }
                      style={{
                        ...filterTextStyle,
                        backgroundColor:
                          filterByBodyFocus === g.name ? "#ff7700" : "#454b52",
                      }}
                    >
                      {g.name}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-paragraph-white">
                  <T>challenges.equipments</T>
                </p>
                <div
                  style={{
                    display: "flex",
                    flexFlow: "wrap",
                    width: "250px",
                    marginRight: "10px",
                  }}
                >
                  {allEquipments.map((g) => (
                    <p
                      className="font-paragraph-white"
                      onClick={() =>
                        filterByEquipments === g.name
                          ? setFilterbYEquipments("")
                          : setFilterbYEquipments(g.name)
                      }
                      style={{
                        ...filterTextStyle,
                        backgroundColor:
                          filterByEquipments === g.name ? "#ff7700" : "#454b52",
                      }}
                    >
                      {g.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>

        <div className="trainers-3-row-cards">
          {loading ? (
            <LoadingOutlined
              style={{ color: "#ff7700", fontSize: "30px", margin: "0 auto" }}
            />
          ) : (
            filterChallenges.map((challenge) => (
              <Link
                to={`challenge/${challenge.challengeName}/${challenge._id}`}
              >
                <ChallengeCard
                  picture={`${process.env.REACT_APP_SERVER}/uploads/${challenge.thumbnailLink}`}
                  rating={challenge.rating}
                  name={challenge.challengeName}
                  newc={true}
                  key={challenge._id}
                />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 8th row */}
      <div className="home-row-7 background-challenge">
        <div className="home-row-7-container">
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              <T>challenges.start_today</T>
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>challenges.optimal</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>challenges.a_personal</T>
            </p>
            <Link className="home-button" to="/challenges">
              <span className="home-button-text font-paragraph-white">
                <T>challenges.start_now</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 7th row */}

      {/* 4th row */}
      <Footer />
    </div>
  );
}

export default AllChallenges;
