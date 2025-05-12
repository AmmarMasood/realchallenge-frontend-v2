import { CaretDownOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React, { useContext } from "react";
import { LanguageContext } from "../../contexts/LanguageContext";

function LanguageSelector({ notFromNav }) {
  const { language, updateLanguage } = useContext(LanguageContext);

  const languageChooser = (
    <div
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
    >
      <span
        onClick={() => {
          updateLanguage("english");
        }}
        className="font-paragraph-white nav-links"
      >
        English
      </span>
      <span
        onClick={() => {
          updateLanguage("dutch");
        }}
        className="font-paragraph-white nav-links"
      >
        Dutch
      </span>
    </div>
  );

  return (
    <Popover placement="bottom" content={languageChooser} trigger="click">
      <span
        className="font-paragraph-white"
        style={{ cursor: "pointer", color: notFromNav ? "black" : "#fff" }}
      >
        {language} <CaretDownOutlined />
      </span>
    </Popover>
  );
}

export default LanguageSelector;
