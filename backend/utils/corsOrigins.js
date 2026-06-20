const fs = require("fs");
const path = require("path");

const DEBUG_LOG = path.join(__dirname, "..", "..", "debug-8bc161.log");

const normalizeOrigin = (origin) =>
  origin ? origin.trim().replace(/\/+$/, "") : origin;

const debugLog = (location, message, data, hypothesisId) => {
  const entry = {
    sessionId: "8bc161",
    location,
    message,
    data,
    hypothesisId,
    timestamp: Date.now(),
  };
  try {
    fs.appendFileSync(DEBUG_LOG, `${JSON.stringify(entry)}\n`);
  } catch {
    // ignore local log failures on hosted runtimes
  }
};

const getAllowedOrigins = () => {
  const raw = process.env.CLIENT_URL || "http://localhost:5173";
  return raw
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
};

const getVercelPreviewPattern = (allowedOrigins) => {
  if (process.env.ALLOW_VERCEL_PREVIEWS === "false") return null;

  const vercelOrigin = allowedOrigins.find((origin) =>
    /\.vercel\.app$/i.test(origin)
  );
  if (!vercelOrigin) return null;

  try {
    const hostname = new URL(vercelOrigin).hostname;
    const projectSlug = hostname.replace(/\.vercel\.app$/i, "");
    const prefix = projectSlug.endsWith("-app")
      ? projectSlug.slice(0, -4)
      : projectSlug;

    if (!prefix) return null;

    return new RegExp(`^https:\\/\\/${prefix}[\\w-]*\\.vercel\\.app$`, "i");
  } catch {
    return null;
  }
};

const isOriginAllowed = (origin, allowedOrigins) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return { allowed: true, matchedVia: "no-origin" };

  if (allowedOrigins.includes(normalizedOrigin)) {
    return { allowed: true, matchedVia: "exact" };
  }

  const previewPattern = getVercelPreviewPattern(allowedOrigins);
  if (previewPattern?.test(normalizedOrigin)) {
    return { allowed: true, matchedVia: "vercel-preview" };
  }

  return { allowed: false, matchedVia: null };
};

const createCorsOriginHandler = (allowedOrigins) => {
  const previewPattern = getVercelPreviewPattern(allowedOrigins);

  return (origin, callback) => {
    const { allowed, matchedVia } = isOriginAllowed(origin, allowedOrigins);
    const normalizedOrigin = normalizeOrigin(origin);

    // #region agent log
    debugLog("corsOrigins.js:createCorsOriginHandler", "CORS origin check", {
      requestOrigin: origin || null,
      normalizedOrigin: normalizedOrigin || null,
      allowedOrigins,
      allowed,
      matchedVia,
      previewPattern: previewPattern?.source || null,
    }, "H3");
    // #endregion

    if (allowed) {
      callback(null, normalizedOrigin);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
};

const logCorsStartup = (allowedOrigins) => {
  const previewPattern = getVercelPreviewPattern(allowedOrigins);

  // #region agent log
  debugLog(
    "corsOrigins.js:logCorsStartup",
    "CORS startup configuration",
    {
      clientUrlRaw: process.env.CLIENT_URL ?? null,
      allowedOrigins,
      previewPattern: previewPattern?.source || null,
      allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS !== "false",
    },
    "H3"
  );
  // #endregion

  console.log("[cors] allowed origins:", allowedOrigins.join(", "));
  if (previewPattern) {
    console.log("[cors] vercel preview pattern:", previewPattern.source);
  }
};

module.exports = {
  getAllowedOrigins,
  getVercelPreviewPattern,
  isOriginAllowed,
  createCorsOriginHandler,
  logCorsStartup,
  normalizeOrigin,
  debugLog,
};
