import { useState } from "react";

import { downloadFile } from "./lib/download.ts";

import { Loading } from "./components/Loading.tsx";

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
      {state === "loading"
        ? <Loading label="Preparing résumé" />
        : state === "error"
        ? "Try résumé again"
        : label}
    </button>
  );
}
