import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import api from "../../lib/api";
import {
  attachmentDisplayName,
  isImageAttachment,
} from "../../lib/chatUtils";
import ImageLightbox from "./ImageLightbox";

const AuthenticatedAttachment = ({
  filename,
  isSender,
  fullBleed = false,
  timestamp,
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!filename) return;

    let objectUrl = null;
    let cancelled = false;

    api
      .get(`/api/chat/download/${encodeURIComponent(filename)}`, {
        responseType: "blob",
      })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename]);

  const handleDownload = async (e) => {
    e?.stopPropagation?.();

    const downloadName = attachmentDisplayName(filename);

    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadName;
      a.click();
      return;
    }

    try {
      const res = await api.get(
        `/api/chat/download/${encodeURIComponent(filename)}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    }
  };

  if (error) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        className={`text-sm underline ${isSender ? "text-blue-100" : "text-blue-600"}`}
      >
        📎 {attachmentDisplayName(filename)} (retry download)
      </button>
    );
  }

  if (!blobUrl) {
    return (
      <span
        className={`text-xs opacity-70 ${fullBleed ? "block px-4 py-3" : ""}`}
      >
        Loading attachment…
      </span>
    );
  }

  if (isImageAttachment(filename)) {
    return (
      <>
        <div
          className={`group relative ${fullBleed ? "cursor-pointer" : ""}`}
          onClick={fullBleed ? () => setLightboxOpen(true) : undefined}
          onKeyDown={
            fullBleed
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxOpen(true);
                  }
                }
              : undefined
          }
          role={fullBleed ? "button" : undefined}
          tabIndex={fullBleed ? 0 : undefined}
          aria-label={fullBleed ? "Open image preview" : undefined}
        >
          <img
            src={blobUrl}
            alt={attachmentDisplayName(filename)}
            className={`block max-w-full object-contain ${
              fullBleed
                ? "max-h-72 w-full bg-black/5 dark:bg-black/20"
                : "max-h-48 rounded-lg"
            }`}
          />
          <button
            type="button"
            onClick={handleDownload}
            title={`Download ${attachmentDisplayName(filename)}`}
            aria-label={`Download ${attachmentDisplayName(filename)}`}
            className="absolute bottom-2 right-2 rounded-full bg-black/55 p-1.5 text-white opacity-80 transition hover:bg-black/70 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <Download className="h-4 w-4" />
          </button>
          {fullBleed && timestamp && (
            <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/95">
              {timestamp}
            </span>
          )}
        </div>

        {lightboxOpen && (
          <ImageLightbox
            src={blobUrl}
            filename={filename}
            onClose={() => setLightboxOpen(false)}
            onDownload={handleDownload}
          />
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`text-sm underline ${isSender ? "text-blue-100" : "text-blue-600"}`}
    >
      📎 {attachmentDisplayName(filename)}
    </button>
  );
};

export default AuthenticatedAttachment;
