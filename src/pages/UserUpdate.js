import React, { useState, useEffect, useContext } from "react";
import "../assets/userUpdate.css";
import LoggedinNavbar from "../components/LoggedinNavbar";
import { InputNumber, Upload, Button, Progress, notification } from "antd";
import HumanVector from "../images/FreeVectorHumanSilhouette 1.png";
// import ImgCrop from "antd-img-crop";

import { getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import { getPhotoUploadUrl } from "../services/customer";
// icons
import { getDefaultGoals } from "../constants/goals";
import {
  kgToLb,
  lbToKg,
  cmToFt,
  ftToCm,
  calculateBMI,
  calculateBodyFat,
  toMetric,
} from "../helpers/fitnessCalculations";
import ArrowOneActive from "../assets/icons/arrow-one-active.png";
import ArrowForward from "../assets/icons/forward-arrows.png";
import ArrowThreeActive from "../assets/icons/arrow-three-active.png";
import { createCustomerDetails } from "../services/customer";
import { LoadingOutlined } from "@ant-design/icons";
import { T, translate } from "../components/Translate";
import { useHistory } from "react-router-dom";

const iconsStyle = {
  color: "var(--color-orange)",
  fontSize: "3rem",
  padding: "5px",
  marginRight: "10px",
  backgroundColor: "var(--color-gray)",
};
const iconsStyleArrow = {
  color: "var(--color-orange)",
  height: "38px",
  width: "40px",
  padding: "10px 5px",
  marginRight: "10px",
  backgroundColor: "var(--color-gray)",
};

function UserUpdate() {
  // eslint-disable-next-line
  const history = useHistory();
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [goal, setGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [metric, setMetric] = useState(true);
  const [weight, setWeight] = useState("");
  const [weightArray, setWeightArray] = useState([]);
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [bmr, setBmr] = useState("");
  const [beforePic, setBeforePic] = useState("");
  const [afterPic, setAfterPic] = useState("");
  const [shoulderSize, setShoulderSize] = useState("");
  const [chestSize, setChestSize] = useState("");
  const [hipSize, setHipSize] = useState("");
  const [waistSize, setWaistSize] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };

  const fechUserInfo = async () => {
    setFetchLoading(true);
    const month = new Date().getMonth();

    const res = await getUserProfileInfo(userInfo.id);
    const {
      goals,
      currentFitnessLevel,
      measureSystem,
      height,
      age,
      weight,
      bmi,
      bmir,
      waistSize,
      shoulderSize,
      hipSize,
      chestSize,
      afterImageLink,
      beforeImageLink,
    } = res.customer.customerDetails;
    setGender(res.customer.gender);
    setGoal(goals[0]);
    setCurrentLevel(currentFitnessLevel[0]);
    setMetric(measureSystem === "metrics" ? true : false);
    setHeight(height);
    setAge(age);
    setWeightArray(weight);
    setWeight(weight[month]);
    setBmr(bmir);
    setBmi(bmi);
    setShoulderSize(shoulderSize);
    setWaistSize(waistSize);
    setHipSize(hipSize);
    setChestSize(chestSize);
    setAfterPic(afterImageLink);
    setBeforePic(beforeImageLink);
    setFetchLoading(false);
    console.log("res", res);
  };
  useEffect(() => {
    fechUserInfo();
  }, []);

  // Auto-convert values when switching between metric and imperial
  const handleMetricToggle = (isMetric) => {
    if (isMetric === metric) return;
    if (isMetric) {
      // Imperial → Metric
      setWeight(weight ? parseFloat(lbToKg(weight).toFixed(1)) : weight);
      setHeight(height ? parseFloat(ftToCm(height).toFixed(1)) : height);
    } else {
      // Metric → Imperial
      setWeight(weight ? parseFloat(kgToLb(weight).toFixed(1)) : weight);
      setHeight(height ? parseFloat(cmToFt(height).toFixed(1)) : height);
    }
    setMetric(isMetric);
  };

  // Auto-recalculate BMI and body fat when inputs change
  useEffect(() => {
    const { weightKg, heightCm } = toMetric(weight, height, metric);
    if (weightKg && heightCm) {
      const newBmi = calculateBMI(weightKg, heightCm);
      setBmi(parseFloat(newBmi.toFixed(2)));
      if (age && gender) {
        setBmr(parseFloat(calculateBodyFat(newBmi, age, gender).toFixed(2)));
      }
    }
  }, [weight, height, age, metric, gender]);

  const uploadPhoto = async (file) => {
    // 1. Get presigned URL + final CloudFront URL
    const { presignedUrl, fileUrl } = await getPhotoUploadUrl({
      filename: file.name,
      mimeType: file.type,
    });

    // 2. Upload directly to S3
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error("S3 upload failed")));
      xhr.onerror = () => reject(new Error("S3 upload failed"));
      xhr.send(file);
    });

    return fileUrl;
  };

  const dummyRequest = async ({ file, onSuccess }) => {
    setBeforePic(file);
    setTimeout(() => onSuccess("ok"), 0);
  };

  const dummyAfterPicRequest = async ({ file, onSuccess }) => {
    setAfterPic(file);
    setTimeout(() => onSuccess("ok"), 0);
  };

  const saveUserUpdate = async () => {
    setLoading(true);
    try {
      // Upload images if they are new File objects
      const beforeLink =
        typeof beforePic === "object" && beforePic
          ? await uploadPhoto(beforePic)
          : beforePic || "";
      const afterLink =
        typeof afterPic === "object" && afterPic
          ? await uploadPhoto(afterPic)
          : afterPic || "";

      const month = new Date().getMonth();
      const w = [...weightArray];
      w[month] = weight;

      const { weightKg, heightCm } = toMetric(weight, height, metric);
      const newBmi = calculateBMI(weightKg, heightCm);
      const newBodyFat = gender && age ? calculateBodyFat(newBmi, age, gender) : bmr;

      const values = {
        goals: [goal],
        currentFitnessLevel: [currentLevel],
        measureSystem: metric ? "metrics" : "imperial",
        height,
        age,
        weight: w,
        bmi: parseFloat(newBmi.toFixed(2)),
        bmir: parseFloat(newBodyFat.toFixed(2)),
        waistSize,
        shoulderSize,
        hipSize,
        chestSize,
        beforeImageLink: beforeLink,
        afterImageLink: afterLink,
      };
      await createCustomerDetails(values, userInfo.id);
      // Update local state with the URLs so they display correctly after save
      if (typeof beforePic === "object" && beforeLink) setBeforePic(beforeLink);
      if (typeof afterPic === "object" && afterLink) setAfterPic(afterLink);
      setLoading(false);
      openNotificationWithIcon("success", translate("user_update.update_success"), "");
    } catch (error) {
      console.log(error);
      setLoading(false);
      openNotificationWithIcon("error", translate("user_update.update_error"), "");
    }
  };

  return (
    <div style={{ backgroundColor: "var(--color-gray-dark)" }}>
      <LoggedinNavbar />

      <div className="user-update-container">
        <div className="user-update-container-heading font-card-heading">
          <T>user_update.update_values</T>
        </div>
        <div className="user-update-container-box">
          <div className="user-update-container-box-row1">
            <div className="user-update-container-box-row1-heading font-card-heading-light">
              <T>user_update.your_goals</T>
            </div>
            <div className="user-update-container-box-row1-inside">
              {getDefaultGoals().map((g) => (
                <div
                  key={g._id}
                  className="font-paragraph-white"
                  onClick={() => setGoal(g._id)}
                  style={{
                    padding: "10px",
                    background:
                      goal === g._id
                        ? "var(--color-gray-light)"
                        : "var(--color-gray-dark)",
                  }}
                >
                  {" "}
                  <img src={g.icon} alt="" style={iconsStyle} />
                  {g.name}
                </div>
              ))}
            </div>
          </div>
          <div className="user-update-container-box-row2">
            <div className="user-update-container-box-row2-heading font-card-heading-light">
              <T>user_update.current_fitness</T>
            </div>
            <div className="user-update-container-box-row2-inside">
              <div
                className="font-paragraph-white"
                onClick={() => setCurrentLevel("inactive")}
                style={{
                  padding: "10px",
                  background:
                    currentLevel === "inactive"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={ArrowOneActive} alt="" style={iconsStyleArrow} />
                <T>user_update.inactive</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setCurrentLevel("light-active")}
                style={{
                  padding: "10px",
                  background:
                    currentLevel === "light-active"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={ArrowOneActive} alt="" style={iconsStyleArrow} />
                <T>user_update.light_active</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setCurrentLevel("average-active")}
                style={{
                  padding: "10px",
                  background:
                    currentLevel === "average-active"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={ArrowForward} alt="" style={iconsStyleArrow} />
                <T>user_update.average_active</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setCurrentLevel("active")}
                style={{
                  padding: "10px",
                  background:
                    currentLevel === "active"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={ArrowThreeActive} alt="" style={iconsStyleArrow} />
                <T>user_update.active</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setCurrentLevel("very-active")}
                style={{
                  padding: "10px",
                  background:
                    currentLevel === "very-active"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={ArrowThreeActive} alt="" style={iconsStyleArrow} />
                <T>user_update.very_active</T>
              </div>
            </div>
          </div>
          <div className="user-update-container-box-row3">
            <div className="user-update-container-box-row3-heading font-card-heading-light">
              <T>user_update.other_details</T>
            </div>
            <div className="user-update-container-box-row3-buttons">
              <button
                className="font-paragraph-white"
                style={{
                  backgroundColor: metric
                    ? "var(--color-orange)"
                    : "var(--color-gray-light)",
                }}
                onClick={() => handleMetricToggle(true)}
              >
                <T>user_update.metric</T>
              </button>
              <button
                className="font-paragraph-white"
                style={{
                  backgroundColor: !metric
                    ? "var(--color-orange)"
                    : "var(--color-gray-light)",
                }}
                onClick={() => handleMetricToggle(false)}
              >
                <T>user_update.imperial</T>
              </button>
            </div>
            <div className="user-update-container-box-row3-inside">
              <div>
                <span className="font-paragraph-white">
                  <T>user_update.weight</T>:{" "}
                </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={weight}
                  onChange={(e) => setWeight(e)}
                />
                <span
                  className="font-paragraph-white"
                  style={{ marginLeft: "5px" }}
                >
                  {metric ? "kg" : "lb"}{" "}
                </span>
              </div>
              <div>
                <span className="font-paragraph-white">
                  <T>user_update.height</T>:
                </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={height}
                  onChange={(e) => setHeight(e)}
                />
                <span
                  className="font-paragraph-white"
                  style={{ marginLeft: "5px" }}
                >
                  {metric ? "cm" : "ft"}{" "}
                </span>
              </div>
              <div>
                <span className="font-paragraph-white">
                  <T>user_update.age</T>:
                </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={age}
                  onChange={(e) => setAge(e)}
                />
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.bmi</T>: </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={bmi}
                  onChange={(e) => setBmi(e)}
                />
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.body_fat</T>: </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={bmr}
                  onChange={(e) => setBmr(e)}
                />
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.shoulder_size</T>: </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={shoulderSize}
                  onChange={(e) => setShoulderSize(e)}
                />
                <span className="font-paragraph-white" style={{ marginLeft: "5px" }}>
                  {metric ? "cm" : "in"}
                </span>
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.chest_size</T>: </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={chestSize}
                  onChange={(e) => setChestSize(e)}
                />
                <span className="font-paragraph-white" style={{ marginLeft: "5px" }}>
                  {metric ? "cm" : "in"}
                </span>
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.hip_size</T>: </span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={hipSize}
                  onChange={(e) => setHipSize(e)}
                />
                <span className="font-paragraph-white" style={{ marginLeft: "5px" }}>
                  {metric ? "cm" : "in"}
                </span>
              </div>
              <div>
                <span className="font-paragraph-white"><T>user_update.waist_size</T>:</span>
                <InputNumber
                  className="font-paragraph-white"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid var(--color-gray-light)",
                    width: "100px",
                  }}
                  value={waistSize}
                  onChange={(e) => setWaistSize(e)}
                />
                <span className="font-paragraph-white" style={{ marginLeft: "5px" }}>
                  {metric ? "cm" : "in"}
                </span>
              </div>
            </div>
          </div>

          <div className="user-update-uploadimage">
            <div className="user-update-container-box-row2-heading font-card-heading-light">
              <T>user_update.upload_your_pictures</T>
            </div>
            <div className="user-update-uploadimage-container">
              <div className="user-update-uploadimage-container-box">
                <h3 className="font-paragraph-white">
                  {" "}
                  <T>user_update.before</T>
                </h3>
                <img
                  src={
                    typeof beforePic === "object"
                      ? URL.createObjectURL(beforePic)
                      : typeof beforePic === "string" && beforePic.length > 0
                      ? `${beforePic}`
                      : HumanVector
                  }
                  style={{
                    height: "80%",
                    padding: "20px",
                    backgroundColor: "var(--color-gray-light)",
                    marginBottom: "10px",
                    marginTop: "10px",
                  }}
                  alt="human-vector"
                />
                {beforePic ? (
                  <div
                    className="user-image-remove font-paragraph-white"
                    onClick={() => setBeforePic("")}
                  >
                    <T>user_update.remove</T>
                  </div>
                ) : (
                  <Upload
                    accept="image/*"
                    customRequest={dummyRequest}
                    multiple={false}
                    showUploadList={false}
                  >
                    <Button
                      className="font-paragraph-white hover-orange"
                      style={{
                        backgroundColor: "var(--color-gray-light)",
                        border: "none",
                      }}
                    >
                      <T>user_update.upload_before_image</T>
                    </Button>
                  </Upload>
                )}
              </div>
              <div className="user-update-uploadimage-container-box">
                <h3 className="font-paragraph-white">
                  <T>user_update.after</T>
                </h3>
                <img
                  src={
                    typeof afterPic === "object"
                      ? URL.createObjectURL(afterPic)
                      : typeof afterPic === "string" && afterPic.length > 0
                      ? `${afterPic}`
                      : HumanVector
                  }
                  style={{
                    height: "80%",
                    padding: "20px",
                    backgroundColor: "var(--color-gray-light)",
                    marginBottom: "10px",
                    marginTop: "10px",
                  }}
                  alt="human-vector"
                />
                {afterPic ? (
                  <div
                    className="user-image-remove font-paragraph-white"
                    onClick={() => setAfterPic("")}
                  >
                    <T>user_update.remove</T>
                  </div>
                ) : (
                  <Upload
                    accept="image/*"
                    customRequest={dummyAfterPicRequest}
                    multiple={false}
                    showUploadList={false}
                  >
                    <Button
                      className="font-paragraph-white hover-orange"
                      style={{
                        backgroundColor: "var(--color-gray-light)",
                        border: "none",
                      }}
                    >
                      <T>user_update.upload_after_image</T>
                    </Button>
                  </Upload>
                )}
              </div>
            </div>
          </div>

          <button
            className="font-paragraph-white"
            style={{
              backgroundColor: loading ? "var(--color-gray-light)" : "var(--color-orange)",
              padding: "10px 40px",
              border: "none",
              margin: "20px",
              fontSize: "1.8rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            onClick={() => saveUserUpdate("save")}
            disabled={loading}
          >
            {loading ? <LoadingOutlined style={{ color: "#fff", marginRight: "8px" }} /> : null}
            <T>user_update.save</T>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserUpdate;
