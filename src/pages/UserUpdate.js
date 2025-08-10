import React, { useState, useEffect, useContext } from "react";
import "../assets/userUpdate.css";
import LoggedinNavbar from "../components/LoggedinNavbar";
import { InputNumber, Upload, Button, Progress, notification } from "antd";
import HumanVector from "../images/FreeVectorHumanSilhouette 1.png";
// import ImgCrop from "antd-img-crop";

import { getNotifications, getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
// import { uploadImage } from "../services/mediaManager";
// icons
import Muscle from "../assets/icons/muscle.png";
import Waist from "../assets/icons/waist.png";
import HeartRate from "../assets/icons/heart-rate.png";
import ArrowOneActive from "../assets/icons/arrow-one-active.png";
import ArrowForward from "../assets/icons/forward-arrows.png";
import ArrowThreeActive from "../assets/icons/arrow-three-active.png";
import { createCustomerDetails } from "../services/customer";
import { LoadingOutlined } from "@ant-design/icons";
import { T } from "../components/Translate";
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
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  const dummyRequest = async ({ file, onSuccess }) => {
    // const res = await uploadImage(file);
    // console.log("please worl", res);
    // setBeforePic(`${process.env.REACT_APP_SERVER}/api${res.file.filelink}`);
    setBeforePic(file);
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };
  const dummyAfterPicRequest = async ({ file, onSuccess }) => {
    // console.log(file);
    // const res = await uploadImage(file);
    // console.log("please worl", res);
    // setAfterPic(`${process.env.REACT_APP_SERVER}/api${res.file.filelink}`);
    setAfterPic(file);
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const onChange = (info) => {
    console.log(info);
  };

  const saveUserUpdate = async () => {
    // setLoading(true);
    // try {
    //   const savedAfterePic = afterPic
    //     ? typeof afterPic === "object"
    //       ? await uploadImage(afterPic)
    //       : afterPic
    //     : "";
    //   const savedBeforePic = beforePic
    //     ? typeof beforePic === "object"
    //       ? await uploadImage(beforePic)
    //       : beforePic
    //     : "";
    //   const month = new Date().getMonth();
    //   const w = weightArray;
    //   w[month] = weight;
    //   const values = {
    //     goals: [goal],
    //     currentFitnessLevel: [currentLevel],
    //     measureSystem: metric ? "metrics" : "imperial",
    //     height,
    //     age,
    //     weight: w,
    //     bmi,
    //     bmir: bmr,
    //     waistSize,
    //     shoulderSize,
    //     hipSize,
    //     chestSize,
    //     afterImageLink:
    //       typeof savedAfterePic === "string"
    //         ? savedAfterePic
    //         : savedAfterePic.file.filelink,
    //     beforeImageLink:
    //       typeof savedBeforePic === "string"
    //         ? savedBeforePic
    //         : savedBeforePic.file.filelink,
    //   };
    //   await createCustomerDetails(values, userInfo.id);
    //   setLoading(false);
    //   openNotificationWithIcon("success", "Information Updated!", "");
    //   console.log("values to be saved", values);
    // } catch (error) {
    //   console.log(error, "afterPic", afterPic, "beforePic", beforePic);
    //   setLoading(false);
    //   openNotificationWithIcon("error", "Unable to updated values", "");
    // }
  };

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await getNotifications();
        setNotifications(res);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    // Fetch notifications immediately and then every 1 minute
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userInfo.id]);

  const markNotificationAsRead = (id, notification) => {
    history.push(notification.onClick);
    if (!notifications.notifications) return;
    // notification is already read
    if (
      notifications.notifications.find(
        (notification) => notification._id === id
      ).read
    )
      return;
    setNotifications({
      notifications: notifications.notifications.map((notification) => {
        if (notification._id === id) {
          return { ...notification, read: true };
        }
        return notification;
      }),
      unreadNotifications: notifications.unreadNotifications - 1,
    });
    console.log("markNotificationAsRead", id);
  };

  return (
    <div style={{ backgroundColor: "var(--color-gray-dark)" }}>
      <LoggedinNavbar
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />

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
              <div
                className="font-paragraph-white"
                onClick={() => setGoal("gain-muscle")}
                style={{
                  padding: "10px",
                  background:
                    goal === "gain-muscle"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={Muscle} alt="" style={iconsStyle} />
                <T>user_update.gain_muscle</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setGoal("get-fit")}
                style={{
                  padding: "10px",
                  background:
                    goal === "get-fit"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={HeartRate} alt="" style={iconsStyle} />
                <T>user_update.get_fit</T>
              </div>
              <div
                className="font-paragraph-white"
                onClick={() => setGoal("lose-weight")}
                style={{
                  padding: "10px",
                  background:
                    goal === "lose-weight"
                      ? "var(--color-gray-light)"
                      : "var(--color-gray-dark)",
                }}
              >
                {" "}
                <img src={Waist} alt="" style={iconsStyle} />
                <T>user_update.lose_weight</T>
              </div>
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
                onClick={() => setMetric(true)}
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
                onClick={() => setMetric(false)}
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
                <span className="font-paragraph-white">BMI: </span>
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
                <span className="font-paragraph-white">BMR: </span>
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
                <span className="font-paragraph-white">Shoulder Size: </span>
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
              </div>
              <div>
                <span className="font-paragraph-white">Chest Size: </span>
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
              </div>
              <div>
                <span className="font-paragraph-white">Hip Size: </span>
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
              </div>
              <div>
                <span className="font-paragraph-white">Waist Size:</span>
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
                  <span className="font-paragraph-white">
                    {/* {beforePic ? beforePic.name : ""} */}
                    <div
                      className="user-image-remove font-paragraph-white"
                      onClick={() => setBeforePic("")}
                    >
                      <T>user_update.remove</T>
                    </div>
                  </span>
                ) : (
                  <div></div>
                  // todo do later
                  // <ImgCrop rotate>
                  //   <Upload
                  //     aspect="3/2"
                  //     customRequest={dummyRequest}
                  //     multiple={false}
                  //     onChange={onChange}
                  //     showUploadList={false}
                  //     progress={<Progress type="line" />}
                  //     // onPreview={onPreview}
                  //   >
                  //     <Button
                  //       className="font-paragraph-white hover-orange"
                  //       style={{
                  //         backgroundColor: "var(--color-gray-light)",
                  //         border: "none",
                  //       }}
                  //     >
                  //       <T>user_update.upload_before_image</T>
                  //     </Button>
                  //   </Upload>
                  // </ImgCrop>
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
                  <span className="font-paragraph-white">
                    {/* {afterPic ? afterPic : ""} */}
                    <div
                      className="user-image-remove font-paragraph-white"
                      onClick={() => setAfterPic("")}
                    >
                      <T>user_update.remove</T>
                    </div>
                  </span>
                ) : (
                  <div></div>
                  // todo do later
                  // <ImgCrop rotate>
                  //   <Upload
                  //     aspect="3/2"
                  //     customRequest={dummyAfterPicRequest}
                  //     multiple={false}
                  //     onChange={onChange}
                  //     showUploadList={false}
                  //     progress={<Progress type="line" />}
                  //     // onPreview={onPreview}
                  //   >
                  //     <Button
                  //       className="font-paragraph-white hover-orange"
                  //       style={{
                  //         backgroundColor: "var(--color-gray-light)",
                  //         border: "none",
                  //       }}
                  //     >
                  //       <T>user_update.upload_after_image</T>
                  //     </Button>
                  //   </Upload>
                  // </ImgCrop>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingOutlined style={{ fontSize: "30px" }} />
          ) : (
            <button
              className="font-paragraph-white"
              style={{
                backgroundColor: "var(--color-orange)",
                padding: "10px 40px",
                border: "none",
                margin: "20px",
                fontSize: "1.8rem",
                cursor: "pointer",
              }}
              onClick={() => saveUserUpdate("save")}
            >
              <T>user_update.save</T>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserUpdate;
