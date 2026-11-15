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
import { contentUrl } from "../helpers/crossDomain";

/**
 * Social profiles, from the environment.
 *
 * These were `<Link to="www.facebook.com">`, which react-router reads as a
 * RELATIVE in-app path - they navigated to /www.facebook.com and rendered
 * nothing. A network with no URL configured is not rendered at all rather than
 * shipping a dead link; this mirrors the WordPress theme, where the same four
 * URLs are Customizer settings (functions.php, rc_customize_register).
 */
const SOCIALS = [
  {
    key: "facebook",
    label: "Facebook",
    url: process.env.REACT_APP_SOCIAL_FACEBOOK,
    Icon: FacebookOutlined,
  },
  {
    key: "instagram",
    label: "Instagram",
    url: process.env.REACT_APP_SOCIAL_INSTAGRAM,
    Icon: InstagramOutlined,
  },
  {
    key: "twitter",
    label: "Twitter",
    url: process.env.REACT_APP_SOCIAL_TWITTER,
    Icon: TwitterOutlined,
  },
  {
    key: "youtube",
    label: "Youtube",
    url: process.env.REACT_APP_SOCIAL_YOUTUBE,
    Icon: YoutubeOutlined,
  },
];

function Footer() {
  return (
    <div className="footer">
      <div className="footer-row-1">
        {SOCIALS.filter((network) => network.url).map(
          ({ key, label, url, Icon }) => (
            <a
              key={key}
              href={url}
              className="footer-row-1-links"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon style={{ paddingRight: "10px" }} /> {label}
            </a>
          )
        )}
      </div>
      <div className="footer-row-2">
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.product</T>
          </h3>
          {/* These four were `<Link to="">` - placeholders that navigated to the
              current URL. Challenges, Nutrition and Trainers are the content
              site's pages now; Join now is this app's. */}
          <a
            href={contentUrl("/challenges")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.challenge</T>
          </a>
          <a
            href={contentUrl("/nutrition")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.nutrient</T>
          </a>
          <a
            href={contentUrl("/trainers")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.trainers</T>
          </a>
          <Link
            to="/new"
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.join_now</T>
          </Link>
        </div>
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.company</T>
          </h3>
          <a
            href={contentUrl("/how-it-works")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.how_it_works</T>
          </a>
          <a
            href={contentUrl("/pricing")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.pricing</T>
          </a>
          <a
            href={contentUrl("/magazine")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.magazine</T>
          </a>
        </div>
        <div className="footer-row-2-column">
          <h3 className="footer-row-2-column-heading font-subheading-white">
            <T>footer.shop</T>
          </h3>
          {/* STILL DEAD, deliberately: the shop is WooCommerce on the content
              site and does not exist yet (MIGRATION-PLAN-content-site.md 6).
              Pointing these at a URL that 404s would be worse than leaving
              them, and inventing categories worse still. Wire them to
              contentUrl("/shop/...") the day the store goes live. */}
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
          <a
            href={contentUrl("/terms-condition")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.terms_and_condition</T>
          </a>
          <a
            href={contentUrl("/privacy-policy")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.privacy_policy</T>
          </a>
          <a
            href={contentUrl("/cookie-policy")}
            className="footer-row-2-column-link font-paragraph-white"
          >
            <T>footer.cookie_policy</T>
          </a>
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
