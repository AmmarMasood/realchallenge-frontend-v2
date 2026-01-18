import React, { useEffect, useContext } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import ScrollToTop from "./helpers/ScrollToTop";
import Home from "./pages/Home";
import Trainers from "./pages/Trainers";
import Challenges from "./pages/Challenges";
import Nutrition from "./pages/Nutrition";
import Pricing from "./pages/Pricing";
import HowItWorks from "./pages/HowItWork";
import Magazine from "./pages/Magazine";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AllChallenges from "./pages/AllChallenges";
import TrainerProfile from "./pages/TrainerProfile";
import ChallengeProfile from "./pages/ChallengeProfile";
import RecipeProfile from "./pages/RecipeProfile";
import UserDashboard from "./pages/UserDashboard";
import MagazineArticle from "./pages/MagazineArticle";
import UserUpdate from "./pages/UserUpdate";
import UserSetting from "./pages/UserSetting";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardV2 from "./pages/v2/AdminDashboard";
import ChallengePlayer from "./pages/ChallengePlayer";
import NewWelcome from "./pages/NewWelcome";
import "./assets/override.css";

// player state
import PlayerState from "./contexts/PlayerState";
import HelpCenter from "./pages/HelpCenter";
import TermsAndCondition from "./pages/TermsAndCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";

import { userInfoContext, userPointsContext } from "./contexts/UserStore";
import { checkUser } from "./services/authentication";

import PrivateRoute from "./helpers/PrivateRoute";
import ResetNewPassword from "./pages/ResetNewPassword";
import CreatePayment from "./components/Payment/CreatePayment";
import EmailVerificationRedirect from "./pages/EmailVerificationRedirect";
import MollieRedirectPage from "./components/Payment/MollieRedirectPage";
import ChoosePlan from "./components/Payment/ChoosePlan";
import { getUserPoints } from "./services/users";
import ChallengeCreator from "./pages/v2/ChallengeCreator";
import Workout from "./components/Admin/V2/Workout/Workout";

function App() {
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [userPoints, setUserPoints] = useContext(userPointsContext);

  let history = useHistory();

  useEffect(() => {
    checkUserInfo();
  }, []);

  const checkUserInfo = async () => {
    checkUser(userInfo, setUserInfo, localStorage.getItem("jwtToken"), history);
    if (localStorage.getItem("jwtToken")) {
      await getUserPoints(userPoints, setUserPoints);
    }
  };
  return (
    <Router>
      <ScrollToTop>
        <Route component={Home} path="/" exact />
        <Route component={Trainers} path="/trainers" exact />
        <Route component={Challenges} path="/challenges" exact />
        <Route component={Nutrition} path="/nutrition" exact />
        <Route component={Pricing} path="/pricing" exact />
        <Route component={HowItWorks} path="/how-it-works" exact />
        <Route component={Magazine} path="/magazine" exact />
        <Route component={Login} path="/login" exact />
        <Route component={Signup} path="/new" exact />
        <Route component={ForgotPassword} path="/forgot-password" exact />
        <Route
          component={ResetNewPassword}
          path="/reset-password/:token"
          exact
        />
        <Route component={AllChallenges} path="/all-challenges" exact />
        <Route
          component={TrainerProfile}
          path="/trainer/:trainerName/:id"
          exact
        />
        <Route path="/challenge/:challengeName/:id" exact>
          {/* <ChallengeProfileFigma /> */}
          <ChallengeProfile />
        </Route>
        <Route component={RecipeProfile} path="/recipe/:recipeName/:id" exact />
        <Route
          component={MagazineArticle}
          path="/magazine/:magazineName/:id"
          exact
        />
        <Switch>
          {" "}
          {/*We use switch so when our PrivateRoute does redirect it wont to propblems* This will also solve the problem so that if our user loggst our of the component where they are authenticated such as dashboard they will quiclky get taken from there to login*/}
          <PrivateRoute
            exact
            role="customer"
            path="/user/dashboard"
            component={UserDashboard}
            userInfo={userInfo}
          />
        </Switch>
        {/* <Route component={UserDashboard}  path="/user/dashboard" exact /> */}
        <Switch>
          {" "}
          {/*We use switch so when our PrivateRoute does redirect it wont to propblems* This will also solve the problem so that if our user loggst our of the component where they are authenticated such as dashboard they will quiclky get taken from there to login*/}
          <PrivateRoute
            exact
            role="customer"
            path="/user/update"
            component={UserUpdate}
            userInfo={userInfo}
          />
        </Switch>
        {/* <Route component={UserUpdate} path="/user/update" exact /> */}
        <Switch>
          {" "}
          <PrivateRoute
            exact
            role="customer"
            path="/user/settings"
            component={UserSetting}
            userInfo={userInfo}
          />
        </Switch>
        {/* <Route component={UserSetting} path="/user/settings" exact /> */}
        <Switch>
          {" "}
          <PrivateRoute
            exact
            role="customer"
            path="/user/profile"
            component={UserProfile}
            userInfo={userInfo}
          />
        </Switch>
        {/* <Route component={UserProfile} path="/user/profile" exact /> */}
        <Switch>
          {" "}
          <PrivateRoute
            exact
            role="admin shopmanager trainer nutrist blogger"
            path="/admin/dashboard"
            component={AdminDashboard}
            userInfo={userInfo}
          />
        </Switch>
        <Switch>
          <PrivateRoute
            exact
            role="admin trainer nutrist blogger"
            path="/admin/v2/dashboard"
            component={AdminDashboardV2}
            userInfo={userInfo}
          />
        </Switch>
        <Switch>
          <PrivateRoute
            exact
            role="admin trainer"
            path="/admin/v2/challenge-studio"
            component={ChallengeCreator}
            userInfo={userInfo}
          />
        </Switch>
        <Switch>
          <PrivateRoute
            exact
            role="admin trainer"
            path="/admin/v2/challenge-studio/:challengeId"
            component={ChallengeCreator}
            userInfo={userInfo}
          />
        </Switch>
        {/* <Route component={AdminDashboard} path="/admin/dashboard" exact /> */}
        <Route component={HelpCenter} path="/help-center" exact />
        <Route component={TermsAndCondition} path="/terms-condition" exact />
        <Route component={PrivacyPolicy} path="/privacy-policy" exact />
        <Route component={CookiePolicy} path="/cookie-policy" exact />
        <Route component={NewWelcome} path="/new/welcome" exact />
        <Route component={CreatePayment} path="/create-payment" exact />
        <Route component={ChoosePlan} path="/choose-plan" exact />
        <Route
          component={MollieRedirectPage}
          path="/mollie/create-subscribtion/redirect"
          exact
        />
        <Route
          component={EmailVerificationRedirect}
          path="/email-verification/:token"
          exact
        />
        <Route
          path="/play-challenge/:challengeName/:challengeId/:workoutId"
          exact
        >
          <PlayerState>
            <ChallengePlayer />
          </PlayerState>
        </Route>
      </ScrollToTop>
    </Router>
  );
}

export default App;
