import { Modal } from "antd";
import React from "react";
import { VFSBrowser } from "../../MediaManager/MediaManager";

function MediaManager({ open, setOpen }) {
  return (
    <Modal
      title="Media Manager"
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      footer={null}
      width={"100%"}
    >
      <VFSBrowser />
    </Modal>
  );
}

export default MediaManager;
