/**
 * CloudFront Function (viewer request) — real 301s for the pages that moved.
 *
 * WHY THIS EXISTS
 *
 * The public marketing pages moved from this app to WordPress on
 * realchallenge.nl (2026-11-15). In the app, `ContentSiteRedirect` catches the
 * old routes and sends the visitor on, but that is JavaScript: the edge answers
 * 200, ships the whole bundle, and only then redirects. A crawler sees a 200
 * with an empty page and no signal that the content lives elsewhere, so the
 * ranking of nine indexed URLs is thrown away rather than passed on — which is
 * the one thing the migration was for (MIGRATION-PLAN-content-site.md 3).
 *
 * This moves that redirect to the edge, where it is a real 301 and costs no
 * round trip. `ContentSiteRedirect` stays as the client-side backstop for local
 * development and for anyone served a cached bundle.
 *
 * KEEP IN SYNC with MOVED_TO_CONTENT_SITE in src/App.js and CONTENT_PATH_MAP in
 * src/helpers/crossDomain.js. The two lists are deliberately duplicated — a
 * CloudFront Function cannot import, and it runs on every single request, so it
 * carries no dependencies.
 *
 * Deployment: see infra/README.md. This file is NOT bundled into the app.
 */

var CONTENT_SITE = 'https://realchallenge.nl';

/**
 * App path -> content-site path, trailing slash included.
 *
 * WordPress publishes the terms at /terms-and-conditions/, not the app's
 * /terms-condition, and 301s every path to its trailing-slash form. Spelling
 * the final URL out here means one hop, not two: a redirect chain is exactly
 * what this is meant to remove.
 */
/*
 * "/" IS DELIBERATELY ABSENT, and must stay absent.
 *
 * It was here until 2026-11-21. A 301 at the edge runs before any JavaScript,
 * so listing "/" would send every visitor who types the bare app domain to the
 * marketing site — including someone already signed in, who would be thrown
 * out of the application and left with no way back except the login link in
 * the WordPress header. The app's root is handled by AppEntry in
 * src/components/AppEntry.js: dashboard when signed in, login when not.
 *
 * This is the one entry where this file and MOVED_TO_CONTENT_SITE in
 * src/App.js agree by both OMITTING a path. Re-adding it here would silently
 * defeat the route, because the edge answers first.
 */
var MOVED = {
  '/trainers': '/trainers/',
  '/challenges': '/challenges/',
  '/nutrition': '/nutrition/',
  '/pricing': '/pricing/',
  '/how-it-works': '/how-it-works/',
  '/magazine': '/magazine/',
  '/terms-condition': '/terms-and-conditions/',
  '/privacy-policy': '/privacy-policy/',
  '/cookie-policy': '/cookie-policy/'
};

/**
 * Prefixes whose deeper paths moved as a whole.
 *
 * A magazine article is /magazine/<slug>/<id> in the app and
 * /magazine/<slug>/<id>/ on WordPress — same shape, so the tail is carried
 * across untouched rather than enumerated.
 */
var MOVED_PREFIXES = ['/magazine/'];

function queryString(request) {
  var qs = request.querystring;
  var parts = [];
  for (var key in qs) {
    if (!Object.prototype.hasOwnProperty.call(qs, key)) continue;
    var entry = qs[key];
    // A repeated parameter arrives as multiValue; keep every occurrence.
    if (entry.multiValue) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(key + '=' + entry.multiValue[i].value);
      }
    } else if (entry.value === '') {
      parts.push(key);
    } else {
      parts.push(key + '=' + entry.value);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Normalise to the keys above: /pricing/ and /pricing are the same page.
  // The root is left alone, since stripping its slash leaves nothing.
  var key = uri.length > 1 && uri.charAt(uri.length - 1) === '/'
    ? uri.slice(0, -1)
    : uri;

  var target = MOVED[key];

  if (!target) {
    for (var i = 0; i < MOVED_PREFIXES.length; i++) {
      var prefix = MOVED_PREFIXES[i];
      if (uri.indexOf(prefix) === 0 && uri.length > prefix.length) {
        target = uri.charAt(uri.length - 1) === '/' ? uri : uri + '/';
        break;
      }
    }
  }

  // Not a moved path: hand it to the origin untouched. Every app route, every
  // asset and the SPA's own index.html fall through here.
  if (!target) {
    return request;
  }

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: CONTENT_SITE + target + queryString(request) },
      // A permanent redirect that cannot be revised for a year is a liability
      // while the split is this young. A day is long enough to spare the edge
      // the work and short enough to correct a mistake.
      'cache-control': { value: 'max-age=86400' }
    }
  };
}
