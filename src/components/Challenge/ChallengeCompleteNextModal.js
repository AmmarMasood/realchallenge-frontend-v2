import Carousel from "react-multi-carousel";
import slug from "elegant-slug";
import { Link } from "react-router-dom";
import ChallengeCard from "../Cards/ChallengeCard";
import { LeftOutlined } from "@ant-design/icons";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 800 },
    items: 2,
  },
  tablet1: {
    breakpoint: { max: 800, min: 750 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const ChallengeCompleteNextModal = ({
  goBack,
  loading,
  recommandedChallenges,
}) =>
  loading ? (
    <h1 style={{ textAlign: "center" }}>Loading...</h1>
  ) : (
    <div className="challenge-complete-next-modal-container">
      <LeftOutlined
        style={{
          color: "#f37720",
          fontSize: "30px",
          position: "absolute",
          top: "0",
          left: "0",
          margin: "10px",
        }}
        onClick={goBack}
      />

      <h1 className="font-heading-white">Your Next Level Challenge!</h1>
      <span className="font-paragraph-white">
        Need a push? Take on a challenge. These challenges are chosen for you
        based on your progress.
      </span>

      <div>
        {recommandedChallenges ? (
          <Carousel responsive={responsive}>
            {recommandedChallenges.map((challenge) => (
              <Link
                to={`/challenge/${slug(challenge.challengeName)}/${
                  challenge._id
                }`}
              >
                <ChallengeCard
                  picture={`${process.env.REACT_APP_SERVER}/uploads/${challenge.thumbnailLink}`}
                  rating={challenge.rating}
                  name={challenge.challengeName}
                  newc={true}
                  key={challenge._id}
                />
              </Link>
            ))}
          </Carousel>
        ) : (
          <div className="font-paragraph-white" style={{ marginLeft: "10px" }}>
            No challenges found
          </div>
        )}
      </div>
    </div>
  );

export default ChallengeCompleteNextModal;
