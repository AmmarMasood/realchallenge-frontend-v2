import React, { useState } from "react";

export const userInfoContext = React.createContext();
export const userPointsContext = React.createContext()
export const emptyUserConstants = {
  id: "",
  username: "",
  role: "",
  email: "",
  avatar: "",
  notifications: [],
  authenticated: false,
};

const UserStore = ({ children }) => {
  // new stuff starts
  const [userInfo, setUserInfo] = useState(emptyUserConstants);
  const [userPoints, setUserPoints] = useState(0);
  return (
    <userInfoContext.Provider value={[userInfo, setUserInfo]}>
       <userPointsContext.Provider value={[userPoints, setUserPoints]}>
      {children}
      </userPointsContext.Provider>
    </userInfoContext.Provider>
  );
};

export default UserStore;
