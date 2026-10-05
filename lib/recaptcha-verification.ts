// Kept independent of server configuration so rejection paths can be tested offline.
export async function verifyRecaptchaToken(
  token: string | null,
  config: { secret?: string; hostnames: string[] },
  verifyFetch: typeof fetch = fetch,
): Promise<boolean> {
  if (
    !config.secret ||
    !config.hostnames.length ||
    !token ||
    token.length > 4096
  )
    return false;
  try {
    const response = await verifyFetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: config.secret, response: token }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return false;
    const result = await response.json();
    return (
      result.success === true &&
      typeof result.hostname === "string" &&
      config.hostnames.includes(result.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
