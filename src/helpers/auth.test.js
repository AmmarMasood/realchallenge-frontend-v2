/**
 * Where the bare app domain sends a visitor.
 *
 * Worth pinning down because both answers are only ever seen for an instant —
 * "/" redirects immediately — so a regression here is invisible in casual use
 * and only shows up as "the app logged me out" or "the logo threw me off the
 * site". See MIGRATION-PLAN-content-site.md §3.3.1.
 */

import React from "react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { hasSession, LOGGED_IN_HOME } from "./auth";
import AppEntry from "../components/AppEntry";

beforeEach(() => {
  localStorage.clear();
});

describe("hasSession", () => {
  test("no token means no session", () => {
    expect(hasSession()).toBe(false);
  });

  test("a token means a session", () => {
    localStorage.setItem("jwtToken", "a.b.c");
    expect(hasSession()).toBe(true);
  });

  test("an empty token is not a session", () => {
    // An empty string is what a half-finished logout leaves behind, and it
    // must not read as signed in — the visitor would be bounced into a
    // PrivateRoute and straight back out again.
    localStorage.setItem("jwtToken", "");
    expect(hasSession()).toBe(false);
  });

  test("it does not throw when localStorage is unavailable", () => {
    // Safari's private mode throws on access rather than returning null. The
    // root route calls this before anything else, so a throw here would be a
    // blank page rather than a login screen.
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });

    expect(() => hasSession()).not.toThrow();
    expect(hasSession()).toBe(false);

    Object.defineProperty(window, "localStorage", original);
  });
});

describe("AppEntry — what app.realchallenge.nl/ does", () => {
  function renderAt(path) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Switch>
          <Route exact path="/" component={AppEntry} />
          <Route path="/login">
            <div>LOGIN SCREEN</div>
          </Route>
          <Route path={LOGGED_IN_HOME}>
            <div>HOME SCREEN</div>
          </Route>
        </Switch>
      </MemoryRouter>
    );
  }

  test("a signed-out visitor gets the login screen", () => {
    renderAt("/");
    expect(screen.getByText("LOGIN SCREEN")).toBeInTheDocument();
  });

  test("a signed-in visitor gets their home screen", () => {
    localStorage.setItem("jwtToken", "a.b.c");
    renderAt("/");
    expect(screen.getByText("HOME SCREEN")).toBeInTheDocument();
  });

  test("it never renders the content site, in either state", () => {
    // The regression this guards: "/" used to be in MOVED_TO_CONTENT_SITE and
    // sent EVERY visitor to the marketing site, signed in or not.
    renderAt("/");
    expect(screen.queryByText(/realchallenge\.nl/i)).toBeNull();

    localStorage.setItem("jwtToken", "a.b.c");
    renderAt("/");
    expect(screen.queryByText(/realchallenge\.nl/i)).toBeNull();
  });
});
