import React, { useState } from "react";
import { Input, Form, Button } from "antd";

import "../assets/login.css";
import "../assets/home.css";
import Logo from "../images/logo.png";
import { LoadingOutlined } from "@ant-design/icons";
import { resetPassword } from "../services/authentication";
import { T } from "../components/Translate";

function ForgotPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const res = await resetPassword(values.email);
    setLoading(false);
    console.log(res);
    console.log(values);
  };

  const onFinishFailed = (error) => {
    console.log(error);
  };
  return (
    <div>
      <div className="login-container">
        <div className="login-container-column1">
          <img className="login-logo" src={Logo} alt="logo" />
          <h1 className="font-heading-white">
            <T>forgot_password.reset</T>
          </h1>
          <Form
            // form={form}
            name="register"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
          >
            <div className="login-textfield-box">
              <Form.Item
                name="email"
                label={<span className="font-paragraph-white">E-mail</span>}
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </div>
            {loading ? (
              <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#ff7700",
                  border: "none",
                }}
              >
                <T>forgot_password.rp</T>
              </Button>
            )}
          </Form>
        </div>

        <div className="login-container-column2"></div>
      </div>
    </div>
  );
}

export default ForgotPassword;
