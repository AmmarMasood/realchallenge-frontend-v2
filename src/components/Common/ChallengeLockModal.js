import React, { useContext } from "react";
import { Modal } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

function ChallengeLockModal({ visible, lockDetails }) {
  const { strings } = useContext(LanguageContext);

  const title = get(
    strings,
    "adminv2.challenge_locked_title",
    "Challenge Locked",
  );

  const messageText = get(
    strings,
    "adminv2.challenge_locked_message",
    "This challenge is currently being edited by {name}. Please try again later.",
  ).replace("{name}", lockDetails?.lockedBy || "someone");

  return (
    <Modal
      visible={visible}
      title={
        <span>
          <LockOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
          {title}
        </span>
      }
      footer={null}
      closable={false}
      maskClosable={false}
    >
      <p className="font-paragraph-white">{messageText}</p>
    </Modal>
  );
}

export default ChallengeLockModal;
