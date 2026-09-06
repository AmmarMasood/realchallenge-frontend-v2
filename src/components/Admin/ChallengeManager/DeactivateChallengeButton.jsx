import React, { useState } from "react";
import { Button, Modal, Input, Table, Tag } from "antd";

import {
  getChallengeOwners,
  forceDeactivateChallenge,
  reactivateChallenge,
  openNotificationWithIcon,
} from "../../../services/createChallenge/main";
import { T } from "../../Translate";

/**
 * Force-deactivate / reactivate, from the challenge list.
 *
 * This is the destructive one, and it is easily confused with un-publishing:
 *
 *   isPublic: false    hides it from the store; existing owners keep access
 *   forceDeactivated   takes it away from everyone, including people who paid
 *
 * So the confirmation loads the owner list *first* and shows the admin exactly
 * how many paying customers they are about to cut off, before they can confirm.
 * Deciding that from a challenge name alone is how someone removes a programme
 * with 400 owners believing it had none.
 *
 * Reactivating restores owners but deliberately does not put it back on sale —
 * republishing is a separate, deliberate act.
 */
function DeactivateChallengeButton({ challenge, onChanged }) {
  const [open, setOpen] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [owners, setOwners] = useState([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [affected, setAffected] = useState(null);

  const isDeactivated = Boolean(challenge.forceDeactivated);

  const openConfirm = async () => {
    setOpen(true);
    setAffected(null);
    setLoadingOwners(true);
    const res = await getChallengeOwners(challenge._id);
    setOwners(res.owners || []);
    setLoadingOwners(false);
  };

  const doDeactivate = async () => {
    setBusy(true);
    const res = await forceDeactivateChallenge(challenge._id, reason.trim());
    setBusy(false);
    if (!res.success) {
      openNotificationWithIcon(
        "error",
        "Could not deactivate",
        res.message || "Please try again."
      );
      return;
    }
    // Keep the list on screen: these are the people owed a discount code, and
    // this dialog is the only place it is shown.
    //
    // The parent refresh is deliberately NOT called here. Reloading the table
    // remounts this component, which wiped the list the moment it appeared —
    // the admin saw it flash and vanish. The refresh happens on close instead.
    setAffected({
      count: res.affectedCount,
      users: res.affectedUsers || [],
      name: res.challengeName,
    });
  };

  /** Closes the dialog, refreshing the table only once the admin is done. */
  const closeAndRefresh = () => {
    const changed = Boolean(affected);
    setOpen(false);
    setReason("");
    setAffected(null);
    if (changed && onChanged) onChanged();
  };

  const doReactivate = () => {
    Modal.confirm({
      title: "Reactivate this challenge?",
      content:
        "Owners get their access back. It stays hidden from the store — publish it separately if you want it on sale again.",
      okText: "Reactivate",
      onOk: async () => {
        const res = await reactivateChallenge(challenge._id);
        if (res.success) {
          openNotificationWithIcon(
            "success",
            "Reactivated",
            "Owners have access again. It is still unpublished."
          );
          if (onChanged) onChanged();
        } else {
          openNotificationWithIcon(
            "error",
            "Could not reactivate",
            res.message || "Please try again."
          );
        }
      },
    });
  };

  if (isDeactivated) {
    return (
      <Button onClick={doReactivate} style={{ background: "#52c41a", color: "#fff", border: "none" }}>
        Reactivate
      </Button>
    );
  }

  const ownerColumns = [
    { title: "Name", key: "name", render: (_, r) =>
        `${r.firstName || ""} ${r.lastName || ""}`.trim() || r.username },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  return (
    <>
      <Button danger onClick={openConfirm}>
        Deactivate
      </Button>

      <Modal
        open={open}
        title={
          affected
            ? `"${affected.name}" has been deactivated`
            : `Deactivate "${challenge.challengeName}"?`
        }
        onCancel={closeAndRefresh}
        footer={
          affected
            ? [
                <Button key="done" type="primary" onClick={closeAndRefresh}>
                  Done
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setOpen(false)}>
                  Cancel
                </Button>,
                <Button
                  key="go"
                  danger
                  type="primary"
                  loading={busy}
                  disabled={loadingOwners}
                  onClick={doDeactivate}
                >
                  Deactivate for everyone
                </Button>,
              ]
        }
        width={640}
      >
        {affected ? (
          <div>
            <p>
              <strong>{affected.count}</strong> customer
              {affected.count === 1 ? "" : "s"} lost access. They are owed a
              discount code — issue it from the Coupons section.
            </p>
            {affected.users.length > 0 && (
              <Table
                size="small"
                pagination={false}
                rowKey={(r) => r._id}
                columns={ownerColumns}
                dataSource={affected.users}
                scroll={{ y: 240 }}
              />
            )}
          </div>
        ) : (
          <div>
            <p>
              This removes the challenge from <strong>everyone</strong>,
              including customers who paid for it. It is not the same as
              un-publishing, which only stops new sales and leaves existing
              owners alone.
            </p>

            {loadingOwners ? (
              <p>Checking who owns this…</p>
            ) : (
              <p>
                {owners.length === 0 ? (
                  <Tag color="green">Nobody owns this challenge yet</Tag>
                ) : (
                  <Tag color="red">
                    {owners.length} customer{owners.length === 1 ? "" : "s"} will
                    lose access
                  </Tag>
                )}
              </p>
            )}

            {owners.length > 0 && (
              <Table
                size="small"
                pagination={false}
                rowKey={(r) => r._id}
                columns={ownerColumns}
                dataSource={owners}
                scroll={{ y: 200 }}
                style={{ marginBottom: "12px" }}
              />
            )}

            <div style={{ marginTop: "12px" }}>
              <label>Reason (stored, shown to nobody):</label>
              <Input.TextArea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. trainer has left, content withdrawn"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default DeactivateChallengeButton;
