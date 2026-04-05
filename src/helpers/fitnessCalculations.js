// Unit conversions
export const kgToLb = (kg) => kg * 2.20462;
export const lbToKg = (lb) => lb * 0.453592;
export const cmToFt = (cm) => cm / 30.48;
export const ftToCm = (ft) => ft * 30.48;

// BMI: weight(kg) / (height(cm)/100)^2
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  return weightKg / ((heightCm / 100) ** 2);
};

// BMR (Harris-Benedict)
// Male: 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
// Female: 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age
export const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (!weightKg || !heightCm || !age) return 0;
  if (gender === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  if (gender === "female") {
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }
  return 0;
};

// Body fat percentage
// Male: 1.2 * BMI + 0.23 * age - 16.2
// Female: 1.2 * BMI + 0.23 * age - 5.4
export const calculateBodyFat = (bmi, age, gender) => {
  if (!bmi || !age) return 0;
  if (gender === "male") return 1.2 * bmi + 0.23 * age - 16.2;
  if (gender === "female") return 1.2 * bmi + 0.23 * age - 5.4;
  return 0;
};

// PAL (Physical Activity Level) multiplier
export const getPAL = (fitnessLevel) => {
  switch (fitnessLevel) {
    case "inactive":
      return 1.2;
    case "light-active":
      return 1.45;
    case "average-active":
      return 1.65;
    case "active":
      return 1.85;
    case "very-active":
      return 2.2;
    default:
      return 0;
  }
};

// Calories per day = PAL * BMR
export const calculateCalories = (bmr, fitnessLevel) => {
  return getPAL(fitnessLevel) * bmr;
};

// Convert values to metric for calculations
export const toMetric = (weight, height, isMetric) => ({
  weightKg: isMetric ? weight : lbToKg(weight || 0),
  heightCm: isMetric ? height : ftToCm(height || 0),
});
