import React, { useState, useEffect, useContext } from "react";
import "../assets/userUpdate.css";
import LoggedinNavbar from "../components/LoggedinNavbar";
import { InputNumber, Upload, notification } from "antd";
import HumanVector from "../images/FreeVectorHumanSilhouette 1.png";

import { getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import {
  getPhotoUploadUrl,
  confirmPhotoUpload,
  createCustomerDetails,
} from "../services/customer";
import { getAllTrainerGoalsPublic } from "../services/trainers";
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
import {
  CloseOutlined,
  LoadingOutlined,
  ForwardOutlined,
} from "@ant-design/icons";
import { T, translate } from "../components/Translate";
import { useHistory } from "react-router-dom";
import GreenSwitch from "../components/Common/GreenSwitch";
import { LanguageContext } from "../contexts/LanguageContext";

const fitnessLevels = [
  { key: "inactive", label: "user_update.inactive", icon: ArrowOneActive },
  {
    key: "light-active",
    label: "user_update.light_active",
    icon: ArrowOneActive,
  },
  {
    key: "average-active",
    label: "user_update.average_active",
    icon: ArrowForward,
  },
  { key: "active", label: "user_update.active", icon: ArrowThreeActive },
  {
    key: "very-active",
    label: "user_update.very_active",
    icon: ArrowThreeActive,
  },
];

function UserUpdate() {
  const history = useHistory();
  const [userInfo] = useContext(userInfoContext);
  const { language } = useContext(LanguageContext);

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
  const [beforeProgress, setBeforeProgress] = useState(0);
  const [afterProgress, setAfterProgress] = useState(0);
  // Body measurements are stored as 12-month arrays (current month's slot
  // is the displayed value). Keep both the current scalar (for the input)
  // and the full array (so we don't lose other months when saving).
  const [shoulderSize, setShoulderSize] = useState("");
  const [shoulderArray, setShoulderArray] = useState([]);
  const [chestSize, setChestSize] = useState("");
  const [chestArray, setChestArray] = useState([]);
  const [hipSize, setHipSize] = useState("");
  const [hipArray, setHipArray] = useState([]);
  const [waistSize, setWaistSize] = useState("");
  const [waistArray, setWaistArray] = useState([]);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fitness interests (re-uses the same TrainerGoal list as the wizard)
  const [allFitnessInterests, setAllFitnessInterests] = useState([]);
  const [selectedFitnessInterests, setSelectedFitnessInterests] = useState([]);

  // New: hide before/after photos from public challenge profile
  const [hideMyShape, setHideMyShape] = useState(false);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({ message, description });
  };

  const fetchUserInfo = async () => {
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
      hideMyShape: srvHide,
      fitnessInterests,
    } = res.customer.customerDetails;
    setGender(res.customer.gender);
    setGoal(goals && goals[0]);
    setCurrentLevel(currentFitnessLevel && currentFitnessLevel[0]);
    setMetric(measureSystem === "metrics");
    setHeight(height);
    setAge(age);
    setWeightArray(weight || []);
    setWeight(weight ? weight[month] : "");
    setBmr(bmir);
    setBmi(bmi);
    // Body measurements may be arrays (new shape) or scalars (legacy
    // pre-migration). Normalize both so the form always shows the
    // current-month value but we preserve the full series for save.
    const slot = (arrOrNum) => {
      if (Array.isArray(arrOrNum)) return arrOrNum[month] || "";
      if (typeof arrOrNum === "number") return arrOrNum;
      return "";
    };
    const fullArr = (arrOrNum) =>
      Array.isArray(arrOrNum) ? arrOrNum : new Array(12).fill(0);
    setShoulderSize(slot(shoulderSize));
    setShoulderArray(fullArr(shoulderSize));
    setWaistSize(slot(waistSize));
    setWaistArray(fullArr(waistSize));
    setHipSize(slot(hipSize));
    setHipArray(fullArr(hipSize));
    setChestSize(slot(chestSize));
    setChestArray(fullArr(chestSize));
    setAfterPic(afterImageLink);
    setBeforePic(beforeImageLink);
    setHideMyShape(!!srvHide);
    setSelectedFitnessInterests(
      Array.isArray(fitnessInterests)
        ? fitnessInterests.map((f) => (typeof f === "object" ? f._id : f))
        : [],
    );
  };

  const fetchFitnessInterests = async () => {
    const res = await getAllTrainerGoalsPublic(language);
    if (res && Array.isArray(res.goals)) setAllFitnessInterests(res.goals);
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchUserInfo(), fetchFitnessInterests()]);
      } finally {
        setPageLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMetricToggle = (isMetric) => {
    if (isMetric === metric) return;
    if (isMetric) {
      setWeight(weight ? parseFloat(lbToKg(weight).toFixed(1)) : weight);
      setHeight(height ? parseFloat(ftToCm(height).toFixed(1)) : height);
    } else {
      setWeight(weight ? parseFloat(kgToLb(weight).toFixed(1)) : weight);
      setHeight(height ? parseFloat(cmToFt(height).toFixed(1)) : height);
    }
    setMetric(isMetric);
  };

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

  const uploadPhoto = async (file, setProgress) => {
    const { presignedUrl, fileUrl, s3Key } = await getPhotoUploadUrl({
      filename: file.name,
      mimeType: file.type,
    });
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && setProgress) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () =>
        xhr.status === 200 ? resolve() : reject(new Error("S3 upload failed"));
      xhr.onerror = () => reject(new Error("S3 upload failed"));
      xhr.send(file);
    });
    // Not awaited: server optimizes the image in the background
    confirmPhotoUpload({ s3Key, mimeType: file.type });
    return fileUrl;
  };

  const beforeFileRequest = ({ file, onSuccess }) => {
    setBeforePic(file);
    setBeforeProgress(0);
    setTimeout(() => onSuccess("ok"), 0);
  };
  const afterFileRequest = ({ file, onSuccess }) => {
    setAfterPic(file);
    setAfterProgress(0);
    setTimeout(() => onSuccess("ok"), 0);
  };

  const toggleInterest = (id) => {
    setSelectedFitnessInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const saveUserUpdate = async () => {
    setLoading(true);
    try {
      const beforeLink =
        typeof beforePic === "object" && beforePic
          ? await uploadPhoto(beforePic, setBeforeProgress)
          : beforePic || "";
      const afterLink =
        typeof afterPic === "object" && afterPic
          ? await uploadPhoto(afterPic, setAfterProgress)
          : afterPic || "";

      const month = new Date().getMonth();
      const w = [...weightArray];
      w[month] = weight;

      // Stamp the current-month slot on each body-measurement array. The
      // length-12 default + .slice() guards against legacy docs that still
      // carried a scalar value when first loaded.
      const stampSlot = (arr, value) => {
        const out = Array.isArray(arr) && arr.length === 12
          ? [...arr]
          : new Array(12).fill(0);
        out[month] = Number(value) || 0;
        return out;
      };

      // BMI from this month's weight, falling back to the latest recorded
      // month — otherwise saving in a month with no entry computes BMI 0 and
      // wipes the stored bmi/bmir.
      const weightForBmi =
        Number(weight) || [...w].reverse().find((v) => Number(v) > 0) || 0;
      const { weightKg, heightCm } = toMetric(weightForBmi, height, metric);
      const newBmi = calculateBMI(weightKg, heightCm);
      const newBodyFat =
        gender && age ? calculateBodyFat(newBmi, age, gender) : bmr;

      const values = {
        goals: [goal],
        currentFitnessLevel: [currentLevel],
        measureSystem: metric ? "metrics" : "imperial",
        height,
        age,
        weight: w,
        // Never overwrite a stored value with a 0 from incomplete form data
        bmi: newBmi ? parseFloat(newBmi.toFixed(2)) : bmi || 0,
        bmir: newBodyFat ? parseFloat(Number(newBodyFat).toFixed(2)) : bmr || 0,
        waistSize: stampSlot(waistArray, waistSize),
        shoulderSize: stampSlot(shoulderArray, shoulderSize),
        hipSize: stampSlot(hipArray, hipSize),
        chestSize: stampSlot(chestArray, chestSize),
        beforeImageLink: beforeLink,
        afterImageLink: afterLink,
        hideMyShape,
        fitnessInterests: selectedFitnessInterests,
      };
      await createCustomerDetails(values, userInfo.id);
      if (typeof beforePic === "object" && beforeLink) setBeforePic(beforeLink);
      if (typeof afterPic === "object" && afterLink) setAfterPic(afterLink);
      setLoading(false);
      openNotificationWithIcon(
        "success",
        translate("user_update.update_success"),
        "",
      );
    } catch (error) {
      console.log(error);
      setLoading(false);
      openNotificationWithIcon(
        "error",
        translate("user_update.update_error"),
        "",
      );
    }
  };

  const renderGoalCard = (g) => {
    const selected = goal === g._id;
    return (
      <div
        key={g._id}
        onClick={() => setGoal(g._id)}
        className="uu-card uu-goal-card"
        style={{
          background: selected ? "#2F3E50" : "#171E27",
        }}
      >
        <div className="uu-goal-icon">
          <img src={g.icon} alt="" />
        </div>
        <span className="font-paragraph-white">{g.name}</span>
      </div>
    );
  };

  const renderFitnessCard = (lv) => {
    const selected = currentLevel === lv.key;
    return (
      <div
        key={lv.key}
        onClick={() => setCurrentLevel(lv.key)}
        className="uu-card uu-fitness-card"
        style={{
          background: selected ? "#2F3E50" : "#171E27",
        }}
      >
        <div className="uu-fitness-icon">
          <img src={lv.icon} alt="" />
        </div>
        <span className="font-paragraph-white">
          <T>{lv.label}</T>
        </span>
      </div>
    );
  };

  const detailField = (labelKey, value, setter, suffix) => (
    <div className="uu-detail-field">
      <span className="uu-detail-label font-paragraph-white">
        <T>{labelKey}</T>:
      </span>
      <InputNumber
        className="uu-detail-input"
        value={value}
        onChange={(v) => setter(v)}
      />
      {suffix && (
        <span className="uu-detail-suffix font-paragraph-white">{suffix}</span>
      )}
    </div>
  );

  const renderPhotoBox = (pic, setPic, progress, setProgress, requestFn) => {
    const previewSrc =
      typeof pic === "object" && pic
        ? URL.createObjectURL(pic)
        : typeof pic === "string" && pic.length > 0
          ? pic
          : HumanVector;
    return (
      <div className="uu-photo-column">
        <div className="uu-photo-box">
          {pic && (
            <button
              type="button"
              className="uu-photo-remove"
              onClick={() => {
                setPic("");
                setProgress(0);
              }}
            >
              <T>user_update.remove</T>
            </button>
          )}
          <img src={previewSrc} alt="upload-preview" className="uu-photo-img" />
        </div>
        <Upload
          accept="image/*"
          customRequest={requestFn}
          multiple={false}
          showUploadList={false}
          className="uu-photo-upload"
        >
          <div className="uu-file-input-row">
            <button type="button" className="uu-choose-file">
              <T>user_update.choose_file</T>
            </button>
            <span className="uu-file-name">
              {typeof pic === "object" && pic
                ? pic.name
                : translate("user_update.no_file_chosen")}
            </span>
          </div>
        </Upload>
      </div>
    );
  };

  if (pageLoading) {
    return (
      <div className="uu-page">
        <LoggedinNavbar />
        <div className="uu-loading">
          <LoadingOutlined style={{ fontSize: "80px", color: "#ff7700" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="uu-page">
      <LoggedinNavbar />

      <div className="uu-container">
        <div className="uu-header">
          <span
            className="uu-section-title uu-section-title-light"
            style={{ fontWeight: "600", margin: 0, padding: 0 }}
          >
            <T>user_update.update_values</T>
          </span>
          <button
            type="button"
            className="uu-header-close"
            onClick={() => history.goBack()}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="uu-card-block uu-block-withbg">
          <div className="uu-section-title uu-section-title-light">
            <T>user_update.your_goals</T>
          </div>
          <div className="uu-goal-row">
            {getDefaultGoals().map(renderGoalCard)}
          </div>

          <div className="uu-section-title uu-section-title-light">
            <T>user_update.current_fitness</T>
          </div>
          <div className="uu-fitness-grid">
            {fitnessLevels.map(renderFitnessCard)}
          </div>

          <div className="uu-section-title-row">
            <div className="uu-section-title uu-section-title-light">
              <T>user_update.other_details</T>
            </div>
            <div className="uu-metric-toggle">
              <button
                type="button"
                className={`uu-metric-btn ${metric ? "active" : ""}`}
                onClick={() => handleMetricToggle(true)}
              >
                <T>user_update.metric</T>
              </button>
              <button
                type="button"
                className={`uu-metric-btn ${!metric ? "active" : ""}`}
                onClick={() => handleMetricToggle(false)}
              >
                <T>user_update.imperial</T>
              </button>
            </div>
          </div>
          <div className="uu-detail-grid">
            {detailField(
              "user_update.height",
              height,
              setHeight,
              metric ? "cm" : "ft",
            )}
            {detailField(
              "user_update.shoulder_size",
              shoulderSize,
              setShoulderSize,
              metric ? "cm" : "in",
            )}
            {detailField(
              "user_update.waist_size",
              waistSize,
              setWaistSize,
              metric ? "cm" : "in",
            )}
            {detailField(
              "user_update.weight",
              weight,
              setWeight,
              metric ? "kg" : "lb",
            )}
            {detailField(
              "user_update.chest_size",
              chestSize,
              setChestSize,
              metric ? "cm" : "in",
            )}
            {detailField(
              "user_update.hip_size",
              hipSize,
              setHipSize,
              metric ? "cm" : "in",
            )}
            {detailField("user_update.age", age, setAge)}
            {detailField("user_update.bmi", bmi, setBmi)}
            {detailField("user_update.body_fat", bmr, setBmr, "%")}
          </div>
        </div>

        <div className="uu-card-block uu-block-withbg">
          <div className="uu-section-title uu-section-title-light">
            <T>user_update.fitness_interests</T>
          </div>
          <div className="uu-interest-grid">
            {allFitnessInterests.length === 0 ? (
              <div className="uu-interest-empty font-paragraph-white">
                <T>user_update.no_items_exist</T>
              </div>
            ) : (
              allFitnessInterests.map((i) => {
                const selected = selectedFitnessInterests.includes(i._id);
                return (
                  <span
                    key={i._id}
                    onClick={() => toggleInterest(i._id)}
                    className={`uu-interest-pill ${selected ? "selected" : ""}`}
                  >
                    <ForwardOutlined
                      className={`uu-interest-icon ${selected ? "selected" : ""}`}
                    />
                    <span>{i.name}</span>
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className="uu-card-block">
          <div className="uu-section-title-row">
            <div className="uu-section-title">
              <T>user_update.upload_your_pictures</T>
            </div>
          </div>
          <div className="uu-hide-row">
            <span className="font-paragraph-white">
              <T>user_update.hide_my_shape</T>
            </span>
            <GreenSwitch
              checked={hideMyShape}
              onChange={(v) => setHideMyShape(v)}
            />
          </div>
          <div className="uu-photo-grid">
            {renderPhotoBox(
              beforePic,
              setBeforePic,
              beforeProgress,
              setBeforeProgress,
              beforeFileRequest,
            )}
            {renderPhotoBox(
              afterPic,
              setAfterPic,
              afterProgress,
              setAfterProgress,
              afterFileRequest,
            )}
          </div>
        </div>

        <div className="uu-action-bar">
          <button
            type="button"
            className="uu-cancel-btn"
            onClick={() => history.goBack()}
          >
            <T>user_update.cancel</T>
          </button>
          <button
            type="button"
            className="uu-update-btn"
            onClick={saveUserUpdate}
            disabled={loading}
          >
            {loading && (
              <LoadingOutlined style={{ color: "#fff", marginRight: "8px" }} />
            )}
            <T>user_update.update</T>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserUpdate;
