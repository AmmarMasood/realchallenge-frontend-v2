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
import { Collapse, Input, Select } from "antd";

import { userInfoContext, userPointsContext } from "../../contexts/UserStore";
import { selectedChallengeContext } from "../../contexts/PaymentProcessStore";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

import "../../assets/createPayment.css";
import VerifyUser from "../UserDashboard/VerifyUser";
import { createPayment } from "../../services/payment";
import { getCouponByCode, getCouponDiscount } from "../../services/coupons";
import { redeemPoints, saveBillingDetails, getUserProfileInfo } from "../../services/users";

import { usePackageConfig } from "../../contexts/PackageConfigContext";
import { toCurrencyCode, toCurrencySymbol } from "../../helpers/currency";

// EU member states first — VAT on digital services is charged at the customer's
// own country's rate, so this list is what decides what they pay. A handful of
// common non-EU destinations follow; sales there are outside EU VAT.
const BILLING_COUNTRIES = [
  { code: "NL", name: "Nederland / Netherlands" },
  { code: "BE", name: "België / Belgium" },
  { code: "DE", name: "Deutschland / Germany" },
  { code: "AT", name: "Austria" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "GB", name: "United Kingdom" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "US", name: "United States" },
];

function CreatePayment(props) {
  const { strings, language } = useContext(LanguageContext);
  const { getPackage } = usePackageConfig();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  // The validated-but-not-yet-redeemed coupon. It is sent with the checkout
  // request so the server applies the discount itself; the price shown here is
  // only a preview.
  const [appliedCoupon, setAppliedCoupon] = useState(null);
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
  // Billing address. A VAT invoice is not valid without a postal address, and
  // the country decides the VAT rate — EU digital services are taxed where the
  // customer lives, so without this everyone is assumed Dutch at 21%.
  const [billing, setBilling] = useState({
    streetAndNumber: "",
    postalCode: "",
    city: "",
    country: "NL",
    vatNumber: "",
  });
  const [billingError, setBillingError] = useState(null);
  // EU distance selling: digital content delivered immediately only escapes the
  // 14-day withdrawal right if the buyer expressly consents and acknowledges
  // losing it. Recorded per order with the exact wording shown.
  const [consented, setConsented] = useState(false);
  const [consentError, setConsentError] = useState(null);
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

      // Validates only — the coupon is redeemed server-side once the payment is
      // confirmed. Spending it here burned the code on abandoned checkouts.
      const res = await getCouponDiscount(coupon._id, {
        packageType: packType,
        challengeId: selectedChallenge && selectedChallenge._id,
      });
      if (res && res.success) {
        // Display the price the SERVER computed. Recomputing the discount here
        // rounded the half-cent the other way, so a €24.95 challenge at 30% off
        // showed €17.46 and charged €17.47.
        const serverPrice =
          res.data && res.data.pricing ? res.data.pricing.price : null;
        const discountFraction = coupon.discountPercent / 100;
        const fallback = (base) =>
          Math.round(parseFloat(base) * (1 - discountFraction) * 100) / 100;

        if (packType === "CHALLENGE_1") {
          const newPrice =
            serverPrice != null ? serverPrice : fallback(selectedChallenge.price);
          setSelectedChallenge({ ...selectedChallenge, price: newPrice });
          setPackInfo((prev) => ({ ...prev, price: newPrice }));
        } else {
          setPackInfo((prev) => ({
            ...prev,
            price: serverPrice != null ? serverPrice : fallback(prev.price),
          }));
        }
        setCouponApplied(true);
        setAppliedCoupon(coupon);
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

  // Prefill from whatever the customer saved last time, so a returning buyer is
  // not retyping their address on every purchase.
  useEffect(() => {
    if (!userInfo?.id) return;
    let cancelled = false;
    (async () => {
      const res = await getUserProfileInfo(userInfo.id);
      const u = res?.customer || res?.user || res;
      if (cancelled || !u) return;
      setBilling((prev) => ({
        streetAndNumber: u.streetAndNumber || prev.streetAndNumber,
        postalCode: u.postalCode || prev.postalCode,
        city: u.city || prev.city,
        country: u.country || prev.country,
        vatNumber: u.vatNumber || prev.vatNumber,
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [userInfo]);

  const billingIsComplete = () =>
    Boolean(
      billing.streetAndNumber.trim() &&
        billing.postalCode.trim() &&
        billing.city.trim() &&
        billing.country
    );

  const sendRequestToMollie = async () => {
    // Collected before payment rather than after: the invoice has to be issued
    // the moment the payment confirms, and the country sets the VAT rate that
    // the customer is about to be charged.
    if (!billingIsComplete()) {
      setBillingError(
        get(strings, "payment.billing_required", "Please enter your billing address to continue.")
      );
      return;
    }
    setBillingError(null);

    if (!consented) {
      setConsentError(
        get(strings, "payment.consent_required", "Please tick this to continue.")
      );
      return;
    }
    setConsentError(null);

    setLoading(true);
    const saved = await saveBillingDetails(userInfo.id, {
      streetAndNumber: billing.streetAndNumber.trim(),
      postalCode: billing.postalCode.trim(),
      city: billing.city.trim(),
      country: billing.country,
      ...(billing.vatNumber.trim() ? { vatNumber: billing.vatNumber.trim() } : {}),
    });
    if (!saved.success) {
      setLoading(false);
      setBillingError(
        get(strings, "payment.billing_save_failed", "We couldn't save your billing details. Please try again.")
      );
      return;
    }

    const pack = localStorage.getItem("package-type");
    var data = {
      id: userInfo.id,
      name: userInfo.username,
      email: userInfo.email,
      currency: "EUR",
      value: packInfo.price ? parseFloat(packInfo.price).toFixed(2) : "",
      // `description` is shown to the customer on Mollie's checkout page and on
      // their bank statement, so it carries a readable name. `packageType` is
      // the machine value all the purchase logic branches on — the two were the
      // same field before, which is why checkout read "CHALLENGE_1".
      description: packInfo.name || pack,
      packageType: pack,
      // Recorded server-side against the payment, so fulfilment grants what was
      // actually bought rather than whatever the browser reports on return.
      challengeIds: selectedChallenge && selectedChallenge._id
        ? [selectedChallenge._id]
        : [],
      // The server re-validates this and computes the discount itself. `value`
      // above is advisory only: the amount charged is resolved from the
      // challenge/package record, never from what the browser posts.
      couponId: appliedCoupon ? appliedCoupon._id : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      // The literal sentence they ticked, so a dispute can be answered with what
      // was actually agreed rather than whatever the copy says later.
      consent: {
        text: get(
          strings,
          "payment.consent_label",
          "I want immediate access and I understand that I give up my 14-day right of withdrawal."
        ),
        locale: language,
      },
      redirectUrl: `${process.env.REACT_APP_FRONTEND_SERVER}/mollie/create-subscribtion/redirect`,
    };
    if (pack === "CHALLENGE_1") {
      if (selectedChallenge && selectedChallenge._id) {
        data = {
          ...data,
          currency: toCurrencyCode(selectedChallenge.currency),
          value: parseFloat(selectedChallenge.price).toFixed(2),
          description: selectedChallenge.challengeName || packInfo.name || pack,
        };
      } else {
        alert("Please select the challenge that you want to pay for.");
        setLoading(false);
        return;
      }
    }
    var storeForLaterUse = {
      currency: data.currency,
      value: data.value,
      // times: packInfo.billed,
      interval: "1 month",
      description: data.description,
      packageType: pack,
    };
    const res = await createPayment(data);
    setLoading(false);
    if (res) {
      const link = res._links.checkout.href;
      storeForLaterUse = {
        ...storeForLaterUse,
        custId: res.customerId,
        id: userInfo.id,
        // The payment to verify on return. Everything else here is display
        // only — the server fulfils from its own record of this payment.
        paymentId: res.id,
      };
      localStorage.setItem("subObject", JSON.stringify(storeForLaterUse));
      localStorage.setItem(
        "selectedChallenges",
        JSON.stringify([selectedChallenge])
      );
      window.location = link;
    }
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
              ? `${toCurrencySymbol(selectedChallenge.currency)} ${parseFloat(selectedChallenge.price || 0).toFixed(2)}`
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
              : get(
                  strings,
                  "payment.unlock_features_months",
                  "Unlock all features for {{months}} months"
                  // Duration comes from the plan's billing interval. It used to
                  // be derived from `noOfChallenges` (the challenge cap), so the
                  // 3-month plan — which includes 2 challenges — advertised 12.
                ).replace("{{months}}", packInfo.billed || "12")}
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
        {/* Billing address. Required before payment: an EU VAT invoice is not
            valid without a postal address, and the country decides the rate the
            customer is about to be charged. */}
        <div
          className="font-paragraph-white"
          style={{
            color: "rgba(196, 196, 196, 1)",
            fontSize: "14px",
            marginTop: "30px",
          }}
        >
          {get(strings, "payment.billing_details", "Billing details")}
        </div>
        <div
          className="font-paragraph-white"
          style={{ fontSize: "12px", color: "#9F9F9F", marginTop: "4px" }}
        >
          {get(strings, "payment.billing_why", "Needed for your invoice and to charge the right VAT.")}
        </div>
        <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
          <Input
            value={billing.streetAndNumber}
            onChange={(e) =>
              setBilling({ ...billing, streetAndNumber: e.target.value })
            }
            placeholder={get(strings, "payment.street_and_number", "Street and house number")}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              value={billing.postalCode}
              onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}
              placeholder={get(strings, "payment.postal_code", "Postcode")}
              style={{ width: "40%" }}
            />
            <Input
              value={billing.city}
              onChange={(e) => setBilling({ ...billing, city: e.target.value })}
              placeholder={get(strings, "payment.city", "City")}
              style={{ width: "60%" }}
            />
          </div>
          <Select
            value={billing.country}
            onChange={(value) => setBilling({ ...billing, country: value })}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="children"
            placeholder={get(strings, "payment.country", "Country")}
          >
            {BILLING_COUNTRIES.map((c) => (
              <Select.Option key={c.code} value={c.code}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
          <Input
            value={billing.vatNumber}
            onChange={(e) => setBilling({ ...billing, vatNumber: e.target.value })}
            placeholder={get(strings, "payment.vat_number", "VAT number (optional, businesses only)")}
          />
          {billingError ? (
            <div style={{ color: "#c0392b", fontSize: "13px" }}>{billingError}</div>
          ) : null}
        </div>
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
              ? `${toCurrencySymbol(selectedChallenge.currency)} ${parseFloat(selectedChallenge.price || 0).toFixed(2)}`
              : `€ ${parseFloat(packInfo.price || 0).toFixed(2)}`}
          </div>
        </div>
        {/* ----- */}
        {/* Required before payment. Digital content delivered immediately only
            escapes the EU 14-day withdrawal right with explicit consent. */}
        <label
          className="font-paragraph-white"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginTop: "24px",
            fontSize: "13px",
            lineHeight: "1.4",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => {
              setConsented(e.target.checked);
              if (e.target.checked) setConsentError(null);
            }}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <span>
            {get(
              strings,
              "payment.consent_label",
              "I want immediate access and I understand that I give up my 14-day right of withdrawal."
            )}
          </span>
        </label>
        {consentError ? (
          <div style={{ color: "#c0392b", fontSize: "13px", marginTop: "6px" }}>
            {consentError}
          </div>
        ) : null}
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
