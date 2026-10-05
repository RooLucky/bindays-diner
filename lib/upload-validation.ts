export function validateUploadSignature(
  body: Buffer,
  contentType: string,
  allowPdf = false,
) {
  const valid =
    contentType === "image/jpeg"
      ? body.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
      : contentType === "image/png"
        ? body
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : contentType === "image/webp"
          ? body.toString("ascii", 0, 4) === "RIFF" &&
            body.toString("ascii", 8, 12) === "WEBP"
          : allowPdf && contentType === "application/pdf"
            ? body.toString("ascii", 0, 5) === "%PDF-"
            : false;
  if (!valid)
    throw new Error(
      allowPdf
        ? "Upload a valid JPEG, PNG, WebP, or PDF file."
        : "Upload a valid JPEG, PNG, or WebP image.",
    );
}
