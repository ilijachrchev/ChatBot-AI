import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.OTP_TOKEN_SECRET!)

export interface OtpTokenPayload {
  userId: string
  email: string
  sessionId?: string | null
  keepMeLoggedIn?: boolean
}

export async function signOtpToken(
  payload: OtpTokenPayload
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10m')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyOtpToken(
  token: string
): Promise<OtpTokenPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as OtpTokenPayload
}
