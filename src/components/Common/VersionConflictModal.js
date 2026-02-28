import React, { useContext } from "react";
import { Modal, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

function VersionConflictModal({ visible, onReload, conflictDetails }) {
  const { strings } = useContext(LanguageContext);

  const title = get(
    strings,
    "adminv2.version_conflict_title",
    "Edit Conflict",
  );
  const messageText = get(
    strings,
    "adminv2.version_conflict_message",
    "This challenge was last modified by {name}, on {date}. Please refresh the page to get latest version before continuing editing.",
  )
    .replace("{name}", conflictDetails?.updatedBy || "someone")
    .replace(
      "{date}",
      conflictDetails?.updatedAt
        ? new Date(conflictDetails.updatedAt).toLocaleString()
        : "unknown",
    );
  const reloadText = get(strings, "adminv2.reload", "Reload");

  return (
    <Modal
      visible={visible}
      title={
        <span>
          <WarningOutlined style={{ color: "#faad14", marginRight: 8 }} />
          {title}
        </span>
      }
      footer={[
        <Button key="reload" type="primary" onClick={onReload}>
          {reloadText}
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <p className="font-paragraph-white">{messageText}</p>
    </Modal>
  );
}

export default VersionConflictModal;
