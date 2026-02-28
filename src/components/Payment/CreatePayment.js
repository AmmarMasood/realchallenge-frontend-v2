// import React, { useState, useEffect, useContext } from "react";
// import { Link, withRouter } from "react-router-dom";
// import "../../assets/createPayment.css";
// import { useTranslation } from "react-i18next";
// import { createPayment, mollieAuthUser } from "../../services/payment";
// import { getRecommandedChallenges } from "../../services/users";
// import { userInfoContext } from "../../contexts/UserStore";
// import { Scrollbars } from "react-custom-scrollbars";
// import {
//   FlagOutlined,
//   LoadingOutlined,
//   ArrowRightOutlined,
//   CaretRightOutlined,
// } from "@ant-design/icons";
// import ForwardIcon from "../../assets/icons/forward-arrows.png";
// import Checkbox from "antd/lib/checkbox/Checkbox";
// import Logo from "../../images/logo.png";
// import { Modal, Input, Divider } from "antd";
// import { selectedChallengeContext } from "../../contexts/PaymentProcessStore";

// function CreatePayment(props) {
//   const [userInfo, setUserInfo] = useContext(userInfoContext);
//   const [selectedChallenge, setSelectedChallenge] = useContext(
//     selectedChallengeContext
//   );
//   const [showCouponModal, setShowCouponModal] = useState(false);
//   const [challenges, setChallenges] = useState([]);
//   const [selectedChallenges, setSelectedChallenges] = useState([]);
//   const [pack, setPack] = useState("");
//   const [packInfo, setPackInfo] = useState({
//     noOfChallenges: "",
//     save: "",
//     price: "",
//     billed: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [challengeLoading, setChallengeLoading] = useState(false);

//   useEffect(() => {
//     const pack = localStorage.getItem("package-type");

//     if (pack === "CHALLENGE_12") {
//       setPackInfo({
//         noOfChallenges: "12",
//         save: "40%",
//         price: "19.99",
//         billed: "12",
//       });
//     }
//     if (pack === "CHALLENGE_1") {
//       setPackInfo({
//         noOfChallenges: "1",
//         save: "",
//         price: selectedChallenge.price ? selectedChallenge.price : "",
//         billed: "1",
//       });
//     }
//     if (pack === "CHALLENGE_3") {
//       setPackInfo({
//         noOfChallenges: "3",
//         save: "20%",
//         price: "26.00",
//         billed: "3",
//       });
//     }
//     setPack(pack.replace("_", " "));
//     selectedChallenge._id &&
//       setSelectedChallenges([selectedChallenge, ...selectedChallenges]);

//     fetchRecommandedChallenges();
//   }, []);

//   const fetchRecommandedChallenges = async () => {
//     console.log(userInfo.id);
//     setChallengeLoading(true);
//     const challenges = await getRecommandedChallenges(userInfo.id);
//     if (challenges) {
//       const filterFreeChallenges =
//         challenges.recommendedchallenge &&
//         challenges.recommendedchallenge.filter(
//           (c) => !c.access.includes("FREE")
//         );
//       console.log("filterFreeChallenges", filterFreeChallenges);
//       setChallenges(filterFreeChallenges);
//     }
//     setChallengeLoading(false);
//     // console.log(challenges);
//   };

//   const isChallengeChecked = (d) => {
//     const checked = selectedChallenges.filter((f) => f._id === d._id);
//     if (checked.length > 0) {
//       return true;
//     } else {
//       return false;
//     }
//   };

//   const addChallengeToArray = (value, d) => {
//     if (pack === "CHALLENGE 1") {
//       if (value) {
//         if (selectedChallenges.length < 1) {
//           !isChallengeChecked(d) &&
//             setSelectedChallenges([...selectedChallenges, d]);
//         } else {
//           alert("You can only choose 1 challenges at a single time.");
//         }
//       } else {
//         const f = isChallengeChecked(d)
//           ? selectedChallenges.filter((f) => f._id !== d._id)
//           : selectedChallenges;
//         setSelectedChallenges(f);
//       }
//     } else {
//       if (value) {
//         if (selectedChallenges.length <= 2) {
//           !isChallengeChecked(d) &&
//             setSelectedChallenges([...selectedChallenges, d]);
//         } else {
//           alert("You can only choose 3 challenges at a single time.");
//         }
//       } else {
//         const f = isChallengeChecked(d)
//           ? selectedChallenges.filter((f) => f._id !== d._id)
//           : selectedChallenges;
//         setSelectedChallenges(f);
//       }
//     }

//     console.log(value, d);
//     console.log("asdasdasd", selectedChallenges);
//   };

//   const sendRequestToMollie = async () => {
//     setLoading(true);
//     const pack = localStorage.getItem("package-type");
//     var data = {
//       id: userInfo.id,
//       name: userInfo.username,
//       email: userInfo.email,
//       currency: "EUR",
//       value: packInfo.price ? parseFloat(packInfo.price).toFixed(2) : "",
//       description: pack,
//       redirectUrl: `${process.env.REACT_APP_FRONTEND_SERVER}/mollie/create-subscribtion/redirect`,
//     };
//     if (pack === "CHALLENGE_1") {
//       if (selectedChallenges[0]) {
//         data = {
//           ...data,
//           currency:
//             selectedChallenges[0].currency &&
//             selectedChallenges[0].currency === "€"
//               ? "EUR"
//               : "USD",
//           value: selectedChallenges[0].price.toFixed(2),
//         };
//       } else {
//         alert("Please select the challenge that you want to pay for.");
//         setLoading(false);
//         return;
//       }
//     }
//     console.log(data);
//     var storeForLaterUse = {
//       currency: data.currency,
//       value: data.value,
//       // times: packInfo.billed,
//       interval: "1 month",
//       description: pack,
//     };
//     const res = await createPayment(data);
//     setLoading(false);
//     if (res) {
//       const link = res._links.checkout.href;
//       storeForLaterUse = {
//         ...storeForLaterUse,
//         custId: res.customerId,
//         id: userInfo.id,
//       };
//       localStorage.setItem("subObject", JSON.stringify(storeForLaterUse));
//       localStorage.setItem(
//         "selectedChallenges",
//         JSON.stringify(selectedChallenges)
//       );
//       window.location = link;
//     }
//     console.log("to be", res);
//   };

//   const getPackagePaymentInfo = () => (
//     <div className="create-payment-create-payment-info">
//       <h1 className="create-payment-font-heading-white">Payment Overview</h1>
//       <h3 className="create-payment-font-subheading-white">
//         Selected Package:{" "}
//         {pack === "CHALLENGE 1"
//           ? "CHALLENGE ONE"
//           : pack === "CHALLENGE 12"
//           ? "CHALLENGE TWELVE"
//           : pack === "CHALLENGE 3"
//           ? "CHALLENGE THREE"
//           : ""}
//       </h3>
//       {pack === "CHALLENGE 1" ? (
//         <div>
//           <h3 className="create-payment-font-subheading-white">{`Challenge Name: ${
//             selectedChallenges[0] ? selectedChallenges[0].challengeName : "-"
//           }`}</h3>
//           <h3 className="create-payment-font-heading-white">{`Total Price: ${
//             selectedChallenges[0]
//               ? selectedChallenges[0].currency + selectedChallenges[0].price
//               : "-"
//           }`}</h3>
//         </div>
//       ) : (
//         <>
//           <h3 className="create-payment-font-subheading-white">{`Package Price: € ${packInfo.price} / month`}</h3>
//           {selectedChallenges.length > 0 && (
//             <div>
//               <h3 className="create-payment-font-subheading-white">Selected Challenges:</h3>

//               {selectedChallenges.map((s) => (
//                 <p className="create-payment-font-heading-white">
//                   <CaretRightOutlined style={{ color: "#ff7700" }} />{" "}
//                   {s.challengeName}
//                 </p>
//               ))}
//             </div>
//           )}
//           <Divider style={{ borderTop: "1px solid #171e27" }} />
//           <h3 className="create-payment-font-heading-white">{`Total Price: € ${packInfo.price} / month`}</h3>
//         </>
//       )}
//       <div style={{ marginTop: "30px" }}>
//         <button
//           className="create-payment-common-orange-button font-paragraph-white"
//           onClick={() => setShowCouponModal(true)}
//           style={{ marginRight: "10px" }}
//         >
//           Add Coupon Code
//         </button>
//         {loading ? (
//           <LoadingOutlined style={{ color: "#ff7700", fontSize: "35px" }} />
//         ) : (
//           <button
//             className="create-payment-common-orange-button font-paragraph-white"
//             onClick={() => sendRequestToMollie()}
//           >
//             Checkout <ArrowRightOutlined />
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <Modal
//         visible={showCouponModal}
//         onCancel={() => setShowCouponModal(false)}
//         footer={false}
//       >
//         <h1 className="create-payment-font-heading-white">Enter Coupon Code</h1>
//         <Input />
//         <button
//           className="create-payment-common-orange-button font-paragraph-white"
//           style={{ marginTop: "10px" }}
//         >
//           Verify Code
//         </button>
//       </Modal>
//       <div className="create-payment-create-payment-page">
//         <img
//           src={Logo}
//           alt="real-challenge"
//           height="50px"
//           style={{ marginBottom: "10px" }}
//         />
//         <div className="create-payment-create-payment-container">
//           {console.log("selected challenges", selectedChallenges)}
//           <div className="create-payment-create-payment-card">
//             <h1 className="create-payment-font-heading-white">
//               Recommanded Challenges For You
//             </h1>
//             <p
//               className="create-payment-font-paragraph-white"
//               style={{ marginBottom: "20px" }}
//             >
//               {`Please select ${
//                 pack === "CHALLENGE 1"
//                   ? "1 challenge that you want to get access to."
//                   : "any 3 challenges that you want to get access to or move on with payment process"
//               } `}
//             </p>

//             <Scrollbars
//               style={{
//                 height: "450px",
//                 border: "2px solid var(--color-orange)",
//                 backgroundColor: "var(--color-gray)",
//                 position: "relative",
//               }}
//             >
//               {challengeLoading ? (
//                 <LoadingOutlined
//                   style={{
//                     color: "#ff7700",
//                     fontSize: "55px",
//                     padding: "50px",
//                   }}
//                 />
//               ) : (
//                 <div className="create-payment-dashboard-challenges-mychallenge-body">
//                   {challenges && challenges.length > 0 ? (
//                     challenges.map((d) => (
//                       <div
//                         style={{ display: "flex", alignItems: "center" }}
//                         key={d._id}
//                       >
//                         <div style={{ width: "100%" }}>
//                           <Link to={`/challenge/${d._id}`}>
//                             <div
//                               className="create-payment-dashboard-challenges-mychallenge-body-box"
//                               style={{
//                                 background: `url(${process.env.REACT_APP_SERVER}/api${d.thumbnailLink})`,
//                                 backgroundSize: "cover",
//                                 backgroundPosition: "50% 50%",
//                                 position: "relative",
//                               }}
//                             >
//                               {d.difficulty && (
//                                 <div
//                                   className="create-payment-dashboard-feed-container-card-row2-tag font-paragraph-white"
//                                   style={{
//                                     position: "absolute",
//                                     top: "0",
//                                     left: "0",
//                                   }}
//                                 >
//                                   <FlagOutlined
//                                     style={{ paddingRight: "2px" }}
//                                   />
//                                   {d.difficulty}
//                                 </div>
//                               )}
//                               <div className="create-payment-dashboard-challenges-mychallenge-body-box-insidebox">
//                                 <span className="create-payment-dashboard-challenges-mychallenge-body-box-insidebox-name font-heading-white">
//                                   {d.challengeName}
//                                 </span>
//                                 <span className="create-payment-dashboard-challenges-mychallenge-body-box-insidebox-about font-paragraph-white">
//                                   {d.description}
//                                 </span>
//                                 <img
//                                   src={ForwardIcon}
//                                   style={{ marginTop: "5px" }}
//                                   alt="forward"
//                                   height="15px"
//                                   width="40px"
//                                 />
//                               </div>
//                             </div>
//                           </Link>
//                         </div>
//                         {selectedChallenges.includes(d.id)}
//                         <Checkbox
//                           style={{ marginLeft: "10px" }}
//                           checked={isChallengeChecked(d)}
//                           onClick={(value) =>
//                             addChallengeToArray(value.target.checked, d)
//                           }
//                         />
//                       </div>
//                     ))
//                   ) : (
//                     <h2 className="create-payment-font-heading-white">No Challenges Found.</h2>
//                   )}
//                 </div>
//               )}
//             </Scrollbars>
//           </div>

//           {getPackagePaymentInfo()}
//         </div>
//       </div>
//     </>
//   );
// }

// export default withRouter(CreatePayment);
import React, { useState, useEffect, useContext } from "react";
import { Link, withRouter, useHistory } from "react-router-dom";
import PaymentPoints from "../../assets/icons/payment-points-logo.png";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DownOutlined,
  LoadingOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Collapse, Input } from "antd";

import { userInfoContext, userPointsContext } from "../../contexts/UserStore";
import { selectedChallengeContext } from "../../contexts/PaymentProcessStore";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

import "../../assets/createPayment.css";
import VerifyUser from "../UserDashboard/VerifyUser";
import { createPayment } from "../../services/payment";
import { getCouponByCode, getCouponDiscount } from "../../services/coupons";
import { redeemPoints } from "../../services/users";
import { usePackageConfig } from "../../contexts/PackageConfigContext";

function CreatePayment(props) {
  const { strings } = useContext(LanguageContext);
  const { getPackage } = usePackageConfig();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState([]);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [userPoints, setUserPoints] = useContext(userPointsContext);
  const [selectedChallenge, setSelectedChallenge] = useContext(
    selectedChallengeContext
  );
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState("");
  const [packInfo, setPackInfo] = useState({
    name: "",
    noOfChallenges: "",
    save: "",
    price: "",
    billed: "",
  });
  const [couponButtonLoading, setCouponButtonLoading] = useState(false);
  const history = useHistory();

  // Redirect if no package selected or if CHALLENGE_1 has no challenge
  useEffect(() => {
    const packType = localStorage.getItem("package-type");
    if (!packType) {
      history.replace("/user/dashboard");
      return;
    }
    if (packType === "CHALLENGE_1" && !selectedChallenge?._id) {
      history.replace("/user/dashboard");
    }
  }, [history, selectedChallenge]);

  const getDiscountFromPoints = async () => {
    if (pointsRedeemed) {
      alert("Points have already been redeemed for this order.");
      return;
    }
    if (userPoints < 100) {
      alert("You need at least 100 points to redeem.");
      return;
    }

    // Redeem all available points
    const res = await redeemPoints(userPoints, setUserPoints);
    if (res && res.success) {
      const discount = res.discount;
      const packType = localStorage.getItem("package-type");
      if (packType === "CHALLENGE_1") {
        const newPrice = selectedChallenge.price - discount;
        setSelectedChallenge({ ...selectedChallenge, price: newPrice });
        setPackInfo((prev) => ({ ...prev, price: newPrice }));
      } else {
        setPackInfo((prev) => ({
          ...prev,
          price: parseFloat(prev.price) - discount,
        }));
      }
      setPointsRedeemed(true);
    }
  };

  const checkCouponCode = async () => {
    if (couponApplied) {
      alert("A coupon has already been applied to this order.");
      return;
    }
    if (!couponCode.trim()) {
      alert("Please enter a coupon code.");
      return;
    }
    setCouponButtonLoading(true);
    const couponInfo = await getCouponByCode(couponCode);

    if (couponInfo && couponInfo.success) {
      const coupon = couponInfo.data.coupon;
      const packType = localStorage.getItem("package-type");

      // Determine which coupon plan label matches the current package
      const packageToCouponLabel = {
        CHALLENGE_1: "CHALLENGE ONE",
        CHALLENGE_3: "CHALLENGE THREE",
        CHALLENGE_12: "CHALLENGE TWELVE",
      };
      const couponLabel = packageToCouponLabel[packType];
      const isApplicable =
        coupon.applicableOn.includes("ALL") ||
        (couponLabel && coupon.applicableOn.includes(couponLabel));

      if (!isApplicable) {
        alert("This code is not valid for this subscription package.");
        setCouponButtonLoading(false);
        return;
      }

      // For CHALLENGE_1, check if coupon is restricted to specific challenges
      if (
        packType === "CHALLENGE_1" &&
        coupon.challengesApplicableOn &&
        coupon.challengesApplicableOn.length > 0 &&
        !coupon.challengesApplicableOn.includes(selectedChallenge._id)
      ) {
        alert("Coupon isn't available for the selected challenge!");
        setCouponButtonLoading(false);
        return;
      }

      // Mark coupon as used on the server
      const res = await getCouponDiscount(coupon._id);
      if (res && res.success) {
        const discountFraction = coupon.discountPercent / 100;
        if (packType === "CHALLENGE_1") {
          const newPrice =
            selectedChallenge.price -
            selectedChallenge.price * discountFraction;
          setSelectedChallenge({ ...selectedChallenge, price: newPrice });
          setPackInfo((prev) => ({ ...prev, price: newPrice }));
        } else {
          setPackInfo((prev) => ({
            ...prev,
            price:
              parseFloat(prev.price) -
              parseFloat(prev.price) * discountFraction,
          }));
        }
        setCouponApplied(true);
      }
    }
    setCouponButtonLoading(false);
  };

  useEffect(() => {
    const packType = localStorage.getItem("package-type");
    if (!packType) return;
    const packageConfig = getPackage(packType);

    if (packType === "CHALLENGE_1") {
      // One-time challenge uses the challenge's own price
      setPackInfo({
        name: packageConfig?.displayName || "One-Time Challenge",
        noOfChallenges: String(packageConfig?.challengesAllowed || 1),
        save: packageConfig?.savingsPercent || "",
        price: selectedChallenge.price ? selectedChallenge.price : "",
        billed: String(packageConfig?.billingInterval || 1),
      });
    } else if (packageConfig) {
      // Subscription packages use config prices
      setPackInfo({
        name: packageConfig.displayName,
        noOfChallenges: String(packageConfig.challengesAllowed),
        save: packageConfig.savingsPercent || "",
        price: String(packageConfig.price),
        billed: String(packageConfig.billingInterval),
      });
    }
    setPack(packType ? packType.replace("_", " ") : "");
  }, [getPackage, selectedChallenge.price]);

  const sendRequestToMollie = async () => {
    setLoading(true);
    const pack = localStorage.getItem("package-type");
    var data = {
      id: userInfo.id,
      name: userInfo.username,
      email: userInfo.email,
      currency: "EUR",
      value: packInfo.price ? parseFloat(packInfo.price).toFixed(2) : "",
      description: pack,
      redirectUrl: `${process.env.REACT_APP_FRONTEND_SERVER}/mollie/create-subscribtion/redirect`,
    };
    if (pack === "CHALLENGE_1") {
      if (selectedChallenge) {
        data = {
          ...data,
          currency:
            selectedChallenge.currency && selectedChallenge.currency === "€"
              ? "EUR"
              : "USD",
          value: selectedChallenge.price.toFixed(2),
        };
      } else {
        alert("Please select the challenge that you want to pay for.");
        setLoading(false);
        return;
      }
    }
    console.log(data);
    var storeForLaterUse = {
      currency: data.currency,
      value: data.value,
      // times: packInfo.billed,
      interval: "1 month",
      description: pack,
    };
    const res = await createPayment(data);
    setLoading(false);
    if (res) {
      const link = res._links.checkout.href;
      storeForLaterUse = {
        ...storeForLaterUse,
        custId: res.customerId,
        id: userInfo.id,
      };
      localStorage.setItem("subObject", JSON.stringify(storeForLaterUse));
      localStorage.setItem(
        "selectedChallenges",
        JSON.stringify([selectedChallenge])
      );
      window.location = link;
    }
    console.log("to be", res);
  };

  return (
    <div
      style={{
        backgroundColor: "#2a2f36",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VerifyUser fromNewWelcomeScreen={true} />
      <div style={{ display: "flex" }}>
        <Link to=""></Link>
      </div>
      <button
        onClick={() => history.goBack()}
        className="font-paragraph-white"
        style={{
          color: "#fff",
          fontSize: "18px",
          backgroundColor: "var(--mirage)",
          padding: "10px ",
          margin: "10px 0 0 50px",
          position: "absolute",
          border: "none",
          cursor: "pointer",
          top: "0",
          left: "0",
        }}
      >
        <ArrowLeftOutlined /> {get(strings, "payment.back", "Back")}
      </button>
      <div className="create-payment-overlap-group-1">
        <h1 className="font-heading-white" style={{ marginBottom: "40px" }}>
          {get(strings, "payment.overview", "Overview")}
        </h1>
        {/* ---- */}
        <div className="create-payment-undercover">
          <div className="font-paragraph-white" style={{ fontWeight: "600" }}>
            {packInfo.name}
          </div>
          <div className="font-paragraph-white" style={{ fontWeight: "600" }}>
            {packInfo.noOfChallenges === "1"
              ? `${selectedChallenge.currency} ${parseFloat(selectedChallenge.price || 0).toFixed(2)}`
              : `€ ${parseFloat(packInfo.price || 0).toFixed(2)}`}
          </div>
        </div>
        {/* ---- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <div
            className="font-paragraph-white"
            style={{ color: "rgba(196, 196, 196, 1)", cursor: "pointer" }}
            onClick={() => {
              if (packInfo.noOfChallenges === "1" && selectedChallenge._id) {
                const win = window.open(
                  `challenge/${selectedChallenge._id}`,
                  "_blank"
                );
                win.focus();
              }
            }}
          >
            {packInfo.noOfChallenges === "1"
              ? selectedChallenge.challengeName
              : get(strings, "payment.unlock_features_months", "Unlock all features for {{months}} months").replace("{{months}}", packInfo.noOfChallenges === "3" ? "3" : "12")}
          </div>
          <div
            className="font-paragraph-white"
            style={{ color: "rgba(196, 196, 196, 1)" }}
          >
            {packInfo.noOfChallenges === "1"
              ? get(strings, "payment.one_time_payment", "One Time Payment")
              : get(strings, "payment.auto_monthly_payment", "Automatically Monthly Payment")}
          </div>
        </div>
        {/* ---- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontWeight: "500",
            fontStyle: "normal",
            fontSize: "20px",
            lineHeight: "20px",
            marginTop: "30px",
          }}
        >
          <div className="font-paragraph-white" style={{ fontWeight: "600" }}>
            {get(strings, "payment.challenge_points", "Challenge Points")}
          </div>
          <div
            className="font-paragraph-white"
            style={{ color: "rgba(196, 196, 196, 1)", fontSize: "14px" }}
          >
            <span>
              {get(strings, "payment.your_balance_is", "Your balance is")} <img src={PaymentPoints} alt="" /> {userPoints}{" "}
              {get(strings, "payment.points", "points")}
              {userPoints > 0 &&
                `(€${userPoints / 100} or $${userPoints / 100})`}
            </span>{" "}
            <br />
            <span> {get(strings, "payment.min_balance_redeem", "Minimum Balance in order to redeem: 100")}</span>
          </div>
        </div>
        <button
          style={{
            color: "#676868",
            fontSize: "14px",
            border: "1px solid #676868",
            backgroundColor: "transparent",
            width: "120px",
            padding: "5px",
            marginTop: "10px",
            cursor: "pointer",
          }}
          onClick={() => getDiscountFromPoints()}
        >
          {get(strings, "payment.redeem_points", "Redeem Points")}
        </button>
        {/* ---- */}

        <Collapse
          // defaultActiveKey={["1"]}
          onChange={(e) => setShowCouponModal(e)}
        >
          <Collapse.Panel
            style={{ backgroundColor: "var(--mirage)" }}
            showArrow={false}
            header={
              <>
                <div
                  style={{
                    fontWeight: "500",
                    fontStyle: "normal",
                    fontSize: "20px",
                    lineHeight: "20px",
                    marginTop: "30px",
                    marginLeft: "-12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  className="font-paragraph-white"
                >
                  <span>{get(strings, "payment.coupon_code", "Coupon Code")}</span>
                  <span>
                    {showCouponModal.length > 0 ? (
                      <DownOutlined />
                    ) : (
                      <UpOutlined />
                    )}
                  </span>
                </div>
                <div className="create-payment-rectangle-1885"></div>
              </>
            }
            key="1"
          >
            <div
              style={{
                background: "var(--mirage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={get(strings, "payment.enter_voucher", "Enter Voucher")}
                style={{ width: "70%" }}
              />
              {couponButtonLoading ? (
                <LoadingOutlined style={{ color: "#fff", fontSize: "30px" }} />
              ) : (
                <button
                  style={{
                    color: "#676868",
                    fontSize: "14px",
                    border: "1px solid #676868",
                    backgroundColor: "transparent",
                    width: "120px",
                    padding: "5px",
                    marginLeft: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => checkCouponCode()}
                >
                  {get(strings, "payment.redeem_code", "Redeem Code")}
                </button>
              )}
            </div>
          </Collapse.Panel>
        </Collapse>
        {/* ----- */}
        <div
          className="font-paragraph-white"
          style={{
            color: "rgba(196, 196, 196, 1)",
            fontSize: "14px",
            marginTop: "30px",
          }}
        >
          {get(strings, "payment.summary", "SUMMARY")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "600",
            fontStyle: "normal",
            fontSize: "20px",
            lineHeight: "20px",
          }}
        >
          <div className="font-paragraph-white">{get(strings, "payment.order_total", "Order Total")}</div>
          <div className="font-paragraph-white">
            {packInfo.noOfChallenges === "1"
              ? `${selectedChallenge.currency} ${parseFloat(selectedChallenge.price || 0).toFixed(2)}`
              : `€ ${parseFloat(packInfo.price || 0).toFixed(2)}`}
            {/* {`€ ${packInfo.price}`} */}
          </div>
        </div>
        {/* ----- */}
        <div
          style={{
            width: "100%",
            marginTop: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <LoadingOutlined style={{ color: "#e67936", fontSize: "30px" }} />
          ) : (
            <div
              className="create-payment-check-out poppins-medium-white-20px"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
              onClick={sendRequestToMollie}
            >
              <span
                className="font-paragraph-white"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                {get(strings, "payment.check_out", "Check out")}
              </span>
              <ArrowRightOutlined
                style={{ color: "#fff", fontSize: "20px", marginLeft: "10px" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withRouter(CreatePayment);
