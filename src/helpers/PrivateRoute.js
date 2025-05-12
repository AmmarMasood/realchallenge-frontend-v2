import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, userInfo, role, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      // Check if the JWT token exists in localStorage
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        // Redirect to "/" if the token is not present
        return <Redirect to="/" />;
      }

      // Show loading spinner or placeholder while waiting for userInfo
      if (
        !userInfo ||
        Object.keys(userInfo).length === 0 ||
        userInfo.username === ""
      ) {
        return (
          <div
            style={{
              margin: "5px",
              fontSize: "20px",
            }}
          >
            Loading...
          </div>
        ); // Replace with your spinner or placeholder
      }

      // Render the component if the user is authenticated and has the correct role
      return userInfo.authenticated === true && role.includes(userInfo.role) ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      );
    }}
  />
);

export default PrivateRoute;
