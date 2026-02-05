import React from "react";
import "./Attachment.css";
import AddNewButton from "../../Challenge/AddNewButton";

function Attachment({
  logo,
  onClick,
  heading,
  selectedValue,
  setSelectedValue,
}) {
  return (
    <div style={{
      minWidth: "300px"
    }}>
      <p
        className="font-paragraph-white"
        style={{
          fontSize: "14px",
          color: "#555A61",
        }}
      >
        {heading}
      </p>
      <div className="v2attachment-container">
        <img src={logo} alt="attachment logo" className="v2attachment-logo" />
        {selectedValue ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingTop: "8px",
            }}
          >
            <p
              className="font-paragraph-white"
              style={{
                margin: "0px",
                marginLeft: "50px",
                width: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedValue.name}
            </p>
            <span
              style={{
                marginLeft: "10px",
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={() => {
                setSelectedValue(null);
              }}
            >
              X
            </span>
          </div>
        ) : (
          <AddNewButton onClick={onClick} style={{ padding: "10px" }} />
        )}
      </div>
    </div>
  );
}

export default Attachment;
