import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import slug from "elegant-slug";

import { completeOrder } from "../../services/payment";

// Where Mollie sends the user back to. Mollie uses this redirect for EVERY
// outcome — paid, cancelled, failed, expired — and its "Previous page" button
// lands here too. So nothing is granted here: the server re-reads the payment
// from Mollie and decides. This page only reports the result.
function MollieRedirectPage(props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    finishPurchase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearCheckout = () => {
    localStorage.removeItem("subObject");
    localStorage.removeItem("selectedChallenges");
    localStorage.removeItem("package-type");
  };

  const returnTarget = () => {
    const stored = localStorage.getItem("selectedChallenges");
    const challenge = stored ? (JSON.parse(stored) || [])[0] : null;
    return challenge && challenge._id
      ? `/challenge/${slug(challenge.challengeName || "")}/${challenge._id}`
      : "/user/dashboard";
  };

  const finishPurchase = async () => {
    const subObject = localStorage.getItem("subObject");
    if (!subObject) {
      props.history.push("/user/dashboard");
      return;
    }

    const data = JSON.parse(subObject);
    if (!data.paymentId) {
      // Checkout started before payment verification existed; nothing can be
      // confirmed, so grant nothing.
      clearCheckout();
      props.history.push("/user/dashboard");
      return;
    }

    const target = returnTarget();
    const res = await completeOrder(data.paymentId);

    if (res.success) {
      clearCheckout();
      props.history.push(target);
      return;
    }

    if (res.notPaid) {
      // Cancelled or abandoned. Keep the checkout details so the user can
      // resume, and send them back to where they started.
      setFailed(true);
      setTimeout(() => props.history.push(target), 2500);
      return;
    }

    setFailed(true);
    setTimeout(() => props.history.push("/user/dashboard"), 2500);
  };

  return (
    <div className="center-inpage" style={{ textAlign: "center" }}>
      {failed ? (
        <h1 className="font-heading-black">
          PAYMENT WAS NOT COMPLETED. TAKING YOU BACK.
        </h1>
      ) : (
        <>
          <LoadingOutlined style={{ fontSize: "60px", color: "#ff7700" }} />
          <h1 className="font-heading-black">
            PLEASE WAIT WHILE WE CONFIRM YOUR PAYMENT.
          </h1>
        </>
      )}
    </div>
  );
}

export default withRouter(MollieRedirectPage);
