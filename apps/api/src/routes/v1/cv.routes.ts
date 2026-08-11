import type { Router } from "@oak/oak/router";

import type { CvService } from "../../services/cv.service.ts";

export function registerCvRoutes(
  router: Router,
  service: CvService,
): void {
  router.get(
    "/api/v1/cv",
    async (context) => {
      const document = await service.generate();

      /*
       * Copy into a standard ArrayBuffer-backed Uint8Array.
       * This preserves the workaround we already needed for
       * ArrayBufferLike / BodyInit typing around generated PDFs.
       */
      const body = new Uint8Array(
        document.bytes,
      );

      context.response.status = 200;

      context.response.headers.set(
        "content-type",
        document.contentType,
      );

      context.response.headers.set(
        "content-disposition",
        `attachment; filename="${escapeFileName(document.fileName)}"`,
      );

      context.response.headers.set(
        "content-length",
        String(document.bytes.byteLength),
      );

      context.response.headers.set(
        "cache-control",
        "private, no-cache",
      );

      context.response.body = body;
    },
  );
}

function escapeFileName(
  fileName: string,
): string {
  return fileName
    .replaceAll("\\", "_")
    .replaceAll('"', "'");
}
