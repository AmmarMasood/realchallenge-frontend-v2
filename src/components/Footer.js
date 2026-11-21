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

/**
 * The shop, which does not exist yet.
 *
 * These four were `<Link to="">` - placeholders that navigated to the current
 * URL, under a heading that promised a store. The store is WooCommerce on the
 * content site and is not built (MIGRATION-PLAN-content-site.md 6), so the
 * column is not rendered at all: a heading with four links that go nowhere is
 * worse than no column, and guessing at category URLs that 404 is worse still.
 *
 * Set REACT_APP_SHOP_ENABLED=true the day the store goes live, and CHECK THE
 * SLUGS against WooCommerce's actual category permalinks before you do - the
 * paths below are what the plan proposes, not what has been verified to exist.
 */
const SHOP_ENABLED = process.env.REACT_APP_SHOP_ENABLED === "true";

const SHOP_LINKS = [
  { key: "men", path: "/shop/men", label: "footer.men" },
  { key: "women", path: "/shop/women", label: "footer.women" },
  { key: "gear", path: "/shop/gear", label: "footer.gear" },
  { key: "sale", path: "/shop/sale", label: "footer.sale" },
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
        {SHOP_ENABLED && (
          <div className="footer-row-2-column">
            <h3 className="footer-row-2-column-heading font-subheading-white">
              <T>footer.shop</T>
            </h3>
            {SHOP_LINKS.map(({ key, path, label }) => (
              <a
                key={key}
                href={contentUrl(path)}
                className="footer-row-2-column-link font-paragraph-white"
              >
                <T>{label}</T>
              </a>
            ))}
          </div>
        )}
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
