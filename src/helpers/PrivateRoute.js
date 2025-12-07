import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, userInfo, role, roles, ...rest }) => (
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

      // NEW: Support both 'role' and 'roles' props for gradual migration
      let requiredRoles = [];

      if (roles) {
        // New prop: roles (array or string)
        requiredRoles = Array.isArray(roles) ? roles : [roles];
      } else if (role) {
        // Old prop: role (for backward compatibility)
        // role prop is space-separated string like "admin trainer blogger"
        requiredRoles = role.split(" ");
      }

      // NEW: Check if user has ANY of the required roles (OR logic)
      const hasRequiredRole = userInfo.roles && userInfo.roles.some(userRole =>
        requiredRoles.includes(userRole)
      );

      // Render the component if the user is authenticated and has the correct role
      return userInfo.authenticated === true && hasRequiredRole ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      );
    }}
  />
);

export default PrivateRoute;
