import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { VFSBrowser } from "./MediaManager";

function RemoteMediaManager({ visible, setVisible, type, actions }) {
  const [a, setA] = useState(actions);
  const [t, setT] = useState(type);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update dimensions on window resize for dynamic responsiveness
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate responsive dimensions based on screen size
  const getResponsiveDimensions = () => {
    const { width, height } = dimensions;

    // Mobile portrait (< 600px width)
    if (width < 600) {
      return {
        width: "100vw",
        height: `${height - 100}px`, // Full height minus small margin for header/footer
        maxHeight: "95vh",
      };
    }
    // Mobile landscape or small tablet (600-900px width)
    else if (width < 900) {
      return {
        width: "95vw",
        height: `${height - 120}px`,
        maxHeight: "90vh",
      };
    }
    // Tablet (900-1200px width)
    else if (width < 1200) {
      return {
        width: "90vw",
        height: `${height - 150}px`,
        maxHeight: "85vh",
      };
    }
    // Desktop (>= 1200px width)
    else {
      return {
        width: "90vw",
        height: `${height - 200}px`,
        maxHeight: "80vh",
      };
    }
  };

  const responsiveDimensions = getResponsiveDimensions();

  return (
    <Modal
      key={Math.random()}
      title="Media Manager"
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      footer={false}
      width={responsiveDimensions.width}
      centered
      className="media-manager-modal"
      wrapClassName="media-manager-modal-wrap"
      bodyStyle={{
        height: responsiveDimensions.height,
        maxHeight: responsiveDimensions.maxHeight,
        overflow: "hidden",
        padding: dimensions.width < 600 ? "8px" : "16px", // Less padding on mobile
      }}
      style={{
        top: dimensions.width < 600 ? 10 : undefined, // Minimize top margin on mobile
      }}
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
