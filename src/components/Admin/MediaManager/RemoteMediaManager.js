import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { VFSBrowser } from "./MediaManager";

function RemoteMediaManager({ visible, setVisible, type, actions }) {
  const [a, setA] = useState(actions);
  const [t, setT] = useState(type);

  return (
    <Modal
      key={Math.random()}
      title="Media Manager"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      footer={false}
      width="80%"
    >
      <VFSBrowser
        actions={actions}
        mediaType={type}
        setRemoteMediaManagerVisible={setVisible}
      />
    </Modal>
  );
}

export default RemoteMediaManager;
