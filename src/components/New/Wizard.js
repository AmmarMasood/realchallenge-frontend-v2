import React, { useState, useEffect, useContext } from "react";
import { Steps, Button, InputNumber, Switch } from "antd";
import {
  ForwardOutlined,
  ArrowRightOutlined,
  RightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import "../../assets/wizard.css";
import "../../assets/home.css";
import MaleSexLogo from "../../assets/icons/male.svg";
import FemaleSexLogo from "../../assets/icons/female.svg";
import WaistLogo from "../../assets/icons/waist-icon.svg";
import HeartcheckFont from "../../assets/icons/heart-icon.svg";
import DumbellIcon from "../../assets/icons/dumbell-icon.svg";

import { getAllTrainerGoals } from "../../services/trainers";
import { T } from "../Translate";
import { LanguageContext } from "../../contexts/LanguageContext";

const { Step } = Steps;

function Wizard({ setWizardCompleted }) {
  const { language } = useContext(LanguageContext);
  const [allFitnessInterests, setAllFitnessInterests] = useState([]);
  const [selectedFitnessInterests, setSelectedFitnessInterests] = useState([]);
  const [current, setCurrent] = useState(0);
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [details, setDetails] = useState({
    age: null,
    height: null,
    weight: null,
    metric: true,
  });
  // eslint-disable-next-line
  const [bmi, setBmi] = useState(null);
  // eslint-disable-next-line
  const [bodyFat, setBodyFat] = useState(null);
  // eslint-disable-next-line
  const [calories, setCalories] = useState(null);
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };
  useEffect(() => {
    getAllFitnessInterests();
  }, []);
  useEffect(() => {
    const getPal = () => {
      let pal = 0;
      switch (fitnessLevel) {
        case "inactive":
          pal = 1.2;
          break;
        case "light-actve":
          pal = 1.45;
          break;
        case "average-active":
          pal = 1.65;
          break;
        case "active":
          pal = 1.85;
          break;
        case "very-active":
          pal = 2.2;
          break;
        default:
          pal = 0;
          break;
      }
      console.log(pal);
      return pal;
    };
    let BMI = 0;
    let BMR = 0;
    let c = 0;
    BMI = details.weight / ((details.height / 100) * 2);
    console.log("BMI", BMI, getPal(), fitnessLevel);
    if (gender === "male") {
      BMR =
        88.362 +
        13.397 * details.weight +
        4.799 * details.height -
        5.677 * details.age;
    }
    if (gender === "female") {
      BMR =
        447.593 +
        9.247 * details.weight +
        3.098 * details.height -
        4.33 * details.age;
    }
    c = getPal() * BMR;
    setCalories(c.toFixed(2));
    setBodyFat(BMR.toFixed(2));
    setBmi(BMI.toFixed(2));
  }, [gender, details, fitnessLevel]);

  const getAllFitnessInterests = async () => {
    const res = await getAllTrainerGoals(language);
    if (res) {
      console.log(res);
      setAllFitnessInterests(res.goals);
    }
  };
  function getWeightDependingOnCurrentMonth(weight) {
    const month = new Date().getMonth();
    const months = new Array(12).fill(0);
    months[month] = weight;
    return months;
  }

  function onSetWizardComplete() {
    const d = {
      gender,
      goals: [goal],
      currentFitnessLevel: [fitnessLevel],
      age: parseInt(details.age),
      weight: getWeightDependingOnCurrentMonth(details.weight),
      measureSystem: "metrics",
      height: parseInt(details.height),
      bmi: parseInt(bmi),
      bmir: parseInt(bodyFat),
      caloriesPerDay: parseInt(calories),
      amountOfProtein: goal === "gain-muscle" ? 30 : 25,
      amountOfFat: goal === "gain-muscle" ? 20 : 30,
      amountOfCarbohydrate: goal === "gain-muscle" ? 50 : 45,
    };
    setWizardCompleted(d);
  }

  const steps = [
    {
      // title: "",
      content: (
        <div style={{ textAlign: "center" }}>
          <h1 className="font-heading-white">
            <T>wizard.wg</T>
          </h1>
          <p className="font-paragraph-white">
            <T>wizard.yd</T>
          </p>
          <div className="wizard-gender-selection-container">
            <div
              onClick={() => {
                setGender("male");
              }}
              style={{
                border:
                  gender && gender === "male"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-gender-selection-container-gender"
            >
              <img src={MaleSexLogo} alt="" />
              <p className="font-paragraph-white" style={{ fontSize: "20px" }}>
                <T>wizard.man</T>
              </p>
            </div>
            <div
              onClick={() => {
                setGender("female");
              }}
              style={{
                border:
                  gender && gender === "female"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-gender-selection-container-gender"
            >
              <img src={FemaleSexLogo} alt="" />
              <p className="font-paragraph-white" style={{ fontSize: "20px" }}>
                <T>wizard.woman</T>
              </p>
            </div>
          </div>
          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => next()}
          >
            <span className="font-paragraph-white">Next</span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div style={{ textAlign: "center" }}>
          <h1 className="font-heading-white">
            <T>wizard.whatg</T>
          </h1>
          <p className="font-paragraph-white">
            <T>wizard.sgda</T>
          </p>
          <div className="wizard-goal-selection-container">
            <div
              style={{
                border:
                  goal && goal === "gain-muscle"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-goal-selection-container-goal"
              onClick={() => {
                setGoal("gain-muscle");
              }}
            >
              <img src={DumbellIcon} alt="" />
              <span className="font-paragraph-white">
                {" "}
                <T>wizard.gainmuslce</T> (Bulk)
              </span>
            </div>
            <div
              style={{
                border:
                  goal && goal === "get-fit"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-goal-selection-container-goal"
              onClick={() => {
                setGoal("get-fit");
              }}
            >
              <img src={HeartcheckFont} alt="" />
              <span className="font-paragraph-white">
                <T>wizard.getfit</T>
              </span>
            </div>
            <div
              style={{
                border:
                  goal && goal === "lose-weight"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-goal-selection-container-goal"
              onClick={() => {
                setGoal("lose-weight");
              }}
            >
              <img src={WaistLogo} alt="" />
              <span className="font-paragraph-white">
                <T>wizard.loseweight</T> (Cut)
              </span>
            </div>
          </div>
          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => next()}
          >
            <span className="font-paragraph-white">Next</span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div style={{ textAlign: "center" }}>
          <h2 className="font-heading-white" style={{ fontSize: "23px" }}>
            <T>wizard.currentfitness</T>
          </h2>
          <p className="font-paragraph-white">
            <T>wizard.smatch</T>
          </p>
          <div className="wizard-goal-selection-container">
            <div
              style={{
                border:
                  fitnessLevel && fitnessLevel === "inactive"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-fitness-selection-container-level font-paragraph-white"
              onClick={() => {
                setFitnessLevel("inactive");
              }}
            >
              <ForwardOutlined
                style={{ fontSize: "25px", paddingRight: "10px" }}
              />{" "}
              <div>
                <T>wizard.inactive</T>
                <br />
                <span
                  style={{
                    fontSize: "1.3rem",
                    display: "block",
                  }}
                >
                  <T>wizard.sjn</T>
                </span>
              </div>
            </div>
            <div
              style={{
                border:
                  fitnessLevel && fitnessLevel === "light-actve"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-fitness-selection-container-level font-paragraph-white"
              onClick={() => {
                setFitnessLevel("light-actve");
              }}
            >
              <ForwardOutlined
                style={{ fontSize: "25px", paddingRight: "10px" }}
              />{" "}
              <div>
                <T>wizard.la</T>
                <br />
                <span
                  style={{
                    fontSize: "1.3rem",
                    display: "block",
                  }}
                >
                  <T>wizard.seated</T>
                </span>
              </div>
            </div>
            <div
              style={{
                border:
                  fitnessLevel && fitnessLevel === "average-active"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-fitness-selection-container-level font-paragraph-white"
              onClick={() => {
                setFitnessLevel("average-active");
              }}
            >
              <ForwardOutlined
                style={{ fontSize: "25px", paddingRight: "10px" }}
              />{" "}
              <div>
                <T>wizard.avgactive</T> <br />
                <span
                  style={{
                    fontSize: "1.3rem",
                    display: "block",
                  }}
                >
                  <T>wizard.sj3</T>
                </span>
              </div>
            </div>
            <div
              style={{
                border:
                  fitnessLevel && fitnessLevel === "active"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-fitness-selection-container-level font-paragraph-white"
              onClick={() => {
                setFitnessLevel("active");
              }}
            >
              <ForwardOutlined
                style={{ fontSize: "25px", paddingRight: "10px" }}
              />{" "}
              <div>
                <T>wizard.active</T> <br />
                <span
                  style={{
                    fontSize: "1.3rem",
                    display: "block",
                  }}
                >
                  <T>wizard.sj4</T>
                </span>
              </div>
            </div>
            <div
              style={{
                border:
                  fitnessLevel && fitnessLevel === "very-active"
                    ? "2px solid var(--color-orange)"
                    : "2px solid var(--color-gray)",
              }}
              className="wizard-fitness-selection-container-level font-paragraph-white"
              onClick={() => {
                setFitnessLevel("very-active");
              }}
            >
              <ForwardOutlined
                style={{ fontSize: "25px", paddingRight: "10px" }}
              />{" "}
              <div>
                <T>wizard.veryactive</T> <br />
                <span
                  style={{
                    fontSize: "1.3rem",
                    display: "block",
                  }}
                >
                  <T>wizard.hw</T>
                </span>
              </div>
            </div>
          </div>
          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => next()}
          >
            <span className="font-paragraph-white">Next</span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div style={{ textAlign: "center" }}>
          <h2 className="font-heading-white" style={{ fontSize: "23px" }}>
            Fitness Interests
          </h2>
          <p className="font-paragraph-white" style={{ textAlign: "left" }}>
            According to your goals and interests we will design the best
            challenges fo you
          </p>
          <div
            style={{
              maxHeight: "300px",
              display: "flex",
              alignItems: "flex-start",
              // border: "2px solid red",
              flexWrap: "wrap",
              overflowY: "auto",
            }}
          >
            {allFitnessInterests &&
              allFitnessInterests.map((i) => (
                <span
                  onClick={() => {
                    if (selectedFitnessInterests.includes(i._id)) {
                      setSelectedFitnessInterests(
                        selectedFitnessInterests.filter(
                          (inte) => inte !== i._id
                        )
                      );
                    } else {
                      setSelectedFitnessInterests([
                        ...selectedFitnessInterests,
                        i._id,
                      ]);
                    }
                  }}
                  key={i._id}
                  style={{
                    color: "#fff",
                    fontSize: "18px",
                    backgroundColor: "#232932",
                    padding: "10px",
                    margin: "5px",
                    minWidth: "100px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: selectedFitnessInterests.includes(i._id)
                      ? "2px solid var(--color-orange)"
                      : "2px solid #232932",
                  }}
                >
                  <ForwardOutlined
                    style={{ fontSize: "25px", paddingRight: "5px" }}
                  />{" "}
                  {i.name}
                </span>
              ))}
          </div>
          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => next()}
          >
            <span className="font-paragraph-white">Next</span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div style={{ textAlign: "center" }}>
          <h1 className="font-heading-white">
            <T>wizard.fd</T>
          </h1>
          <p className="font-paragraph-white">
            <T>wizard.almost</T>
          </p>
          <div className="finaldetails-field-container">
            <InputNumber
              size="large"
              placeholder="Age"
              value={details.age}
              onChange={(e) => setDetails({ ...details, age: e })}
              className="finaldetails-field"
              style={{ width: "100%", marginTop: "10px" }}
            />
            <InputNumber
              size="large"
              className="finaldetails-field"
              value={details.height}
              style={{ width: "100%", marginTop: "10px" }}
              onChange={(e) => setDetails({ ...details, height: e })}
              placeholder={`Height ${details.metric ? " (cm)" : " (ft)"}`}
            />
            <InputNumber
              size="large"
              className="finaldetails-field"
              value={details.weight}
              onChange={(e) => setDetails({ ...details, weight: e })}
              style={{ width: "100%", marginTop: "10px" }}
              placeholder={`Weight ${details.metric ? " (kg)" : " (lb)"}`}
            />
          </div>
          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => next()}
          >
            <span className="font-paragraph-white">Next</span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
    {
      content: (
        <div style={{ textAlign: "center" }}>
          <h2 className="font-heading-white">
            <T>wizard.improve</T>
          </h2>
          <p className="font-paragraph-white">
            {" "}
            <T>wizard.joinfree</T>
          </p>
          <div
            className="finaldetails-field-container"
            style={{ textAlign: "left" }}
          >
            <div className="show-detail-field font-paragraph-white">
              <T>wizard.bmi</T>: {bmi}
            </div>
            <div className="show-detail-field font-paragraph-white">
              Your Body Fat is:{" "}
              {gender === "female"
                ? (1.2 * bmi + 0.23 * details.age - 5.4).toFixed(2)
                : (1.2 * bmi + 0.23 * details.age - 16.2).toFixed(2)}{" "}
              %
            </div>
            <div className="show-detail-field font-paragraph-white">
              <T>wizard.kal</T>: {calories}
            </div>
          </div>
          <div
            style={{
              color: "#00ffff",
              fontWeight: "400",
              fontSize: "1.8rem",
              padding: "10px",
              textAlign: "left",
            }}
          >
            <T>wizard.gettailor</T>
          </div>

          <div
            className="create-payment-check-out poppins-medium-white-20px"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => onSetWizardComplete()}
          >
            <span className="font-paragraph-white">
              <T>wizard.tryfree</T>
            </span>
            <ArrowRightOutlined
              style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: "#2a2f36" }}>
      {current >= 1 && (
        <button
          onClick={prev}
          className="font-paragraph-white"
          style={{
            color: "#fff",
            fontSize: "18px",
            backgroundColor: "var(--mirage)",
            padding: "10px ",
            float: "left",
            margin: "10px 0 0 50px",
            position: "absolute",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeftOutlined /> Back
        </button>
      )}
      <div className="wizard-background">
        <Steps current={current} style={{ width: "280px", marginTop: "20px" }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="wizard-container">
          <div className="steps-content">{steps[current].content}</div>
          <div className="steps-action">
            {/* {current > 0 && (
              <Button
                type="link"
                style={{
                  margin: "0 8px",
                  opacity: "0.8",
                  color: "var(--color-white)",
                }}
                onClick={() => prev()}
                className="font-paragraph-white"
              >
                <T>wizard.back</T>
              </Button>
            )} */}
            {/* {current === steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => message.success("Processing complete!</T>
            >
              Done
            </Button>
          )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wizard;
