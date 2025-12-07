import axios from "axios";
import { emptyUserConstants } from "../contexts/UserStore";
import setAuthToken from "../helpers/setAuthToken";
import jwtDecode from "jwt-decode";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export async function loginUser(username, password) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/login`,
      { username, password }
    );
    return { success: true, res: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, res: "unable to login" };
  }
}

export async function signupUserWithGoogle(values) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/register/google`,
      values
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, data: "unable to login" };
  }
}

export async function signupUserWithFacebook(values) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/register/facebook`,
      values
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, data: "unable to login" };
  }
}

export async function loginUserWithFacebook(values) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/login/facebook`,
      values
    );
    return { success: true, res: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, res: "unable to login" };
  }
}

export async function loginUserWithGoogle(values) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/login/google`,
      values
    );
    return { success: true, res: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, res: "unable to login" };
  }
}

export function resetPassword(email) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/users/reset-password`, { email })
    .then((res) =>
      openNotificationWithIcon(
        "success",
        "Please check your email for password reset link"
      )
    )
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to send email please make sure that you've entered correct email"
      );
    });
}

export function newPassword(password, token, history) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/users/new-password`, {
      password,
      token,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Password Updated Successfully");
      history.push("/login");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to reset password");
    });
}

export function registerUser(values) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/users/register`, values)
    .then((res) => {
      return { data: res.data, success: true };
    })
    .catch((err) => ({ data: err, success: false }));
}

export async function sendEmailVerification(email) {
  try {
    var res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/verify/resend`,
      {
        email,
      }
    );

    openNotificationWithIcon(
      "success",
      "An email has been sent to your account please check your inbox."
    );
    return { success: true, data: res.data };
  } catch (err) {
    openNotificationWithIcon("error", "Unable to send email");
    return { success: false };
  }
}

export async function verifyEmail(token) {
  try {
    var res = await axios.get(
      `${process.env.REACT_APP_SERVER}/api/users/verify/${token}`
    );
    openNotificationWithIcon("success", "Email verified!");
    return { success: true, data: res.data };
  } catch (err) {
    openNotificationWithIcon("error", "Unable to verify email");
    return { success: false, data: res.data };
  }
}

export async function checkEmailVerified(email) {
  try {
    var res = await axios.post(
      `${process.env.REACT_APP_SERVER}/api/users/verify/check/`,
      { email }
    );
    openNotificationWithIcon("success", "Email verified!");
    return { success: true, data: res.data };
  } catch (err) {
    openNotificationWithIcon("error", "Email is not verified please try again");
    // return { success: false, data: res.data };
  }
}

export function logoutUser(histoy, setUserInfo) {
  setUserInfo(emptyUserConstants);
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("package-type");
  localStorage.removeItem("isActive");
  localStorage.removeItem("mediaManager_lastPath");
  histoy && histoy.push("/");
}

export function checkUser(userInfo, setUserInfo, token, history) {
  if (token) {
    try {
      //set the token in header
      setAuthToken(token);
      //decode the token so that we can call our action
      const decode = jwtDecode(token);
      console.log("decode", decode);

      //to logout the user once the token expires we do this
      const currentTime = Date.now() / 1000;
      if (decode.exp < currentTime) {
        //logout user
        logoutUser(history, setUserInfo);
        //redirect to login screen
        window.location.href = "./login";
        return;
      }

      // NEW: Handle both old and new token formats
      let roles;
      if (decode.roles && Array.isArray(decode.roles)) {
        // New format: roles array
        roles = decode.roles;
      } else if (decode.role) {
        // Old format: single role (backward compatibility)
        roles = [decode.role];
        console.warn("Old token format detected - user should re-login");
      } else {
        // No role info - force logout
        console.error("Token missing role information");
        logoutUser(history, setUserInfo);
        window.location.href = "./login";
        return;
      }

      setUserInfo({
        ...userInfo,
        username: decode.username,
        email: decode.email,
        roles: roles,
        role: roles[0],
        id: decode.id,
        // IS USER EMAIL IS ACTIVE
        isActive: decode.isActive,
        authenticated: true,
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      logoutUser(history, setUserInfo);
      window.location.href = "./login";
    }
  }
}
