import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidBirthday,
  loyaltyRegistrationSchema,
} from "../lib/loyalty-registration";
import { submitVerifiedForm } from "../lib/public-form-request";

test("loyalty birthdays reject impossible, future, and unsupported dates", () => {
  assert.equal(isValidBirthday("2000-02-29", "2026-10-05"), true);
  for (const value of [
    "2001-02-29",
    "2026-02-30",
    "2026-10-06",
    "1919-12-31",
    "not-a-date",
  ]) {
    assert.equal(isValidBirthday(value, "2026-10-05"), false);
  }
  assert.equal(
    loyaltyRegistrationSchema.safeParse({
      fullName: " ",
      birthday: "2000-01-01",
    }).success,
    false,
  );
});

test("unverified submissions never reach the network", async () => {
  const response = await submitVerifiedForm(
    "/api/example",
    {},
    "",
    async () => {
      assert.fail("Must not send without CAPTCHA");
    },
  );
  assert.equal(response.status, 403);
});

test("verified multipart submission preserves the body and server validation response", async () => {
  const body = new FormData();
  body.set("name", "Example");
  const response = await submitVerifiedForm(
    "/api/example",
    { method: "POST", body },
    "verified-token",
    async (_input, init) => {
      assert.equal(init?.body, body);
      assert.equal(
        new Headers(init?.headers).get("x-recaptcha-token"),
        "verified-token",
      );
      assert.equal(new Headers(init?.headers).has("content-type"), false);
      return Response.json(
        { ok: false, error: "Please correct the form." },
        { status: 400 },
      );
    },
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Please correct the form.");
});

test("proxy upload failures and malformed success responses become readable form errors", async () => {
  for (const status of [413, 200]) {
    const response = await submitVerifiedForm(
      "/api/example",
      {},
      "token",
      async () => new Response("<html>Proxy error</html>", { status }),
    );
    assert.equal(response.status, status === 413 ? 413 : 502);
    assert.equal((await response.json()).ok, false);
  }
});

test("network failure returns a retryable form error", async () => {
  const response = await submitVerifiedForm(
    "/api/example",
    {},
    "token",
    async () => {
      throw new TypeError("Failed to fetch");
    },
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /try again/i);
});
