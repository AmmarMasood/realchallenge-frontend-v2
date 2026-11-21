/**
 * Where a visitor belongs, decided synchronously.
 *
 * Two places have to answer "logged in?" before the first paint — the root
 * route and the header logo — and neither can wait for an answer.
 */

/**
 * The logged-in home.
 *
 * Named rather than written out in three files, because it has already moved
 * once: the app's public "/" went to WordPress on 2026-11-15, and the dashboard
 * became what "home" means for someone with an account. Next time it moves,
 * this is the only line to change.
 */
export const LOGGED_IN_HOME = "/user/dashboard";

/**
 * Is there a session on this device?
 *
 * The token in localStorage is the only signal available synchronously.
 * `userInfo.authenticated` is set by an async call that resolves a few hundred
 * milliseconds into the page, so for a logged-in visitor it reads FALSE on the
 * first render. Anything deciding where to SEND someone must use this instead,
 * or it sends a logged-in visitor to the logged-out destination during that
 * window — and a redirect fired in that window is not recoverable, because the
 * navigation has already happened by the time the real answer arrives.
 *
 * Presence is not validity. An expired token still reads as a session here and
 * lands the visitor on a PrivateRoute, which bounces them to /login. That is
 * the correct failure: whether a token is good is the server's judgement, not
 * the browser's, and this function deliberately does not try to guess.
 *
 * @returns {boolean}
 */
export function hasSession() {
  try {
    return Boolean(localStorage.getItem("jwtToken"));
  } catch (e) {
    // Safari's private mode and blocked site data both throw on access rather
    // than returning null. No storage means no session we can prove.
    return false;
  }
}
