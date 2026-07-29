import type { CvService } from "../services/cv.service.ts";

export async function handleCvRoute(
  request: Request,
  service: CvService,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname !== "/api/cv") {
    return null;
  }

  if (request.method !== "GET") {
    return new Response(null, {
      status: 405,
      headers: {
        allow: "GET",
      },
    });
  }

  const document = await service.generate();

  const body = new Uint8Array(
    document.bytes,
  ).buffer;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": document.contentType,
      "content-disposition": `attachment; filename="${
        escapeFileName(document.fileName)
      }"`,
      "content-length": String(document.bytes.byteLength),
      "cache-control": "private, no-cache",
      "x-content-type-options": "nosniff",
    },
  });
}

function escapeFileName(
  fileName: string,
): string {
  return fileName
    .replaceAll("\\", "_")
    .replaceAll('"', "'");
}
