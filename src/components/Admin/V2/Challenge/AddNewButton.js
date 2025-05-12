import React from "react";
import PlusIcon from "../../../../assets/icons/plus-icon.svg";

const customStyle = {
  background: "#1B2632",
  padding: "5px",
  textAlign: "center",
  cursor: "pointer",
};

const customStyleSmall = {
  ...customStyle,
  width: "fit-content",
  padding: "5px 10px",
};
function AddNewButton({ onClick, style, type = "big" }) {
  return type === "big" ? (
    <div onClick={onClick} style={{ ...customStyle, ...style }}>
      <img src={PlusIcon} alt="plus icon" />
    </div>
  ) : (
    <div onClick={onClick} style={{ ...customStyleSmall, ...style }}>
      <img src={PlusIcon} alt="plus icon" />
    </div>
  );
}

export default AddNewButton;
