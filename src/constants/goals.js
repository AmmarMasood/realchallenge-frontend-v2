import { translate } from "../components/Translate";
import DumbellIcon from "../assets/icons/dumbell-icon.svg";
import HeartIcon from "../assets/icons/heart-icon.svg";
import WaistIcon from "../assets/icons/waist-icon.svg";

export const getDefaultGoals = () => [
  { _id: "get-fit", name: translate("goals.get_fit"), icon: HeartIcon },
  { _id: "lose-weight", name: translate("goals.lose_weight"), icon: WaistIcon },
  { _id: "gain-muscle", name: translate("goals.gain_muscle"), icon: DumbellIcon },
];
