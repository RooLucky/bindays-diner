import test from "node:test";
import assert from "node:assert/strict";
import {
  createRecaptchaSessionToken,
  verifyRecaptchaSessionToken,
} from "../lib/recaptcha-session-token";

const secret = "test-only-server-secret";
const hostname = "bindaysdiner.com";

test("a signed browser session can verify repeated requests", () => {
  const token = createRecaptchaSessionToken(secret, hostname);
  assert.equal(verifyRecaptchaSessionToken(token, secret, hostname), true);
  assert.equal(verifyRecaptchaSessionToken(token, secret, hostname), true);
  assert.notEqual(createRecaptchaSessionToken(secret, hostname), token);
});

test("session verification rejects forged, malformed, and missing cookies", () => {
  const token = createRecaptchaSessionToken(secret, hostname);
  const [version, nonce, signature] = token.split(".");
  const altered = `${version}.${nonce[0] === "a" ? "b" : "a"}${nonce.slice(1)}.${signature}`;
  for (const value of [
    undefined,
    "",
    "true",
    "verified",
    altered,
    `${token}.extra`,
    token.slice(1),
  ]) {
    assert.equal(verifyRecaptchaSessionToken(value, secret, hostname), false);
  }
});

test("session signatures cannot transfer to another hostname or survive secret rotation", () => {
  const token = createRecaptchaSessionToken(secret, hostname);
  assert.equal(
    verifyRecaptchaSessionToken(token, secret, "other.example"),
    false,
  );
  assert.equal(
    verifyRecaptchaSessionToken(token, "rotated-secret", hostname),
    false,
  );
  assert.equal(verifyRecaptchaSessionToken(token, "", hostname), false);
});
