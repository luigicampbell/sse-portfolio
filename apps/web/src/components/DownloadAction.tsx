import { useState } from "react";

import { downloadFile } from "../lib/download.ts";

import { Loading } from "./Loading.tsx";
import "./DownloadAction.css";

interface DownloadActionProps {
  href: string;
  fileName: string;
  label: string;
  className: string;
}

type DownloadState =
  | "idle"
  | "loading"
  | "error";

export function DownloadAction({
  href,
  fileName,
  label,
  className,
}: DownloadActionProps) {
  const [
    state,
    setState,
  ] = useState<DownloadState>(
    "idle",
  );

  async function handleDownload(): Promise<void> {
    if (
      state === "loading"
    ) {
      return;
    }

    setState(
      "loading",
    );

    try {
      await downloadFile(
        href,
        fileName,
      );

      setState(
        "idle",
      );
    } catch {
      setState(
        "error",
      );
    }
  }

  return (
    <button
      className={className}
      type="button"
      disabled={state === "loading"}
      onClick={handleDownload}
      aria-busy={state === "loading"}
    >
      <span
        className={state === "loading"
          ? "download-action__label download-action__label--hidden"
          : "download-action__label"}
      >
        {state === "error" ? "Try again later..." : label}
      </span>

      {state === "loading" && (
        <span className="download-action__loading">
          <Loading
            label="Preparing Resume"
            variant="control"
          />
        </span>
      )}
    </button>
  );
}
