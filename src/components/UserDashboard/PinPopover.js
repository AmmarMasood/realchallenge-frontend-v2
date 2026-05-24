import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { translate } from "../Translate";

const PIN_OPTIONS = [
  { key: "just_once", labelKey: "userDashboard.nutrient.pin_just_once", fallback: "Just once (Pinned for next week)" },
  { key: "always", labelKey: "userDashboard.nutrient.pin_always", fallback: "Always (Pinned weekly)" },
];

function getLabel(opt) {
  const translated = translate(opt.labelKey);
  return translated && translated !== opt.labelKey ? translated : opt.fallback;
}

export default function PinPopover({ anchorRect, currentMode, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!anchorRect) return null;

  const top = anchorRect.bottom + 8;
  const left = anchorRect.left + anchorRect.width / 2;

  return ReactDOM.createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
        minWidth: "240px",
        background: "#2a2d3e",
        border: "1px solid #3a3d4e",
        borderRadius: "8px",
        padding: "6px 0",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      {PIN_OPTIONS.map((opt) => {
        const active = currentMode === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => {
              onSelect(opt.key);
              onClose();
            }}
            style={{
              display: "block",
              width: "100%",
              background: active ? "#3a3d4e" : "transparent",
              border: "none",
              borderLeft: active ? "3px solid #f37720" : "3px solid transparent",
              padding: "10px 16px",
              textAlign: "left",
              cursor: "pointer",
              color: active ? "#f37720" : "#d1d5db",
              fontSize: "13px",
            }}
          >
            {getLabel(opt)}
          </button>
        );
      })}
      {currentMode && (
        <button
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          style={{
            display: "block",
            width: "100%",
            background: "transparent",
            border: "none",
            borderTop: "1px solid #3a3d4e",
            padding: "10px 16px",
            textAlign: "left",
            cursor: "pointer",
            color: "#ef4444",
            fontSize: "12px",
          }}
        >
          {translate("userDashboard.nutrient.pin_remove") || "Remove pin"}
        </button>
      )}
    </div>,
    document.body
  );
}
