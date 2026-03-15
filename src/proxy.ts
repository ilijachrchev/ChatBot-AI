import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server'

const isPublic = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/portal(.*)",
  "/images(.*)",
  "/chatbot(.*)",
  "/api/widget(.*)",
  "/api/mobile(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }

  const { userId } = await auth()
  
  if (
    userId && 
    req.nextUrl.pathname === '/dashboard' && 
    req.nextUrl.searchParams.has('__clerk_status')
  ) {
    try {
      const { onOAuthLogin } = await import('@/actions/auth')
      const { currentUser } = await import('@clerk/nextjs/server')
      const user = await currentUser()
      
      if (user) {
        const email = user.emailAddresses[0]?.emailAddress || ''
        const result = await onOAuthLogin(user.id, email)

        if (result.requireOtp && result.userId) {
          const { signOtpToken } = await import('@/lib/otp-token')
          const token = await signOtpToken({
            userId: result.userId,
            email: result.email ?? '',
            keepMeLoggedIn: true,
          })
          const otpUrl = new URL('/auth/verify-login', req.url)
          otpUrl.searchParams.set('token', encodeURIComponent(token))
          otpUrl.searchParams.set('email', encodeURIComponent(result.email ?? ''))
          return NextResponse.redirect(otpUrl)
        }
      }
    } catch (error) {
      console.error('OAuth security check error:', error)
    }
  }

  return NextResponse.next()
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/(api|trpc)(.*)",
  ],
};