/**
 * State shared with the WordPress site on realchallenge.nl.
 *
 * The public content site and this app are different origins, so `localStorage`
 * cannot be read across them. Anything both sides need — currently the chosen
 * language — lives in a cookie on the PARENT domain (`.realchallenge.nl`), which
 * both `realchallenge.nl` and `app.realchallenge.nl` can read and write.
 *
 * See MIGRATION-PLAN-content-site.md §3.3.1.
 */

import { SUPPORTED_LANGUAGES } from "../config/languages";

/**
 * Cookie domain that both sites share.
 *
 * `app.realchallenge.nl` and `realchallenge.nl` both reduce to
 * `.realchallenge.nl`. On localhost we return null and set a host-only cookie:
 * cookies ignore the port, so the app on :3001 and WordPress on :8080 already
 * share it, and `domain=.localhost` is rejected by browsers.
 *
 * Takes the hostname as an argument (defaulting to the current one) purely so it
 * can be unit-tested across hosts without mocking `window.location`, which jsdom
 * makes needlessly painful.
 *
 * @param {string} [hostname]
 * @returns {string|null}
 */
export function sharedCookieDomain(hostname) {
  const host =
    hostname !== undefined
      ? hostname
      : typeof window !== "undefined"
      ? window.location.hostname
      : "";
  if (!host) return null;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return null;
  // An IP address has no parent domain to share.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  const parts = host.split(".");
  if (parts.length < 2) return null;
  return "." + parts.slice(-2).join(".");
}

/**
 * Read a cookie by name.
 *
 * @param {string} name
 * @returns {string|null}
 */
export function readSharedCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Write a cookie both sites can see.
 *
 * SameSite=Lax rather than Strict: the whole point is a top-level navigation from
 * realchallenge.nl to this app, and Strict would withhold the cookie on exactly
 * that hop.
 *
 * @param {string} name
 * @param {string} value
 * @param {number} maxAgeSeconds
 */
export function writeSharedCookie(name, value, maxAgeSeconds = 31536000) {
  if (typeof document === "undefined") return;
  const domain = sharedCookieDomain();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; path=/; max-age=" +
    maxAgeSeconds +
    "; samesite=lax" +
    (domain ? "; domain=" + domain : "") +
    (secure ? "; secure" : "");
}

/**
 * Is this one of the languages we actually ship?
 *
 * Anything arriving from a URL is untrusted input — an unknown value must fall
 * through to the existing preference, never be stored.
 *
 * @param {*} code
 * @returns {boolean}
 */
export function isSupportedLanguage(code) {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}

/**
 * Read `?lang=` from the current URL, if it names a language we support.
 *
 * This is the single place inbound entry parameters are read. Two more are
 * planned on the same contract (`?package=` from the WordPress pricing page, and
 * the shop checkout handoff token), and they belong here rather than being bolted
 * on separately — see MIGRATION-PLAN-content-site.md §3.3.1.
 *
 * @returns {string|null}
 */
export function readLanguageFromUrl() {
  if (typeof window === "undefined") return null;
  let value = null;
  try {
    value = new URLSearchParams(window.location.search).get("lang");
  } catch (e) {
    return null;
  }
  return isSupportedLanguage(value) ? value : null;
}

/**
 * Drop `lang` from the address bar once it has been consumed.
 *
 * Without this it survives into shared links, bookmarks and analytics, where it
 * would silently pin a language for whoever opens them next. Uses replaceState so
 * it does not add a history entry the back button would land on.
 */
export function stripLanguageFromUrl() {
  if (typeof window === "undefined" || !window.history || !window.history.replaceState) {
    return;
  }
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("lang")) return;
    url.searchParams.delete("lang");
    const search = url.searchParams.toString();
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + (search ? "?" + search : "") + url.hash
    );
  } catch (e) {
    /* a URL we cannot parse is not worth breaking boot over */
  }
}

/* ───────────────────────────────────────────────────────────────────────────
 * Links back out to the content site.
 *
 * The marketing pages — home, pricing, how it works, challenges, trainers,
 * nutrition, magazine and the legal pages — moved to WordPress on
 * realchallenge.nl (2026-11-15), so the nav, the footer and a handful of in-app
 * CTAs now point at another origin. That means a plain <a href>, never a react-router <Link>:
 * <Link> would push a path this router no longer has a route for and render a
 * blank screen, which is exactly the bug this replaces.
 *
 * This is the mirror image of rc_app_url() in the WordPress theme
 * (inc/links.php), down to carrying the language: WordPress resolves ?lang=
 * ahead of the shared cookie, so a reader who switched to Dutch here keeps Dutch
 * over there even when the cookie is blocked.
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Origin of the WordPress content site.
 *
 * Override with REACT_APP_CONTENT_URL for staging. The localhost default is the
 * port realchallenge-wp-local serves on, so the nav works in development without
 * anyone setting an env var.
 *
 * @returns {string} Origin with no trailing slash.
 */
export function contentSiteOrigin() {
  const configured =
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_CONTENT_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const host =
    typeof window !== "undefined" ? window.location.hostname : "";
  if (host === "localhost" || host === "127.0.0.1") {
    return window.location.protocol + "//" + host + ":8080";
  }
  return "https://realchallenge.nl";
}

/**
 * Paths whose slug differs on the content site.
 *
 * Verified against the live site, not assumed: WordPress publishes the terms at
 * /terms-and-conditions/, while this app's route was /terms-condition. Linking
 * to the app's spelling lands on a 404 — which is how this entry was found.
 * Everything else uses the same slug on both sides.
 */
const CONTENT_PATH_MAP = {
  "/terms-condition": "/terms-and-conditions/",
};

/**
 * The content site's path for an app path.
 *
 * Adds the trailing slash WordPress's permalinks use. Without it every link
 * costs an extra 301 hop, and a redirect chain is exactly what the migration is
 * meant to remove. Paths that already carry an extension (a file, not a page)
 * are left alone.
 *
 * @param {string} path Path beginning with a slash, query and hash stripped.
 * @returns {string}
 */
function contentPath(path) {
  if (CONTENT_PATH_MAP[path]) return CONTENT_PATH_MAP[path];
  if (path === "/" || path.endsWith("/")) return path;
  if (/\.[a-z0-9]{2,5}$/i.test(path)) return path;
  return path + "/";
}

/**
 * Build a URL into the content site, carrying the current language.
 *
 * Merges `lang` into whatever query string the path already has rather than
 * appending a second `?` — the same mistake rc_app_url() documents having made in
 * the other direction.
 *
 * @param {string} [path] Path beginning with a slash, e.g. '/pricing'.
 * @returns {string}
 */
export function contentUrl(path = "/") {
  const base = contentSiteOrigin();
  const raw = path && path.charAt(0) === "/" ? path : "/" + (path || "");

  // Keep any query string and hash out of the slug mapping.
  const cut = raw.search(/[?#]/);
  const clean =
    cut === -1
      ? contentPath(raw)
      : contentPath(raw.slice(0, cut)) + raw.slice(cut);

  // Read the stored language directly rather than through translationHelpers,
  // which imports this file — a cycle that would only bite at module-init time,
  // and is not worth risking for four lines.
  let locale = readSharedCookie("locale");
  if (!isSupportedLanguage(locale)) {
    try {
      locale = localStorage.getItem("locale");
    } catch (e) {
      locale = null;
    }
  }
  if (!isSupportedLanguage(locale)) return base + clean;

  try {
    const url = new URL(clean, base);
    url.searchParams.set("lang", locale);
    return url.toString();
  } catch (e) {
    const sep = clean.indexOf("?") === -1 ? "?" : "&";
    return base + clean + sep + "lang=" + encodeURIComponent(locale);
  }
}
