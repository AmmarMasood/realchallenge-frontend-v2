import React from "react";
import { Switch } from "antd";
import "./GreenSwitch.css";

// Thin wrapper around antd Switch that applies the brand green palette
// (#53D470 on, dark slate off) and shows ON / OFF labels by default.
// Pass checkedChildren / unCheckedChildren to override the labels per
// instance. Accepts any antd Switch prop.
function GreenSwitch({
  className = "",
  checkedChildren = "ON",
  unCheckedChildren = "OFF",
  ...rest
}) {
  return (
    <Switch
      {...rest}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      className={`green-switch ${className}`.trim()}
    />
  );
}

export default GreenSwitch;
