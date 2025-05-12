import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { createSubscribtion } from "../../services/payment";
import { LoadingOutlined } from "@ant-design/icons";
import { addChallengeToCustomerDetail } from "../../services/customer";

import _ from "lodash";

function MollieRedirectPage(props) {
  useEffect(() => {
    createSub();
  }, []);

  const createSub = async () => {
    const subObject = localStorage.getItem("subObject");
    const selectedChallenges = localStorage.getItem("selectedChallenges");

    if (subObject) {
      console.log("retrievedObject: ", JSON.parse(subObject));
      console.log("selectedChallenges:", JSON.parse(selectedChallenges));
      const data = JSON.parse(subObject);
      const res = await createSubscribtion(data);
      if (res) {
        const sC = selectedChallenges ? JSON.parse(selectedChallenges) : [];
        if (sC.length > 0 && !_.isEmpty(sC[0])) {
          const responses = [];
          for (var i = 0; i < sC.length; i++) {
            responses.push(
              await addChallengeToCustomerDetail(data.id, sC[i]._id)
            );
          }

          localStorage.removeItem("subObject");
          localStorage.removeItem("selectedChallenges");
          localStorage.removeItem("package-type");
          props.history.push("/user/dashboard");
        } else {
          localStorage.removeItem("subObject");
          localStorage.removeItem("selectedChallenges");
          localStorage.removeItem("package-type");
          props.history.push("/user/dashboard");
        }
      }
      console.log("subscribtion respinse", res);
    } else {
      props.history.push("/create-payment");
    }
  };
  return (
    <div className="center-inpage" style={{ textAlign: "center" }}>
      <LoadingOutlined style={{ fontSize: "60px", color: "#ff7700" }} />
      <h1 className="font-heading-black">
        PLEASE WAIT WHILE WE REDIRECT YOU TO DASHBOARD.
      </h1>
    </div>
  );
}

export default withRouter(MollieRedirectPage);
