import React from "react";
import { Redirect } from "react-router-dom";
import { hasSession, LOGGED_IN_HOME } from "../helpers/auth";

/**
 * What app.realchallenge.nl/ does.
 *
 * This host is the application. Someone who types the bare domain, or follows
 * an old bookmark to it, wants the thing they have an account for — so they get
 * their dashboard if they are signed in and the login screen if they are not.
 *
 * Until now "/" was listed in MOVED_TO_CONTENT_SITE and bounced to the
 * marketing site, which was right while the app had no home of its own but
 * wrong for someone already signed in: it threw them out of the application
 * they were trying to open, and the only way back was the login link in the
 * WordPress header. The marketing home is still one click away — the header
 * logo goes there for anyone not signed in.
 *
 * `Redirect`, not a rendered page, so "/" never appears in history. Pressing
 * Back from the dashboard goes to wherever the visitor really came from rather
 * than to a route that would immediately redirect them forwards again.
 *
 * NOTE: the edge must not 301 "/" away before this can run — see the MOVED map
 * in infra/cloudfront-moved-paths.js, which deliberately omits it.
 */
export default function AppEntry() {
  return <Redirect to={hasSession() ? LOGGED_IN_HOME : "/login"} />;
}
