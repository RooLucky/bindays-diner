// Keep every public form's error path readable, including proxy-generated HTML errors.
export async function submitVerifiedForm(
  input: string,
  init: RequestInit,
  token: string,
  send: typeof fetch = fetch,
) {
  if (!token)
    return Response.json(
      {
        ok: false,
        error: "Complete the reCAPTCHA verification before submitting.",
      },
      { status: 403 },
    );
  try {
    const headers = new Headers(init.headers);
    headers.set("x-recaptcha-token", token);
    const response = await send(input, { ...init, headers });
    try {
      const data = await response.json();
      if (!data || typeof data !== "object" || Array.isArray(data))
        throw new Error("Invalid response");
      return Response.json(data, {
        status: response.status,
        headers: { "Retry-After": response.headers.get("Retry-After") ?? "" },
      });
    } catch {
      return Response.json(
        {
          ok: false,
          error:
            response.status === 413
              ? "The upload is too large for this server. Please use smaller files."
              : "The server could not complete your request. Please try again later.",
        },
        { status: response.ok ? 502 : response.status },
      );
    }
  } catch {
    return Response.json(
      {
        ok: false,
        error:
          "Unable to connect. Your form details have been kept; please try again.",
      },
      { status: 503 },
    );
  }
}
