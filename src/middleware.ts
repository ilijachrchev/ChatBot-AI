// import { authMiddleware } from '@clerk/nextjs'

// export default authMiddleware({
//   publicRoutes: ['/', '/auth(.*)', '/portal(.*)', '/images(.*)'],
//   ignoredRoutes: ['/chatbot'],
// })

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next).*)',
//     '/',
//     '/(api|trpc)(.*)',
//   ],
// }

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher(['/', '/auth(.*)', '/portal(.*)', '/images(.*)']);
const isIgnored = createRouteMatcher(['/chatbot']);

export default clerkMiddleware(async (auth, req) => {
    if (isIgnored(req)) return;
    if (isPublic(req)) {
        await auth.protect()
    }
});

export const config = {
    matcher: [
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/',
        '/(api|trpc)(.*)',
    ],
}

