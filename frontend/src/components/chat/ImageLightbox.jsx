import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { attachmentDisplayName } from "../../lib/chatUtils";

const ImageLightbox = ({ src, filename, onClose, onDownload }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const displayName = attachmentDisplayName(filename);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="truncate text-sm font-medium">{displayName}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            title={`Download ${displayName}`}
            aria-label={`Download ${displayName}`}
            className="rounded-full p-2 hover:bg-white/10 transition"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="rounded-full p-2 hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        className="flex flex-1 items-center justify-center p-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={displayName}
          className="max-h-full max-w-full object-contain rounded-lg"
        />
      </div>
    </div>,
    document.body
  );
};

export default ImageLightbox;
