import { translate } from "../components/Translate";
import CardioOrang from "../assets/icons/cardiogram-orange.svg";
import MuscleOrange from "../assets/icons/muscle-orange.svg";
import BodyOrange from "../assets/icons/body-icon.svg";

// The canonical goal list. A customer picks exactly ONE of these; challenges are
// tagged with the same `_id` slugs, which is what lets the recommender join the
// two. The backend mirrors these slugs in utils/goals.js for validation —
// THE SLUGS MUST MATCH. Do not source goal options from the ChallengeGoals
// collection: those rows carry Mongo ObjectIds, so anything tagged from them
// silently stops matching customer goals.
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
