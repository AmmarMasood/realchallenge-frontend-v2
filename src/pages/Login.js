import React, { useState, useContext, useEffect } from "react";
import { Input, Form } from "antd";
import { Link, withRouter } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import "../assets/login.css";
import "../assets/home.css";
// import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import GoogleLogin from "react-google-login";
import Logo from "../images/logo.png";

import {
  loginUser,
  loginUserWithGoogle,
  loginUserWithFacebook,
} from "../services/authentication";
import { userInfoContext, userPointsContext } from "../contexts/UserStore";
import setAuthToken from "../helpers/setAuthToken";
import { getUserPoints } from "../services/users";
import { T } from "../components/Translate";

function Login(props) {
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [userPoints, setUserPoints] = useContext(userPointsContext);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errror, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("jwtToken")) {
      props.history.push("/user/dashboard");
    }
  }, []);

  const responseFacebook = async (response) => {
    // setLoading(true);
    const res = await loginUserWithFacebook({
      id: response.id,
      email: response.email,
    });
    if (!res.success) {
      console.log(res);
      setError("Unable to login.");
      // setLoading(false);
    } else {
      setError("");
      // setLoading(false);
      setUserInfo({
        ...userInfo,
        id: res.res.user_id,
        role: res.res.role,
        username: res.res.username,
        authenticated: true,
      });
      console.log(res);
      localStorage.setItem("jwtToken", res.res.token);
      setAuthToken(localStorage.getItem("jwtToken"));
      // localStorage.setItem("role", res.res.role);
      if (
        res.res.role === "admin" ||
        res.res.role === "trainer" ||
        res.res.role === "nutrist" ||
        res.res.role === "blogger" ||
        res.res.role === "shopmanager"
      ) {
        props.history.push("/admin/dashboard");
        return;
      }
      // "admin",
      //   "trainer",
      //   "nutrist",
      //   "blogger",
      //   "shopmanager",
      if (res.res.role === "customer") {
        props.history.push("/user/dashboard");
        return;
      }
    }
  };

  const responseGoogle = async (response) => {
    return;
    // setLoading(true);
    console.log("response google");
    const res = await loginUserWithGoogle({
      googleId: response.googleId,
      email: response.profileObj.email,
    });
    if (!res.success) {
      console.log(res);
      setError("Unable to login.");
      // setLoading(false);
    } else {
      setError("");
      // setLoading(false);
      setUserInfo({
        ...userInfo,
        id: res.res.user_id,
        role: res.res.role,
        username: res.res.username,
        authenticated: true,
      });
      console.log(res);
      localStorage.setItem("jwtToken", res.res.token);
      setAuthToken(localStorage.getItem("jwtToken"));
      // localStorage.setItem("role", res.res.role);
      if (res.res.role === "admin") {
        props.history.push("/admin/dashboard");
        return;
      }
      if (res.res.role === "customer") {
        props.history.push("/user/dashboard");
        return;
      }
    }
  };

  const onFinishFailed = () => {};
  const onFinish = async (values) => {
    setLoading(true);
    const res = await loginUser(values.username, values.password);
    if (!res.success) {
      console.log(res);
      setError(
        "Unable to login. Please make sure you've entered correct username and password."
      );
      setLoading(false);
    } else {
      setError("");
      setLoading(false);
      setUserInfo({
        ...userInfo,
        id: res.res.user_id,
        email: res.res.email,
        // isActive: ,
        role: res.res.role,
        username: res.res.username,
        authenticated: true,
      });
      console.log("res from login", res);
      localStorage.setItem("jwtToken", res.res.token);
      localStorage.setItem("isActive", res.res.isActive);
      setAuthToken(localStorage.getItem("jwtToken"));
      getUserPoints(userPoints, setUserPoints);
      // localStorage.setItem("role", res.res.role);
      if (
        res.res.role === "admin" ||
        res.res.role === "trainer" ||
        res.res.role === "nutrist" ||
        res.res.role === "blogger" ||
        res.res.role === "shopmanager"
      ) {
        props.history.push("/admin/dashboard");
        return;
      }
      if (res.res.role === "customer") {
        props.history.push("/user/dashboard");
        return;
      }
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-container-column1">
          <Link to={"/"}>
            <img className="login-logo" src={Logo} alt="logo" />
          </Link>
          <h1 className="font-heading-white">
            <T>login.login</T>
          </h1>
          <Form
            layout="vertical"
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <div className="login-textfield-box">
              <Form.Item
                label={
                  <span className="font-paragraph-white">
                    <T>login.username</T>
                  </span>
                }
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input />
              </Form.Item>
            </div>
            <div className="login-textfield-box">
              <Form.Item
                label={
                  <span className="font-paragraph-white">
                    <T>login.password</T>
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Link to="/forgot-password" className="login-forgot-password">
                <T>login.forgot_pass</T>
              </Link>
              <Link to="/new" className="login-forgot-password">
                <T>login.new_user</T>
              </Link>
            </div>

            <div style={{ textAlign: "center", margin: "10px 0" }}>
              {loading ? (
                <LoadingOutlined
                  style={{ color: "#ff7700", fontSize: "30px" }}
                />
              ) : (
                <button
                  className="common-orange-button signup-btn"
                  htmlType="submit"
                >
                  <span className="font-paragraph-white">
                    <T>login.login</T>
                  </span>
                </button>
              )}
            </div>
            <p
              className="font-paragraph-white"
              style={{ color: "#ff4d4f", margin: "5px" }}
            >
              {errror}
            </p>
          </Form>

          {/* todo do later */}
          {/* <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
            fields="name,email,picture"
            callback={responseFacebook}
            render={(renderProps) => (
              <button
                class="loginBtn loginBtn--facebook"
                onClick={renderProps.onClick}
              >
                Login With Facebook
              </button>
            )}
          /> */}
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_APP_ID}
            render={(renderProps) => (
              <button
                class="loginBtn loginBtn--google"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                Login with Google
              </button>
            )}
            buttonText="Login"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
          />
        </div>
        <div className="login-container-column2"></div>
      </div>
    </div>
  );
}

export default withRouter(Login);
