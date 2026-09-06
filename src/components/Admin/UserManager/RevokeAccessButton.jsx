import React, { useState } from "react";
import { Button, Modal, Table, Tooltip, Popconfirm } from "antd";
import { StopOutlined } from "@ant-design/icons";

import { adminRevokeChallenge } from "../../../services/customer";
import { getUserProfileInfo } from "../../../services/users";
import { openNotificationWithIcon } from "../../../services/createChallenge/main";

/**
 * Admin: take a challenge back from one customer, after refunding them.
 *
 * Refunds are deliberately manual — issued in the Mollie dashboard — and the
 * credit note is raised automatically by the webhook. What was missing was the
 * other half: nothing removed the customer's access, so a refunded customer
 * kept the product they had been refunded for.
 *
 * Lives on the user row rather than the challenge, because that is the shape of
 * the job: you have just refunded a *person* and need to undo what they bought.
 */
function RevokeAccessButton({ user }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await getUserProfileInfo(user._id);
    const details = res?.customer?.customerDetails;
    setChallenges((details?.challenges || []).filter(Boolean));
    setLoading(false);
  };

  const openDialog = () => {
    setOpen(true);
    load();
  };

  const revoke = async (challenge) => {
    setBusyId(challenge._id);
    const res = await adminRevokeChallenge(user._id, challenge._id);
    setBusyId(null);
    if (res.success) {
      openNotificationWithIcon(
        "success",
        "Access removed",
        res.slotFreed
          ? `${res.challengeName} removed. Their plan slot has been freed.`
          : `${res.challengeName} removed.`
      );
      load();
    } else {
      openNotificationWithIcon(
        "error",
        "Could not remove access",
        res.message || "Please try again."
      );
    }
  };

  const columns = [
    {
      title: "Challenge",
      key: "name",
      render: (_, r) => r.challengeName || String(r._id),
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_, r) => (
        <Popconfirm
          title={
            <span style={{ color: "white" }}>
              Remove this challenge from {user.username}?
            </span>
          }
          okText="Remove"
          cancelText="Cancel"
          onConfirm={() => revoke(r)}
        >
          <Button danger size="small" loading={busyId === r._id}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Tooltip title="Remove challenge access (after a refund)">
        <Button icon={<StopOutlined />} onClick={openDialog} />
      </Tooltip>

      <Modal
        open={open}
        title={
          <span className="font-paragraph-white" style={{ color: "#fff" }}>
            {`Challenges owned by ${user.username}`}
          </span>
        }
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>,
        ]}
        width={560}
      >
        {/* Modals here are themed dark, but antd's default body colour is a
            near black — anything written into one has to set its own colour. */}
        <p className="font-paragraph-white" style={{ marginBottom: "12px", color: "#fff" }}>
          Use this after refunding someone in Mollie. Refunding does not remove
          their access on its own. If the challenge came from a subscription
          plan, its slot is freed so they can pick another.
        </p>
        <Table
          size="small"
          loading={loading}
          pagination={false}
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={challenges}
          scroll={{ y: 300 }}
          locale={{ emptyText: "This customer owns no challenges" }}
        />
      </Modal>
    </>
  );
}

export default RevokeAccessButton;
