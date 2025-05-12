import React, { useState, useEffect, useContext } from "react";
import "../assets/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Home/Hero";
import { Link, withRouter } from "react-router-dom";
import {
  ArrowRightOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined,
  CheckOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import VideoPhone from "../images/ipx-video-1024x515.png";
import MobileScreen from "../images/ipx-dash-515x1024.png";
// import ModalVideo from "react-modal-video";
// import "react-modal-video/scss/modal-video.scss";
import { userInfoContext } from "../contexts/UserStore";
import { LanguageContext } from "../contexts/LanguageContext";
import { T } from "../components/Translate";
import { getAllBlogs } from "../services/blogs";
import slug from "elegant-slug";
// import ReactHtmlParser from "react-html-parser";

function Home(props) {
  const { language } = useContext(LanguageContext);
  const [isOpen, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [allBlogs, setAllBlogs] = useState([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (userInfo.authenticated) {
      if (userInfo.role === "customer") {
        props.history.push("/user/dashboard");
      }
      if (userInfo.role === "admin") {
        props.history.push("/admin/dashboard");
      }
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [language]);

  const fetchBlogs = async () => {
    // const blogs = await getAllBlogs(language);
    // if (blogs.blogs) {
    //   setAllBlogs(blogs.blogs);
    // }
  };
  return (
    <div>
      <Navbar />
      <Hero />
      {/* video modal */}
      {/* todo do later */}
      {/* <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId={link}
        onClose={() => setOpen(false)}
      /> */}

      {/* pick your first goal starts */}
      <div className="home-row-2-outside">
        <div className="home-row-2">
          <div className="home-row-2-col-1">
            <h3 className="home-row-2-col-1-heading font-subheading-white">
              <T>home.home-row-2.pick_first</T>
            </h3>
            <h2 className="home-row-2-col-1-subheading font-heading-white">
              <T>home.home-row-2.personal_train</T>
            </h2>
            <p className="home-text font-paragraph-white">
              <T>home.home-row-2.real_challenge_offers</T>
            </p>
            <Link className="home-button font-paragraph-white" to="/challenges">
              <span className="home-button-text">
                <T>common.accept_the_challenge</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
          <div className="home-row-2-col-2">
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.freedigital_intake</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.success_monitor</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.for_starters</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.free_weekly</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.adapts_to_you</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-2.motivating</T>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* pick your first goa ends */}
      {/* pick your first goal starts */}
      <div className="home-row-3-outside">
        <div className="home-row-3">
          <div className="home-row-3-col-1">
            {/* box start */}
            <div className="home-row-3-col-1-box goal-1">
              <div className="home-row-3-col-1-box-textbox">
                <h3 className="home-row-3-col-1-box-textbox-heading font-subheading-white">
                  <T>home.home-row-3.become_fit</T>
                </h3>
                <div className="home-row-3-col-1-box-textbox-text font-paragraph-white">
                  <T>home.home-row-3.stay_active</T>
                </div>
              </div>
            </div>
            {/* box ends */}
            {/* box start */}
            <div className="home-row-3-col-1-box goal-2">
              <div className="home-row-3-col-1-box-textbox">
                <h3 className="home-row-3-col-1-box-textbox-heading font-subheading-white">
                  <T>home.home-row-3.lose_weight</T>
                </h3>
                <div className="home-row-3-col-1-box-textbox-text font-paragraph-white">
                  <T>home.home-row-3.discover_how</T>
                </div>
              </div>
            </div>
            {/* box ends */}
            {/* box start */}
            <div className="home-row-3-col-1-box goal-3">
              <div className="home-row-3-col-1-box-textbox">
                <h3 className="home-row-3-col-1-box-textbox-heading font-subheading-white">
                  <T>home.home-row-3.building_muscles</T>
                </h3>
                <div className="home-row-3-col-1-box-textbox-text font-paragraph-white">
                  <T>home.home-row-3.strong_body</T>
                </div>
              </div>
            </div>
            {/* box ends */}
            {/* box start */}
            <div className="home-row-3-col-1-box goal-4">
              <div className="home-row-3-col-1-box-textbox">
                <h3 className="home-row-3-col-1-box-textbox-heading font-subheading-white">
                  <T>home.home-row-3Tmaster_mindset</T>
                </h3>
                <div className="home-row-3-col-1-box-textbox-text font-paragraph-white">
                  <T>home.home-row-3.think_fit</T>
                </div>
              </div>
            </div>
            {/* box ends */}
          </div>
          <div className="home-row-3-col-2">
            <h3 className="home-row-2-col-1-heading font-subheading-white">
              <T>home.home-row-3.pick_your</T>
            </h3>
            <h2 className="home-row-2-col-1-subheading font-heading-white">
              <T>home.home-row-3.dTily_challenges</T>
              <br /> <T>home.home-row-3.monthly_goals</T>
            </h2>
            <p className="home-text font-paragraph-white">
              <T>home.home-row-3.real_challenge_analyse</T>
            </p>
            <div>
              <Link className="home-button" to="/new">
                <span className="home-button-text">
                  <T>common.how_it_works</T> <ArrowRightOutlined />
                </span>
              </Link>
              <Link
                className="home-button-2"
                to="/how-it-works"
                style={{ marginLeft: "10px" }}
              >
                <span className="home-button-text">
                  {" "}
                  <T>common.how_it_works</T>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* pick your first goa ends */}
      {/* 4th row */}
      <div className="home-row-4">
        <div className="home-row-4-heading font-subheading-black">
          <T>home.home-row-4.your_change</T>
        </div>
        <div
          className="home-row-4-subheading font-heading-black"
          style={{ margin: "20px 0" }}
        >
          <T>home.home-row-4.exercise_whenever</T>
        </div>
        <div className="home-row-4-text font-paragraph-black">
          <T>home.home-row-4.working_out</T>
        </div>
        <div className="home-row-4-heading-icons">
          <LaptopOutlined className="home-row-4-heading-icon" />{" "}
          <TabletOutlined className="home-row-4-heading-icon" />{" "}
          <MobileOutlined className="home-row-4-heading-icon" />{" "}
          <DesktopOutlined className="home-row-4-heading-icon" />
        </div>
        <div className="home-row-4-heading-mobile">
          <img
            src={VideoPhone}
            alt="video-phone"
            className="home-row-4-heading-mobile-image"
          />
        </div>
      </div>
      {/* 4th row */}
      {/* 5th row */}
      <div style={{ backgroundColor: "#171e27" }}>
        <div className="home-row-5">
          <div className="home-row-5-column-1">
            <h3 className="home-row-2-col-1-heading font-heading-white">
              <T>common.how_it_works</T>
            </h3>
            <h2 className="home-row-2-col-1-subheading font-subheading-white">
              <T>home.home-row-5.personal_succ</T>
            </h2>
            <p className="home-text font-paragraph-white">
              {" "}
              <T>home.home-row-5.what</T>
            </p>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.all_the_tools</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.daily_updates</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.your_personal</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.choose</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.week</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-white">
                <T>home.home-row-5.comm</T>
              </span>
            </div>

            <div style={{ paddingTop: "20px" }}>
              <Link className="home-button" to="/new">
                <span className="home-button-text">
                  <T>common.free_intake</T> <ArrowRightOutlined />
                </span>
              </Link>
              <Link
                className="home-button-2"
                to="/how-it-works"
                style={{ marginLeft: "10px" }}
              >
                <span className="home-button-text">
                  <T>common.how_it_works</T>
                </span>
              </Link>
            </div>
          </div>
          <div className="home-row-5-column-2">
            <img
              src={MobileScreen}
              alt="mobile-screen"
              className="home-row-5-column-2-image"
            />
          </div>
        </div>
      </div>
      {/* 5th row */}
      {/* 6th row */}
      <div className="home-row-6">
        <h1 className="home-row-6-heading font-heading-black">
          <T>home.home-row-6.we_share_exp</T>
        </h1>
        <p style={{ fontSize: "18px" }} className="font-paragraph-black">
          <T>home.home-row-6.this_is</T>
        </p>
        <div className="home-row-6-video-container">
          <div
            className="home-row-6-video-container-box home-6-box-1"
            style={{ textAlign: "left" }}
            onClick={() => {
              setLink("https://www.youtube.com/embed/jVfuTFgUQEo");
              setOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div className="home-row-6-text font-paragraph-white">
              <PlayCircleOutlined className="play-icon" />{" "}
              <T>home.home-row-6.find_the_right</T>
            </div>
          </div>
          <div
            className="home-row-6-video-container-box home-6-box-2"
            style={{ textAlign: "left" }}
            onClick={() => {
              setLink("https://youtu.be/dakFOeZGbO4");
              setOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div className="home-row-6-text font-paragraph-white">
              <PlayCircleOutlined className="play-icon" />{" "}
              <T>home.home-row-6.customized_plan</T>
            </div>
          </div>
          <div
            className="home-row-6-video-container-box home-6-box-3"
            onClick={() => {
              setLink("https://youtu.be/0e_0sSkH_dQ");
              setOpen(true);
            }}
            style={{ textAlign: "left" }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div className="home-row-6-text font-paragraph-white">
              <PlayCircleOutlined className="play-icon" />{" "}
              <T>home.home-row-6.exercise_whenever</T>
            </div>
          </div>
        </div>
      </div>
      {/* 6th row */}
      {/* 7th row */}
      <div className="home-row-7">
        <div className="home-row-7-container">
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              <T>home.home-row-7.quit</T>
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>home.home-row-7.feel</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>home.homeTrow-7.together</T>
            </p>
            <Link className="home-button" to="/challenges">
              <span className="home-button-text font-paragraph-white">
                <T>common.start_your_challenge_today</T> <ArrowRightOutlined />
              </span>
            </Link>
            <p style={{ paddingTop: "10px" }} className="font-paragraph-black">
              <T>common.price</T>{" "}
              <Link to="/how-it-works" style={{ color: "#ff7700" }}>
                <T>common.how_it_works_small</T>
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* 7th row */}
      {/* 8th row */}
      <div className="home-row-6" style={{ padding: "100px 50px" }}>
        {console.log(allBlogs, "here")};
        <h1 className="home-row-6-heading font-heading-black">
          <T>home.home-row-8.how</T>
        </h1>
        <p style={{ fontSize: "18px" }} className="font-paragraph-black">
          <T>home.home-row-8.be_sure</T>
        </p>
        <div className="home-row-6-video-container">
          {allBlogs.map(
            (blog, i) =>
              blog.adminApproved &&
              blog.isPublic && (
                <Link
                  key={i}
                  to={`/magazine/${slug(blog.title)}/${blog._id}`}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#171e27",
                    padding: "10px",
                    width: "100%",
                  }}
                >
                  <div
                    className="magazine-row-2-box"
                    style={{ height: "300px" }}
                  >
                    <div
                      className="home-row-8-blog-container-box home-8-box-1"
                      style={{
                        background: `url(${process.env.REACT_APP_SERVER}/uploads/${blog.featuredImage})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    ></div>
                  </div>

                  <div
                    style={{
                      color: "#ff7700",
                      textAlign: "right",
                      textTransform: "uppercase",
                    }}
                  >
                    {blog?.category?.name}
                  </div>
                  <h2
                    style={{ fontWeight: "600" }}
                    className="font-subheading-black"
                  >
                    {blog.title}
                  </h2>
                  <p className="font-paragraph-black">
                    {" "}
                    {/* {ReactHtmlParser(blog?.paragraph)} */}
                  </p>
                </Link>
              )
          )}
        </div>
      </div>
      {/* 8th row */}
      {/* 9th row */}
      <div className="home-row-9">
        <h1
          style={{ color: "#fff", fontSize: "4rem" }}
          className="font-heading-white"
        >
          <T>footer.community</T>
        </h1>
        <h2
          style={{ color: "#fff", fontSize: "2.5rem" }}
          className="font-subheading-white"
        >
          <T>footer.follow</T>
        </h2>
      </div>
      {/* 9th row */}
      <Footer />
    </div>
  );
}

export default withRouter(Home);
