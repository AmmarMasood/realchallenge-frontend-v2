import { translate } from "../components/Translate";
import CardioOrang from "../assets/icons/cardiogram-orange.svg";
import MuscleOrange from "../assets/icons/muscle-orange.svg";
import BodyOrange from "../assets/icons/body-icon.svg";

export const getDefaultGoals = () => [
  { _id: "get-fit", name: translate("goals.get_fit"), icon: BodyOrange },
  {
    _id: "lose-weight",
    name: translate("goals.lose_weight"),
    icon: CardioOrang,
  },
  {
    _id: "gain-muscle",
    name: translate("goals.gain_muscle"),
    icon: MuscleOrange,
  },
];
