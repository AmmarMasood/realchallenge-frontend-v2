import React, { useContext, useEffect } from "react";

import { Card } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import FileViewer from "react-file-viewer";
import PrivacyPolicyDocument from "../assets/documents/Privacy Policy - Real Challenge.docx";
import PrivacyPolicyDocumentDutch from "../assets/documents/Privacverklaring - Real Challenge.docx";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";

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
function PrivacyPolicy() {
  const { language } = useContext(LanguageContext);
  return (
    <>
      <Navbar color="dark" />
      <div style={bodyStyle}>
        <h1 className="font-heading-black privacy-policy-heading">
          <T>privacypolicy.heading</T>
        </h1>

        <Card style={{ height: "650px" }}>
          {language === "dutch" ? (
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

export default PrivacyPolicy;
