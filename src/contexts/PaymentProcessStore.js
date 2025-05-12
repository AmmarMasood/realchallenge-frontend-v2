import React, { useState } from "react";

export const selectedChallengeContext = React.createContext();

const PaymentProcessStore = ({ children }) => {
  // new stuff starts
  const [selectedChallenge, setSelectedChallenge] = useState({});
  return (
    <selectedChallengeContext.Provider
      value={[selectedChallenge, setSelectedChallenge]}
    >
      {children}
    </selectedChallengeContext.Provider>
  );
};

export default PaymentProcessStore;
