import React from "react";

function LandingPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "20px",
          color: "#ff7700",
        }}
      >
        Landing Page Coming Soon!
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          marginBottom: "30px",
          maxWidth: "600px",
          lineHeight: "1.6",
        }}
      >
        Please go to{" "}
        <a
          href="https://app.realchallenge.nl"
          style={{
            color: "#ff7700",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          app.realchallenge.nl
        </a>{" "}
        to access the application.
      </p>
    </div>
  );
}

export default LandingPage;
