import React, { useState, useMemo, useRef, useEffect } from "react";
import { CaretDownOutlined, CloseCircleFilled } from "@ant-design/icons";
import "./CountryDropdown.css";

function CountryDropdown({
  value,
  onChange,
  countries = [],
  placeholder = "Select your country",
  width = 200,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  const names = useMemo(
    () => countries.map((c) => (typeof c === "string" ? c : c.name)),
    [countries]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return names;
    const q = search.trim().toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q));
  }, [names, search]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const handleSelect = (name) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div
      className="country-dropdown"
      style={{ width }}
      ref={wrapperRef}
    >
      <div
        className={`country-dropdown__trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`country-dropdown__value${
            value ? "" : " is-placeholder"
          }`}
        >
          {value || placeholder}
        </span>
        <div className="country-dropdown__icons">
          {value && (
            <CloseCircleFilled
              className="country-dropdown__clear"
              onClick={handleClear}
            />
          )}
          <CaretDownOutlined className="country-dropdown__arrow" />
        </div>
      </div>

      {open && (
        <div className="country-dropdown__menu">
          <input
            ref={searchRef}
            type="text"
            className="country-dropdown__search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="country-dropdown__list">
            {filtered.length === 0 ? (
              <div className="country-dropdown__empty">No matches</div>
            ) : (
              filtered.map((name) => (
                <div
                  key={name}
                  className={`country-dropdown__item${
                    name === value ? " is-selected" : ""
                  }`}
                  onClick={() => handleSelect(name)}
                >
                  {name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountryDropdown;
