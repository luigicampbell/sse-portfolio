export async function getDownloadBlob(
  href: string,
): Promise<Blob> {
  const response = await fetch(
    href,
    {
      headers: {
        accept: "application/pdf",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Download request failed with status ${response.status}.`,
    );
  }

  return await response.blob();
}

export async function downloadFile(
  href: string,
  fileName: string,
): Promise<void> {
  const blob = await getDownloadBlob(
    href,
  );

  const objectUrl = URL.createObjectURL(
    blob,
  );

  try {
    const anchor = document.createElement(
      "a",
    );

    anchor.href = objectUrl;

    anchor.download = fileName;

    anchor.click();
  } finally {
    URL.revokeObjectURL(
      objectUrl,
    );
  }
}
