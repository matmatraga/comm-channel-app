import { describe, it, expect } from "vitest";
import {
  parseSender,
  sanitizeEmailHtml,
  emailSnippet,
  getInitials,
} from "./emailUtils";

describe("parseSender", () => {
  it("parses name and email from formatted from header", () => {
    const result = parseSender('"Google" <no-reply@accounts.google.com>');
    expect(result.name).toBe("Google");
    expect(result.email).toBe("no-reply@accounts.google.com");
  });

  it("returns raw string when format is plain", () => {
    const result = parseSender("plain@example.com");
    expect(result.name).toBe("plain@example.com");
  });
});

describe("sanitizeEmailHtml", () => {
  it("strips script tags", () => {
    const dirty = '<p>Hello</p><script>alert("x")</script>';
    const clean = sanitizeEmailHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).toContain("Hello");
  });
});

describe("emailSnippet", () => {
  it("returns truncated plain text preview", () => {
    const long = "a".repeat(150);
    const snippet = emailSnippet({ text: long });
    expect(snippet.length).toBeLessThanOrEqual(100);
  });

  it("returns fallback when no text", () => {
    expect(emailSnippet({})).toBe("(No preview)");
  });
});

describe("getInitials", () => {
  it("returns up to two initials", () => {
    expect(getInitials("Demo User One")).toBe("DU");
  });
});
