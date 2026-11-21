/**
 * Exercise the CloudFront Function locally.
 *
 * CloudFront Functions have no local runtime, so the file is loaded as plain
 * text and evaluated — the alternative is finding out in production, on the one
 * piece of code that runs on EVERY request to the app.
 *
 * Run: node infra/cloudfront-moved-paths.test.js
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(
  path.join(__dirname, "cloudfront-moved-paths.js"),
  "utf8"
);
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(source + "\nthis.handler = handler;", sandbox);
const { handler } = sandbox;

let failed = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(
    `  [${ok ? "ok  " : "FAIL"}] ${label}${ok ? "" : `\n         got      ${actual}\n         expected ${expected}`}`
  );
}

function run(uri, querystring = {}) {
  const out = handler({ request: { uri, querystring } });
  return out.statusCode ? `${out.statusCode} ${out.headers.location.value}` : "PASS";
}

console.log("== moved pages 301 to the content site ==");
check("root", run("/"), "301 https://realchallenge.nl/");
check("pricing", run("/pricing"), "301 https://realchallenge.nl/pricing/");
check("trailing slash is the same page", run("/pricing/"), "301 https://realchallenge.nl/pricing/");
check("nutrition", run("/nutrition"), "301 https://realchallenge.nl/nutrition/");
check("how-it-works", run("/how-it-works"), "301 https://realchallenge.nl/how-it-works/");
check("challenges", run("/challenges"), "301 https://realchallenge.nl/challenges/");
check("trainers", run("/trainers"), "301 https://realchallenge.nl/trainers/");
check("magazine index", run("/magazine"), "301 https://realchallenge.nl/magazine/");

console.log("\n== the slug WordPress actually publishes ==");
check(
  "terms uses the WP spelling, in ONE hop",
  run("/terms-condition"),
  "301 https://realchallenge.nl/terms-and-conditions/"
);
check("privacy", run("/privacy-policy"), "301 https://realchallenge.nl/privacy-policy/");
check("cookie", run("/cookie-policy"), "301 https://realchallenge.nl/cookie-policy/");

console.log("\n== magazine articles carry their tail ==");
check(
  "article",
  run("/magazine/test-1/6adcef8ce03e80c3cce8467e"),
  "301 https://realchallenge.nl/magazine/test-1/6adcef8ce03e80c3cce8467e/"
);

console.log("\n== the query string survives ==");
check(
  "lang is carried",
  run("/pricing", { lang: { value: "dutch" } }),
  "301 https://realchallenge.nl/pricing/?lang=dutch"
);
check(
  "several parameters",
  run("/pricing", { lang: { value: "dutch" }, utm_source: { value: "nl" } }),
  "301 https://realchallenge.nl/pricing/?lang=dutch&utm_source=nl"
);
check(
  "a valueless parameter stays valueless",
  run("/pricing", { debug: { value: "" } }),
  "301 https://realchallenge.nl/pricing/?debug"
);
check(
  "a repeated parameter keeps every value",
  run("/pricing", {
    tag: { value: "a", multiValue: [{ value: "a" }, { value: "b" }] }
  }),
  "301 https://realchallenge.nl/pricing/?tag=a&tag=b"
);

console.log("\n== everything else reaches the origin untouched ==");
[
  "/login",
  "/signup",
  "/user/dashboard",
  "/recipe/green-bowl/6adcef8ce03e80c3cce8467e",
  "/challenge/x/1",
  "/help-center",
  "/index.html",
  "/static/js/main.c138d865.chunk.js",
  "/favicon.ico",
  "/manifest.json",
  // Near-misses: these must NOT be swept up by the prefix rule or the map.
  "/magazines",
  "/pricing-table",
  "/nutritional-info"
].forEach((uri) => check(uri, run(uri), "PASS"));

console.log("\n" + "=".repeat(60));
console.log(failed ? `FAILURES  (${failed} failing)` : "ALL PASS");
process.exit(failed ? 1 : 0);
