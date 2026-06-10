const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { validateChatMessage } = require("../utils/validateChatMessage");
const { DEMO_USERS } = require("../utils/seedDemoUsers");

describe("validateChatMessage", () => {
  test("accepts non-empty text", () => {
    assert.equal(validateChatMessage({ message: "hello" }), true);
  });

  test("accepts file-only messages", () => {
    assert.equal(
      validateChatMessage({ message: "", file: "photo.png" }),
      true
    );
  });

  test("rejects empty text without file", () => {
    assert.equal(validateChatMessage({ message: "   " }), false);
    assert.equal(validateChatMessage({ message: "" }), false);
    assert.equal(validateChatMessage({}), false);
  });

  test("trims whitespace before validating text", () => {
    assert.equal(validateChatMessage({ message: "  hi  " }), true);
    assert.equal(validateChatMessage({ message: "   " }), false);
  });
});

describe("demo users seed config", () => {
  test("defines two demo accounts with shared password pattern", () => {
    assert.equal(DEMO_USERS.length, 2);
    assert.ok(DEMO_USERS.every((u) => u.email.endsWith("@omnicomm.app")));
    assert.ok(DEMO_USERS.every((u) => u.password.length >= 8));
  });
});
