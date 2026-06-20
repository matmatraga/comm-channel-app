const normalizeOrigin = (origin) =>
  origin ? origin.trim().replace(/\/+$/, "") : origin;

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
  if (!normalizedOrigin) return true;

  if (allowedOrigins.includes(normalizedOrigin)) return true;

  const previewPattern = getVercelPreviewPattern(allowedOrigins);
  return previewPattern?.test(normalizedOrigin) ?? false;
};

const createCorsOriginHandler = (allowedOrigins) => (origin, callback) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (isOriginAllowed(origin, allowedOrigins)) {
    callback(null, normalizedOrigin);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

const logCorsStartup = (allowedOrigins) => {
  const previewPattern = getVercelPreviewPattern(allowedOrigins);
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
};
