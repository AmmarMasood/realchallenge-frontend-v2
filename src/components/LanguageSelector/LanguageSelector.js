import { CaretDownOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import React, { useContext } from "react";
import { LanguageContext } from "../../contexts/LanguageContext";
import {
  SUPPORTED_LANGUAGES,
  getLanguageLabel,
} from "../../config/languages";

function LanguageSelector({ notFromNav }) {
  const { language, updateLanguage } = useContext(LanguageContext);

  const languageChooser = (
    <div
      style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <span
          key={lang.code}
          onClick={() => {
            updateLanguage(lang.code);
          }}
          className="font-paragraph-white nav-links"
          style={{
            fontWeight: language === lang.code ? "bold" : "normal",
            marginBottom: "5px",
          }}
        >
          {lang.flag} {lang.label}
        </span>
      ))}
    </div>
  );

  return (
    <Popover placement="bottom" content={languageChooser} trigger="click">
      <span
        className="font-paragraph-white"
        style={{ cursor: "pointer", color: notFromNav ? "black" : "#fff" }}
      >
        {getLanguageLabel(language)} <CaretDownOutlined />
      </span>
    </Popover>
  );
}

export default LanguageSelector;
