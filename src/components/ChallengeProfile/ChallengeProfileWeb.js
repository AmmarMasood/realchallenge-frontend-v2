import "../../assets/challengeProfileFigma.css";
import Navbar from "../Navbar";
import ChallengeProfileSubtract from "../../assets/icons/challenge-profile-subtract.svg";
import ChalleengeProfileFether from "../../images/challenge-profile-cover-feather.svg";
import StarFilled from "../../assets/icons/star-orange.svg";
import StartTransparent from "../../assets/icons/star-transparent.svg";
import DownArrow from "../../assets/icons/down-orange-arrow.svg";

function ChallengeProfileWeb(props) {
  const {
    challengeName,
    reviews,
    thumbnailLink,
    challengeGoals,
    description,
    trainers,
    body,
    weeks,
    results,
    informationList,
  } = props;

  function getEquipmentsFromWorkouts(weeks) {
    const workouts =
      weeks &&
      weeks.map((w) => {
        return w.workouts;
      });
    const merged = [].concat.apply([], workouts);
    const relatedEquipments = merged.map((m) => m.relatedEquipments);
    return [].concat.apply([], relatedEquipments).map((body) => (
      <div
        style={{
          position: "relative",
          top: 0,
          backgroundColor: "#283443",
          padding: "10px",
          height: "33px",
          marginRight: "5px",
        }}
      >
        <div
          className="kettlebell valign-text-middle poppins-light-white-14px"
          style={{ textAlign: "center" }}
        >
          {body.name}
        </div>
      </div>
    ));
  }

  return (
    <div style={{ background: "#171e27" }}>
      <Navbar />
      {console.log("prolpsssssssssssssss", props)}
      <div
        class="container-center-horizontal"
        style={{ border: "3px solid red" }}
      >
        <div
          className="challenge-web-unauthorized-user screen"
          style={{ border: "3px solid green" }}
        >
          <div
            className="overlap-group17"
            style={{ border: "3px solid yellow" }}
          >
            <div className="overlap-group" style={{ border: "3px solid blue" }}>
              <img
                className="cover-photo"
                src={`${process.env.REACT_APP_SERVER}/uploads/${thumbnailLink}`}
              />
              <img className="cover-feather" src={ChalleengeProfileFether} />

              <img className="subtract" src={ChallengeProfileSubtract} />
              <div
                className="cover-content"
                style={{ border: "3px solid blue" }}
              >
                <h1 className="text-4 valign-text-middle">{challengeName}</h1>
                <div className="overlap-group11">
                  <div className="rectangle-1863"></div>
                </div>
                <div className="flex-row">
                  <img className="stars" src={StarFilled} />
                  <div className="address valign-text-middle poppins-medium-sandy-brown-14px">
                    {reviews && reviews.length} REVIEWS
                  </div>
                </div>
                <div className="flex-row-1">
                  <div className="overlap-group9">
                    <div className="overlap-group7-1">
                      <img className="polygon-11" src={"polygon11"} />
                      <img className="group-9892" src={"group9892"} />
                    </div>
                    <div className="gemiddeld valign-text-middle poppins-normal-white-16px">
                      gemiddeld
                    </div>
                  </div>
                  <div className="overlap-group10">
                    <div className="kort valign-text-middle poppins-normal-white-16px">
                      kort
                    </div>
                  </div>
                </div>
                <p className="text-5 poppins-normal-white-16px">
                  {description}
                </p>
              </div>
            </div>
            <div className="rectangle-1828"></div>
            <div className="rectangle-1868"></div>
            <div className="rectangle-1860"></div>
            <div className="rectangle-1866"></div>
            <div className="rectangle-1837"></div>

            <div className="subscription" style={{ border: "3px solid red" }}>
              <div className="flex-row-2">
                <div className="subscription-1 poppins-light-sonic-silver-14px">
                  SUBSCRIPTION
                </div>
                <img className="help-icon" src={"helpIcon"} />
                <img className="vector-2" src={"vector2"} />
              </div>
              <div
                className="flex-row-3"
                style={{ border: "3px solid yellow" }}
              >
                <div className="flex-col">
                  <p className="text-1">Get access to all features</p>
                  <div className="overlap-group14">
                    <div className="one-time-challenge poppins-medium-white-20px">
                      One-Time Challenge
                    </div>
                    <div className="price poppins-medium-white-28px">€35</div>
                    <div className="no-subscription poppins-light-white-14px">
                      No subscription
                    </div>
                    <div className="billed-once poppins-light-star-dust-10px">
                      Billed once
                    </div>
                  </div>
                </div>
                <div className="overlap-group13 border-2px-tango">
                  <div className="repeat-save poppins-medium-white-20px">
                    Repeat & Save
                  </div>
                  <div className="overlap-group8-1">
                    <div className="save-up-to poppins-medium-white-10px">
                      <span className="poppins-medium-white-10px">
                        Save up to
                      </span>
                      <span className="span1 poppins-medium-white-16px">
                        60%
                      </span>
                    </div>
                  </div>
                  <div className="flex-row-4">
                    <div className="price-1 poppins-medium-white-29px">
                      €4.5
                    </div>
                    <div className="week poppins-light-white-10px">/Week</div>
                  </div>
                  <div className="address-1 poppins-light-white-14px">
                    12 months plan
                  </div>
                  <div className="billed-monthly poppins-light-star-dust-10px">
                    Billed monthly
                  </div>
                </div>
                <div className="overlap-group16">
                  <div className="repeat-save-1 poppins-medium-white-21px">
                    Repeat & Save
                  </div>
                  <div className="overlap-group7-2">
                    <div className="save-up-to poppins-medium-white-10px">
                      <span className="poppins-medium-white-10px">
                        Save up to
                      </span>
                      <span className="span1 poppins-medium-white-16px">
                        30%
                      </span>
                    </div>
                  </div>
                  <div className="flex-row-5">
                    <div className="price-2 poppins-medium-white-29px">€6</div>
                    <div className="week-1 poppins-light-white-10px">/Week</div>
                  </div>
                  <div className="address-2 poppins-light-white-14px">
                    3 months plan
                  </div>
                  <div className="billed-monthly-1 poppins-light-star-dust-10px-2">
                    Billed monthly
                  </div>
                </div>
              </div>
              <div className="flex-col-1">
                <div
                  className="overlap-group15"
                  style={{ backgroundImage: `url(${"overlapGroup15"})` }}
                >
                  <div className="start-now-1 poppins-medium-white-16px">
                    START NOW
                  </div>
                </div>
                <div className="rectangle-1869"></div>
              </div>
            </div>
            {trainers &&
              trainers.map((t) => (
                <div className="overlap-group6" key={t._id}>
                  <img
                    className="rectangle-1859"
                    src={`${process.env.REACT_APP_SERVER}/uploads/${t.avatarLink}`}
                  />
                  <div className="name poppins-normal-crusta-17px">
                    {t.username}
                  </div>
                </div>
              ))}

            <div className="poppins-light-sonic-silver-14px">TRAINERS</div>
            <div className="goals poppins-light-sonic-silver-14px">GOALS</div>
            <div className="body-focus poppins-light-sonic-silver-14px">
              BODY FOCUS
            </div>
            <div className="equipment poppins-light-sonic-silver-14px">
              EQUIPMENT
            </div>
            <div className="results poppins-light-sonic-silver-14px">
              RESULTS
            </div>
            <div className="info poppins-light-sonic-silver-14px">INFO</div>
            <div
              className="overlap-group3"
              style={{
                display: "flex",
                backgroundColor: "transparent",
                padding: "0",
                border: "3px solid red",
              }}
            >
              {challengeGoals &&
                challengeGoals.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      position: "relative",
                      top: 0,
                      backgroundColor: "#283443",
                      padding: "10px",
                      height: "33px",
                      marginRight: "5px",
                    }}
                  >
                    <div className="conditie valign-text-middle poppins-light-white-14px">
                      {c.name}
                    </div>
                  </div>
                ))}
            </div>

            <div
              className="overlap-group1"
              style={{
                display: "flex",
                backgroundColor: "transparent",
                padding: "0",
                border: "3px solid red",
              }}
            >
              {body &&
                body.map((b) => (
                  <div
                    key={b._id}
                    style={{
                      position: "relative",
                      top: 0,
                      backgroundColor: "#283443",
                      padding: "10px",
                      height: "33px",
                      marginRight: "5px",
                    }}
                  >
                    <div
                      className="heel-lichaam valign-text-middle poppins-light-white-14px"
                      style={{ textAlign: "center" }}
                    >
                      {b.name}
                    </div>
                  </div>
                ))}
            </div>

            <div
              className="overlap-group5"
              style={{
                display: "flex",
                backgroundColor: "transparent",
                padding: "0",
                border: "3px solid red",
              }}
            >
              {weeks && getEquipmentsFromWorkouts(weeks)}
            </div>
            <p
              className="text-6 poppins-light-white-14px"
              style={{ border: "3px solid blue" }}
            >
              {results}
            </p>
            <p
              className="address-3 poppins-light-white-14px"
              style={{ border: "3px solid red" }}
            >
              {informationList &&
                informationList.map((m) => (
                  <>
                    <div
                      style={{
                        display: "flex",
                        marginLeft: "-20px",
                        alignItems: "center",
                      }}
                      key={m._id}
                    >
                      <img
                        style={{ height: "16px" }}
                        src={`${process.env.REACT_APP_SERVER}/uploads/${m.icon}`}
                        alt=""
                      />
                      <span
                        className="font-paragraph-white"
                        style={{ marginLeft: "5px" }}
                      >
                        {m.info}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        marginLeft: "-20px",
                        alignItems: "center",
                      }}
                      key={m._id}
                    >
                      <img
                        style={{ height: "16px" }}
                        src={`${process.env.REACT_APP_SERVER}/uploads/${m.icon}`}
                        alt=""
                      />
                      <span
                        className="font-paragraph-white"
                        style={{ marginLeft: "5px" }}
                      >
                        {m.info}
                      </span>
                    </div>
                  </>
                ))}
              <div className="rectangle-1870"></div>
            </p>

            <div
              className="your-personal-journey"
              style={{ border: "3px solid green" }}
            >
              <div className="text-7 poppins-light-sonic-silver-14px">
                {t("challenge_profile.yourPersonalJourney")}
              </div>
              <div className="week-1-1">
                <div className="overlap-group7-3">
                  <div className="flex-col-2">
                    <div
                      className="overlap-group8-2"
                      style={{ backgroundImage: `url(${"overlapGroup8"})` }}
                    >
                      <div className="week-1-2 poppins-normal-white-14px">
                        WEEK 1
                      </div>
                    </div>
                    <div className="foundation-6-days poppins-light-white-16px">
                      FOUNDATION (6 DAYS)
                    </div>
                  </div>
                  <img className="vector-1-1" src={"vector12"} />
                </div>
              </div>
              <div className="week-2">
                <div className="overlap-group9-1">
                  <div className="flex-row-6">
                    <div className="flex-col-3">
                      <div
                        className="overlap-group7-4"
                        style={{ backgroundImage: `url(${"overlapGroup7"})` }}
                      >
                        <div className="week-2-1 poppins-normal-white-14px">
                          WEEK 2
                        </div>
                      </div>
                      <div className="text-8 poppins-light-white-16px">
                        INTEGRATION (5 DAYS)
                      </div>
                    </div>
                    <img className="vector-2-1" src={DownArrow} />
                  </div>
                  <p className="text-9 valign-text-middle poppins-light-silver-15px">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
              </div>
              <div className="rectangle-1868-1"></div>
            </div>
            <img className="info-icon-1" src={"infoIcon1"} />
            <img className="info-icon-2" src={"infoIcon2"} />
          </div>
          <div className="comments-group" style={{ border: "3px solid green" }}>
            <div className="comments poppins-light-granite-gray-14px">
              COMMENTS
            </div>
            <div className="flex-row-7">
              <div className="flex-col-4">
                <img className="rectangle-1869-1" src={"rectangle1869"} />
                <img className="rectangle-1870-1" src={"rectangle1870"} />
              </div>
              <div className="flex-col-5">
                <p className="name-1 poppins-light-white-16px">
                  "Kim Me too, I love it!
                </p>
                <div className="apr-08-2021 poppins-light-gunsmoke-11px">
                  Apr, 08, 2021
                </div>
                <p className="filip-wow-i-like-it poppins-light-white-16px">
                  Filip Wow I like it
                </p>
                <div className="apr-03-2021 poppins-light-gunsmoke-11px">
                  Apr, 03, 2021
                </div>
              </div>
            </div>
            <div className="flex-col-6">
              <div className="rectangle-1838"></div>
              <div className="overlap-group12">
                <div className="post-comment poppins-normal-tango-16px">
                  {t("common.postComment")}
                </div>
                <div className="rectangle-1839 border-1px-tango"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeProfileWeb;
