import React from "react";
import "../assets/footer.css";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import FooterImage from "../images/real-challenge-w-1024x323.png";
import { T } from "./Translate";

function Footer() {
  return (
    <div className="footer">
      <div className="footer-row-1">
        <Link to="www.facebook.com" className="footer-row-1-links">
          <FacebookOutlined style={{ paddingRight: "10px" }} /> Facebook
        </Link>
        <Link to="www.instagram.com" className="footer-row-1-links">
          <InstagramOutlined style={{ paddingRight: "10px" }} /> Instagram
        </Link>
        <Link to="www.twitter.com" className="footer-row-1-links">
          <TwitterOutlined style={{ paddingRight: "10px" }} />
          Twitter
        </Link>
        <Link to="www.youtube.com" className="footer-row-1-links">
          <YoutubeOutlined style={{ paddingRight: "10px" }} />
          Youtube
        </Link>
      </div>
      <div className="footer-row-2">
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.product</T>
          </h3>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.challenge</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.nutrient</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.trainers</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.join_now</T>
          </Link>
        </div>
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.company</T>
          </h3>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.how_it_works</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.pricing</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.magazine</T>
          </Link>
        </div>
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.shop</T>
          </h3>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.men</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.women</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.gear</T>
          </Link>
          <Link to="" className="footer-row-2-column-link font-paragraph-white">
            <T>footer.sale</T>
          </Link>
        </div>
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.about</T>
          </h3>
          <Link
            to="/help-center"
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.help_center</T>
          </Link>
          <Link
            to="/terms-condition"
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.terms_and_condition</T>
          </Link>
          <Link
            to="/privacy-policy"
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.privacy_policy</T>
          </Link>
          <Link
            to="/cookie-policy"
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.cookie_policy</T>
          </Link>
        </div>
      </div>
      <div className="footer-row-3">
        <img
          src={FooterImage}
          alt="footer-logo"
          className="footer-row-3-image"
        />
        <p className="footer-row-3-text">
          {" "}
          <T>footer.copyright</T> &copy; <span>{new Date().getFullYear()}</span>
          ,<T>footer.all_rights_reserved</T>
        </p>
      </div>
    </div>
  );
}

export default Footer;
