import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contentUrl } from "../helpers/crossDomain";

/**
 * Hand a visitor over to the WordPress content site.
 *
 * The marketing pages moved to realchallenge.nl on 2026-11-15 and their routes
 * here were removed (/nutrition among them since 2026-11-15, where the
 * WordPress catalogue is built from the same bridge endpoint). Links already in
 * the wild — bookmarks, old newsletters, search results that have not been
 * recrawled — still arrive at app.realchallenge.nl/pricing and friends, and with
 * no route they rendered a blank page. This sends them on to the same path on the content site, which
 * uses identical slugs (including /magazine/<slug>/<id>/, deliberately mirrored
 * in the theme's rc_magazine_rewrite()), so the path copies across untouched.
 *
 * `replace`, not `assign`: the dead URL should not sit in history where Back
 * would bounce the visitor straight back into this redirect.
 *
 * This is a client-side redirect and therefore a stopgap for SEO — it costs a
 * bundle load, and crawlers treat it as weaker than the real thing. The proper
 * fix is a 301 at the edge for every path in MOVED_TO_CONTENT_SITE
 * (MIGRATION-PLAN-content-site.md §3, SEO hygiene); this guarantees nobody hits
 * a white screen in the meantime.
 */
export default function ContentSiteRedirect() {
  const location = useLocation();

  useEffect(() => {
    window.location.replace(contentUrl(location.pathname + location.search));
  }, [location.pathname, location.search]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <p className="font-paragraph-white">
        Taking you to{" "}
        <a href={contentUrl(location.pathname + location.search)}>
          realchallenge.nl
        </a>
        …
      </p>
    </div>
  );
}
