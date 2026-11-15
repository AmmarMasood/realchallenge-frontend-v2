/**
 * Cross-domain language handoff with the WordPress site on realchallenge.nl.
 *
 * The behaviour these cover is invisible in normal use and only wrong at the
 * moment it matters — a visitor crossing from the marketing site into the app —
 * so it is worth pinning down. See MIGRATION-PLAN-content-site.md §3.3.1.
 */

import {
  sharedCookieDomain,
  readSharedCookie,
  writeSharedCookie,
  isSupportedLanguage,
  readLanguageFromUrl,
  stripLanguageFromUrl,
} from "./crossDomain";

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = name + "=; path=/; max-age=0";
  });
}

beforeEach(() => {
  clearCookies();
  window.history.replaceState({}, "", "/");
});

describe("sharedCookieDomain", () => {
  it("reduces both hosts to the same parent domain", () => {
    // This is the whole point: one cookie readable from both sites.
    expect(sharedCookieDomain("app.realchallenge.nl")).toBe(".realchallenge.nl");
    expect(sharedCookieDomain("realchallenge.nl")).toBe(".realchallenge.nl");
  });

  it("returns null on localhost, where a host-only cookie already spans ports", () => {
    expect(sharedCookieDomain("localhost")).toBeNull();
    expect(sharedCookieDomain("127.0.0.1")).toBeNull();
  });

  it("returns null for an IP, which has no parent domain to share", () => {
    expect(sharedCookieDomain("192.168.1.10")).toBeNull();
  });

  it("returns null for a bare hostname", () => {
    expect(sharedCookieDomain("")).toBeNull();
    expect(sharedCookieDomain("intranet")).toBeNull();
  });
});

describe("isSupportedLanguage", () => {
  it("accepts the languages we ship", () => {
    expect(isSupportedLanguage("english")).toBe(true);
    expect(isSupportedLanguage("dutch")).toBe(true);
  });

  it("rejects anything else", () => {
    // Values arriving from a URL are untrusted; an unknown one must fall through
    // to the stored preference rather than be persisted.
    expect(isSupportedLanguage("klingon")).toBe(false);
    expect(isSupportedLanguage("<script>")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });
});

describe("cookie read/write", () => {
  it("round-trips a value", () => {
    writeSharedCookie("locale", "dutch");
    expect(readSharedCookie("locale")).toBe("dutch");
  });

  it("returns null for a cookie that is not set", () => {
    expect(readSharedCookie("nope")).toBeNull();
  });

  it("does not confuse a cookie whose name is a suffix of another", () => {
    writeSharedCookie("mylocale", "english");
    writeSharedCookie("locale", "dutch");
    expect(readSharedCookie("locale")).toBe("dutch");
    expect(readSharedCookie("mylocale")).toBe("english");
  });
});

describe("readLanguageFromUrl", () => {
  it("reads a supported language", () => {
    window.history.replaceState({}, "", "/?lang=dutch");
    expect(readLanguageFromUrl()).toBe("dutch");
  });

  it("ignores an unsupported one", () => {
    window.history.replaceState({}, "", "/?lang=klingon");
    expect(readLanguageFromUrl()).toBeNull();
  });

  it("is null when the parameter is absent", () => {
    window.history.replaceState({}, "", "/somewhere");
    expect(readLanguageFromUrl()).toBeNull();
  });
});

describe("stripLanguageFromUrl", () => {
  it("removes lang so it cannot leak into shared links", () => {
    window.history.replaceState({}, "", "/page?lang=dutch");
    stripLanguageFromUrl();
    expect(window.location.search).not.toContain("lang");
  });

  it("leaves the other parameters alone", () => {
    window.history.replaceState({}, "", "/page?lang=dutch&package=CHALLENGE_12");
    stripLanguageFromUrl();
    expect(window.location.search).toContain("package=CHALLENGE_12");
    expect(window.location.search).not.toContain("lang");
  });

  it("keeps the path and hash", () => {
    window.history.replaceState({}, "", "/deep/path?lang=dutch#section");
    stripLanguageFromUrl();
    expect(window.location.pathname).toBe("/deep/path");
    expect(window.location.hash).toBe("#section");
  });

  it("is a no-op when there is nothing to strip", () => {
    window.history.replaceState({}, "", "/page?keep=1");
    stripLanguageFromUrl();
    expect(window.location.search).toBe("?keep=1");
  });
});
