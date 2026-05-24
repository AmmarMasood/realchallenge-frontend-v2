import Carousel from "react-multi-carousel";
import slug from "elegant-slug";
import { Link } from "react-router-dom";
import ChallengeCard from "../Cards/ChallengeCard";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { T } from "../Translate";

// Mirrors the helpers used by pages/Challenges.js so the cards here look
// identical to the ones on the /challenges route (URL-encoded thumbnails,
// trailing-intensity tag stripped from names).
const getThumbnailLink = (thumbnail) => {
  if (!thumbnail) return "";
  if (typeof thumbnail === "string") return thumbnail.replace(/ /g, "%20");
  if (thumbnail.link) return thumbnail.link.replace(/ /g, "%20");
  return "";
};

const cleanIntensityName = (name, hasGroup) => {
  if (!hasGroup || !name) return name;
  return name
    .replace(/\s*[\(\[](Easy|Medium|Hard)[\)\]]\s*$/i, "")
    .replace(/\s+(Easy|Medium|Hard)\s*$/i, "");
};

const responsive = {
  superLargeDesktop: {
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

const ChallengeCompleteNextModal = ({ loading, challenges, onClose }) => {
  return (
    <div
      className="challenge-complete-next-modal-container"
      style={{
        width: "min(940px, calc(100vw - 32px))",
        height: "min(580px, calc(100vh - 80px))",
        position: "relative",
        border: "none",
        outline: "1px solid #4E5F70",
        outlineOffset: "-10px",
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 1) 25%, rgba(78, 95, 112, 1) 100%)",
        padding: "40px 30px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255, 44, 44, 0.2)",
            border: "none",
            color: "#FF6C6C",
            fontSize: 18,
            cursor: "pointer",
            padding: 6,
            lineHeight: 1,
            zIndex: 2,
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloseOutlined />
        </button>
      )}
      <h1
        className="font-heading-white"
        style={{
          fontSize: "32px",
          lineHeight: 1.2,
          margin: "0",
          textAlign: "center",
        }}
      >
        <T>challenges.next_level_heading</T>
      </h1>
      <p
        className="font-paragraph-white"
        style={{
          fontSize: "18px",
          fontWeight: 400,
          fontStyle: "italic",
          paddingTop: "10px",
          margin: 0,
          textAlign: "center",
          opacity: 0.9,
        }}
      >
        <T>challenges.next_level_sub</T>
      </p>

      <div style={{ marginTop: "20px", flex: 1, minHeight: 0 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <LoadingOutlined
              style={{ color: "#ff7700", fontSize: "30px" }}
            />
          </div>
        ) : Array.isArray(challenges) && challenges.length > 0 ? (
          <Carousel responsive={responsive}>
            {challenges.map((challenge) => {
              const hasIntensityGroup =
                !!challenge.intensityGroupId || !!challenge.intensityVariants;
              return (
                <Link
                  key={challenge._id}
                  to={`/challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                >
                  <ChallengeCard
                    picture={getThumbnailLink(challenge.thumbnailLink)}
                    rating={challenge.rating}
                    name={cleanIntensityName(
                      challenge.challengeName,
                      hasIntensityGroup
                    )}
                    newc={false}
                    hasIntensityGroup={hasIntensityGroup}
                    intensityLevels={challenge.intensityVariants?.length}
                    intensity={challenge.intensity}
                  />
                </Link>
              );
            })}
          </Carousel>
        ) : (
          <div
            className="font-paragraph-white"
            style={{ textAlign: "center", padding: "20px 0", opacity: 0.7 }}
          >
            <T>userDashboard.challenges.nochal</T>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCompleteNextModal;
