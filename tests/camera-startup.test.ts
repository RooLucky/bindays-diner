import test from "node:test";
import assert from "node:assert/strict";
import { withCameraTimeout } from "../lib/camera-startup";

test("an unanswered camera request ends with a recoverable timeout", async () => {
  await assert.rejects(withCameraTimeout(new Promise(() => {}), 10, "Camera did not respond"), {
    name: "CameraTimeoutError", message: "Camera did not respond",
  });
});

test("a camera granted after timeout is released instead of left recording", async () => {
  let grant!: (stream: { stop: () => void }) => void;
  let stopped = false;
  const pending = new Promise<{ stop: () => void }>(resolve => { grant = resolve; });
  await assert.rejects(withCameraTimeout(pending, 10, "Timed out", stream => stream.stop()));
  grant({ stop: () => { stopped = true; } });
  await Promise.resolve();
  assert.equal(stopped, true);
});

test("successful startup and camera permission errors retain their outcomes", async () => {
  assert.equal(await withCameraTimeout(Promise.resolve("ready"), 100, "Timeout"), "ready");
  const denied = new Error("Denied");
  denied.name = "NotAllowedError";
  await assert.rejects(withCameraTimeout(Promise.reject(denied), 100, "Timeout"), { name: "NotAllowedError" });
});
