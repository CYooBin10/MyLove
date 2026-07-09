import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: string;
  coupleId: string;
  sessionVersion: number;
};

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("JWT_SECRET must be at least 24 characters.");
  }
  return encoder.encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.userId || !payload.coupleId || typeof payload.sessionVersion !== "number") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
