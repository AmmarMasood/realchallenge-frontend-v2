# Edge configuration

## `cloudfront-moved-paths.js` — 301s for the pages that moved to WordPress

The nine public marketing pages now live on `realchallenge.nl`. In the app,
`ContentSiteRedirect` still catches their old routes, but it is JavaScript: the
edge answers **200**, ships the bundle, and only then redirects. A crawler reads
that as "this URL exists and is empty" and the ranking of nine indexed URLs is
lost instead of passed on — the opposite of why the content was moved
(`MIGRATION-PLAN-content-site.md` §3).

This function turns it into a real 301 at the edge. It must be attached to the
`app.realchallenge.nl` distribution on **viewer request**.

### What it does and does not touch

| Request | Result |
| --- | --- |
| `/`, `/pricing`, `/nutrition`, `/challenges`, `/trainers`, `/how-it-works`, `/magazine`, `/terms-condition`, `/privacy-policy`, `/cookie-policy` | 301 to the WordPress page, trailing slash included |
| `/magazine/<slug>/<id>` | 301, tail carried across |
| Everything else — every app route, `index.html`, `/static/*`, assets | passed to the origin untouched |

Two details that are deliberate, not incidental:

- **`/terms-condition` → `/terms-and-conditions/`.** WordPress publishes that
  page under a different slug. The final URL is spelled out so the visitor makes
  one hop, not two; a redirect chain is what this is meant to remove.
- **The SPA fallback is unaffected.** `/login` has no S3 key, CloudFront's custom
  error response serves `/index.html`, and that fetch is internal — the function
  runs on *viewer* requests only, so it cannot see it and cannot loop.

### Test before deploying

```bash
node infra/cloudfront-moved-paths.test.js
```

Runs the real file (loaded and evaluated as-is, not a copy) against every moved
path, the near-misses that must *not* match, and the query-string cases.
CloudFront Functions have no local runtime, and this code runs on every single
request to the app, so it is worth the thirty seconds.

### Deploy

Requires AWS credentials with CloudFront access — neither the CLI nor a
credentials file is present on the machine this was written on, so it has **not
been applied**. Either path below works.

**Console** — CloudFront → Functions → Create function (`realchallenge-moved-paths`,
runtime `cloudfront-js-2.0`) → paste the file → Publish → Distribution →
Behaviors → the Default (`*`) behavior → Edit → Function associations → Viewer
request → the function → Save.

**CLI**

```bash
# 1. The distribution serving app.realchallenge.nl
aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Aliases.Items, 'app.realchallenge.nl')].[Id,DomainName]" \
  --output text

# 2. Create and publish
aws cloudfront create-function \
  --name realchallenge-moved-paths \
  --function-config 'Comment="301 the pages that moved to realchallenge.nl",Runtime=cloudfront-js-2.0' \
  --function-code fileb://infra/cloudfront-moved-paths.js

ETAG=$(aws cloudfront describe-function --name realchallenge-moved-paths \
  --query ETag --output text)
aws cloudfront publish-function --name realchallenge-moved-paths --if-match "$ETAG"
```

Then attach it to the default behavior as `viewer-request`. That step edits the
whole distribution config, so do it in the console unless you are comfortable
round-tripping `get-distribution-config` through `update-distribution` — a
hand-edited config is the easiest way to take the app offline.

### Verify

```bash
for p in / /pricing /nutrition /terms-condition /magazine/test-1/6adcef8ce03e80c3cce8467e; do
  curl -s -o /dev/null -w "%{http_code} $p -> %{redirect_url}\n" "https://app.realchallenge.nl$p"
done
# every line: 301, landing on realchallenge.nl, with NO second hop

curl -s -o /dev/null -w "%{http_code}\n" https://app.realchallenge.nl/login
# must still be 200 — if this 301s, the function is matching too much
```

### When a page moves back

`MOVED` here, `MOVED_TO_CONTENT_SITE` in `src/App.js` and `CONTENT_PATH_MAP` in
`src/helpers/crossDomain.js` have to change together, and so does any
retired-path redirect in the WordPress theme. Nutrition moved to the app and
back inside one day in November 2026, and the theme's 301 for it would have
bounced visitors between the two hosts forever had it survived the trip back.
