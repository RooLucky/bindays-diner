import assert from "node:assert/strict";
import test from "node:test";
import { verifyRecaptchaToken } from "../lib/recaptcha-verification";
import { validateUploadSignature } from "../lib/upload-validation";
import { readLimitedBody } from "../lib/public-request-error";

const config = { secret: "test-secret", hostnames: ["example.com"] };
const reply =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    Response.json(body, { status });

test("CAPTCHA rejects missing configuration and tokens without contacting Google", async () => {
  const never: typeof fetch = async () => {
    throw new Error("Must not call provider");
  };
  assert.equal(await verifyRecaptchaToken(null, config, never), false);
  assert.equal(
    await verifyRecaptchaToken("x".repeat(4097), config, never),
    false,
  );
  assert.equal(
    await verifyRecaptchaToken("token", { hostnames: [] }, never),
    false,
  );
});
test("CAPTCHA accepts only successful verification for an exact allowed hostname", async () => {
  assert.equal(
    await verifyRecaptchaToken(
      "token",
      config,
      reply({ success: true, hostname: "example.com" }),
    ),
    true,
  );
  for (const result of [
    {
      success: false,
      hostname: "example.com",
      "error-codes": ["timeout-or-duplicate"],
    },
    { success: true, hostname: "example.com.attacker.test" },
    { success: true },
    { success: "true", hostname: "example.com" },
  ])
    assert.equal(
      await verifyRecaptchaToken("token", config, reply(result)),
      false,
    );
});
test("CAPTCHA fails closed on provider/network/JSON failures", async () => {
  assert.equal(
    await verifyRecaptchaToken("token", config, reply({}, 503)),
    false,
  );
  assert.equal(
    await verifyRecaptchaToken("token", config, async () => {
      throw new Error("timeout");
    }),
    false,
  );
  assert.equal(
    await verifyRecaptchaToken(
      "token",
      config,
      async () => new Response("not JSON"),
    ),
    false,
  );
});
test("CAPTCHA sends secret only in a server POST to Google's fixed endpoint", async () => {
  await verifyRecaptchaToken("a&b", config, async (url, init) => {
    assert.equal(url, "https://www.google.com/recaptcha/api/siteverify");
    assert.equal(init?.method, "POST");
    assert.equal(init?.cache, "no-store");
    const body = init?.body as URLSearchParams;
    assert.equal(body.get("secret"), "test-secret");
    assert.equal(body.get("response"), "a&b");
    return Response.json({ success: true, hostname: "example.com" });
  });
});
test("uploads reject SVG, HTML disguised as images, and mismatched file types", () => {
  for (const type of [
    "image/svg+xml",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ])
    assert.throws(() =>
      validateUploadSignature(
        Buffer.from('<svg onload="alert(1)">'),
        type,
        true,
      ),
    );
  assert.doesNotThrow(() =>
    validateUploadSignature(Buffer.from([255, 216, 255, 0]), "image/jpeg"),
  );
  assert.doesNotThrow(() =>
    validateUploadSignature(Buffer.from("%PDF-1.7"), "application/pdf", true),
  );
  assert.throws(() =>
    validateUploadSignature(Buffer.from("%PDF-1.7"), "application/pdf"),
  );
});

test("body limit counts actual bytes even when Content-Length is forged", async () => {
  const request = new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Length": "1" },
    body: "123456",
  });
  await assert.rejects(readLimitedBody(request, 5), /too large/);
  const valid = new Request("https://example.com", {
    method: "POST",
    body: '{"ok":true}',
  });
  assert.deepEqual(await (await readLimitedBody(valid)).json(), { ok: true });
});
