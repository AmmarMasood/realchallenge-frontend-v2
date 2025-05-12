import React, { useState } from "react";
import { Input, Form, Button } from "antd";

import "../assets/login.css";
import "../assets/home.css";
import Logo from "../images/logo.png";
import { useParams, useHistory } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { newPassword } from "../services/authentication";
import { T } from "../components/Translate";

function ResetNewPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  let history = useHistory();

  const onFinish = async (values) => {
    setLoading(true);
    console.log(token);
    console.log(values);
    const res = await newPassword(values.password, token, history);
    setLoading(false);
    // console.log(res);
    // console.log(values);
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
                name="password"
                label={
                  <span className="font-paragraph-white">
                    <T>forgot_password.new</T>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
            </div>
            <div className="login-textfield-box">
              <Form.Item
                name="confirm"
                label={
                  <span className="font-paragraph-white">
                    <T>forgot_password.confirmNew</T>
                  </span>
                }
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
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
                <T>forgot_password.confirmPassReset</T>
              </Button>
            )}
          </Form>
        </div>

        <div className="login-container-column2"></div>
      </div>
    </div>
  );
}

export default ResetNewPassword;
