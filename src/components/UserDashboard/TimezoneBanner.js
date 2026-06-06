import React, { useEffect, useState } from "react";
import { Modal, Button, message } from "antd";
import { getMyTimeZone, saveMyTimeZone } from "../../services/users";
import { T, translate } from "../Translate";

// Full IANA zone list when the browser supports it; otherwise a sensible
// curated fallback so the picker is always usable.
function getTimeZoneList() {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone");
    }
  } catch (_) {
    /* fall through to curated list */
  }
  return [
    "Europe/Amsterdam",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Europe/Madrid",
    "Europe/Istanbul",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
    "UTC",
  ];
}

// Shown on the user dashboard only when the user has NO timezone stored
// (i.e. browser auto-detection failed). Saving is set-once on the backend —
// after the user picks a zone the banner never returns.
function TimezoneBanner() {
  const [needsTimezone, setNeedsTimezone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const zones = getTimeZoneList();

  const q = query.trim().toLowerCase();
  const filteredZones = q
    ? zones.filter((z) => z.toLowerCase().includes(q))
    : zones;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getMyTimeZone();
      if (!cancelled && !(res && res.timeZone)) {
        setNeedsTimezone(true);
        // Pre-suggest whatever the browser reports, if anything.
        try {
          const guess = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (guess && zones.includes(guess)) setSelected(guess);
        } catch (_) {
          /* no guess available */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!selected) {
      message.warning(translate("user_dashboard.timezone.select_first"));
      return;
    }
    setSaving(true);
    try {
      await saveMyTimeZone(selected);
      message.success(translate("user_dashboard.timezone.saved"));
      setModalOpen(false);
      setNeedsTimezone(false);
    } catch (_) {
      message.error(translate("user_dashboard.timezone.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  if (!needsTimezone) return null;

  return (
    <>
      <div
        className="font-paragraph-white"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          background: "rgba(243,119,32,0.12)",
          border: "1px solid var(--color-orange)",
          borderRadius: "6px",
          padding: "12px 16px",
          margin: "12px 0",
        }}
      >
        <span style={{ flex: 1, minWidth: "220px" }}>
          <T>user_dashboard.timezone.banner_text</T>
        </span>
        <button
          type="button"
          className="common-orange-button font-paragraph-white"
          style={{ margin: 0, width: "auto", padding: "8px 18px" }}
          onClick={() => setModalOpen(true)}
        >
          <T>user_dashboard.timezone.set_button</T>
        </button>
      </div>

      <Modal
        title={
          <div className="font-card-heading">
            <T>user_dashboard.timezone.modal_title</T>
          </div>
        }
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={false}
        width="30%"
      >
        <p className="font-paragraph-white" style={{ marginBottom: "10px" }}>
          <T>user_dashboard.timezone.modal_help</T>
        </p>
        {/* Custom searchable dropdown (no antd Select) */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translate("user_dashboard.timezone.placeholder")}
          className="font-paragraph-white"
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#1D2631",
            border: "1px solid #2F3E50",
            borderRadius: "4px",
            color: "#fff",
            outline: "none",
          }}
        />
        <div
          style={{
            maxHeight: "240px",
            overflowY: "auto",
            marginTop: "8px",
            border: "1px solid #2F3E50",
            borderRadius: "4px",
          }}
        >
          {filteredZones.length === 0 ? (
            <div
              className="font-paragraph-white"
              style={{ padding: "10px 12px", opacity: 0.6 }}
            >
              <T>user_dashboard.timezone.no_matches</T>
            </div>
          ) : (
            filteredZones.map((z) => (
              <div
                key={z}
                onClick={() => setSelected(z)}
                className="font-paragraph-white"
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  background:
                    selected === z ? "rgba(243,119,32,0.18)" : "transparent",
                  borderLeft:
                    selected === z
                      ? "3px solid var(--color-orange)"
                      : "3px solid transparent",
                }}
              >
                {z.replace(/_/g, " ")}
              </div>
            ))
          )}
        </div>
        {selected && (
          <div
            className="font-paragraph-white"
            style={{ marginTop: "10px", fontSize: "1.4rem" }}
          >
            <T>user_dashboard.timezone.selected_label</T>:{" "}
            <span style={{ color: "var(--color-orange)" }}>
              {selected.replace(/_/g, " ")}
            </span>
          </div>
        )}
        <Button
          type="primary"
          loading={saving}
          onClick={handleSave}
          style={{
            marginTop: "16px",
            backgroundColor: "var(--color-orange)",
            borderColor: "var(--color-orange)",
          }}
        >
          <T>user_dashboard.timezone.save</T>
        </Button>
      </Modal>
    </>
  );
}

export default TimezoneBanner;
