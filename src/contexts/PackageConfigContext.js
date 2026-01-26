import React, { createContext, useState, useEffect, useContext } from "react";
import { getAllPackages } from "../services/packageConfig";

// Default package configs (fallback if API fails)
const DEFAULT_PACKAGES = {
  CHALLENGE_1: {
    packageId: "CHALLENGE_1",
    displayName: "One-Time Challenge",
    description: "Pay once for a single challenge",
    price: 0,
    currency: "EUR",
    billingInterval: 1,
    challengesAllowed: 1,
    savingsPercent: "",
    priceDisplayText: "",
    isActive: true,
    sortOrder: 1,
  },
  CHALLENGE_3: {
    packageId: "CHALLENGE_3",
    displayName: "3 Months Plan",
    description: "3 month subscription with access to 2 paid challenges",
    price: 26.0,
    currency: "EUR",
    billingInterval: 3,
    challengesAllowed: 2,
    savingsPercent: "20%",
    priceDisplayText: "€6 /Week",
    isActive: true,
    sortOrder: 3,
  },
  CHALLENGE_12: {
    packageId: "CHALLENGE_12",
    displayName: "12 Months Plan",
    description: "12 month subscription with access to 3 paid challenges",
    price: 19.99,
    currency: "EUR",
    billingInterval: 12,
    challengesAllowed: 3,
    savingsPercent: "40%",
    priceDisplayText: "€4.5 /Week",
    isActive: true,
    sortOrder: 2,
  },
};

export const PackageConfigContext = createContext({
  packages: DEFAULT_PACKAGES,
  packagesArray: Object.values(DEFAULT_PACKAGES),
  loading: true,
  error: null,
  refetch: () => {},
  getPackage: () => null,
  getChallengesAllowed: () => 1,
});

export const PackageConfigProvider = ({ children }) => {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [packagesArray, setPackagesArray] = useState(
    Object.values(DEFAULT_PACKAGES)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPackages();
      if (data.packages && data.packages.length > 0) {
        // Convert array to map by packageId
        const packagesMap = {};
        data.packages.forEach((pkg) => {
          packagesMap[pkg.packageId] = pkg;
        });
        setPackages(packagesMap);
        setPackagesArray(data.packages);
      }
    } catch (err) {
      console.error("Failed to fetch package configs:", err);
      setError(err);
      // Keep using defaults on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Get a specific package by ID
  const getPackage = (packageId) => {
    return packages[packageId] || DEFAULT_PACKAGES[packageId] || null;
  };

  // Get the number of challenges allowed for a membership name
  const getChallengesAllowed = (membershipName) => {
    const pkg = packages[membershipName] || DEFAULT_PACKAGES[membershipName];
    return pkg ? pkg.challengesAllowed : 1;
  };

  return (
    <PackageConfigContext.Provider
      value={{
        packages,
        packagesArray,
        loading,
        error,
        refetch: fetchPackages,
        getPackage,
        getChallengesAllowed,
      }}
    >
      {children}
    </PackageConfigContext.Provider>
  );
};

// Custom hook for easier usage
export const usePackageConfig = () => {
  const context = useContext(PackageConfigContext);
  if (!context) {
    throw new Error(
      "usePackageConfig must be used within a PackageConfigProvider"
    );
  }
  return context;
};
