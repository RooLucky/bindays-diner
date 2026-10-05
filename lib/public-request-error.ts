export class PublicRequestError extends Error {}

export async function readLimitedBody(request: Request, maxBytes = 64 * 1024) {
  const reader = request.body?.getReader();
  if (!reader) throw new PublicRequestError("A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new PublicRequestError("The submission is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return new Response(body, {
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
  });
}
