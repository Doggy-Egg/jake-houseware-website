const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

async function signPayloadEdge(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bufferToHex(signature);
}

export async function verifySessionTokenEdge(
  token: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !payload.startsWith("admin:")) return false;

  const expected = await signPayloadEdge(payload, secret);
  if (!timingSafeEqual(signature, expected)) return false;

  const timestamp = Number(payload.split(":")[1]);
  if (Number.isNaN(timestamp)) return false;

  const ageMs = Date.now() - timestamp;
  return ageMs >= 0 && ageMs <= SESSION_MAX_AGE_SECONDS * 1000;
}
