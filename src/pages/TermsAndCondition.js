import React, { useContext, useEffect } from "react";
import { Card } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import FileViewer from "react-file-viewer";
import PrivacyPolicyDocument from "../assets/documents/Terms and Conditions - Real Challenge.docx";
import PrivacyPolicyDocumentDutch from "../assets/documents/Algemene Voorwaarden - Real Challenge.docx";
import { T } from "../components/Translate";

const bodyStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  width: "100%",
  height: "115vh",
  paddingTop: "50px",
  backgroundColor: "#e1e9f2",
};

const type = "docx";

const onError = (e) => {
  console.log(e, "error in file-viewer");
};
function TermsAndCondition() {
  return (
    <>
      <Navbar color="dark" />
      <div style={bodyStyle}>
        <h1 className="font-heading-black privacy-policy-heading">
          <T>toc.heading</T>
        </h1>

        <Card style={{ height: "650px" }}>
          {localStorage.getItem("locale") === "du" ? (
            <div></div>
          ) : (
            // todo do later
            // <FileViewer
            //   fileType={type}
            //   filePath={PrivacyPolicyDocumentDutch}
            //   // errorComponent={CustomErrorComponent}
            //   onError={onError}
            // />
            <div></div>
            // todo do later
            // <FileViewer
            //   fileType={type}
            //   filePath={PrivacyPolicyDocument}
            //   // errorComponent={CustomErrorComponent}
            //   onError={onError}
            // />
          )}
        </Card>
      </div>
      <Footer />
    </>
  );
}

export default TermsAndCondition;
