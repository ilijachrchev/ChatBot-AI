import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",          
  "/auth(.*)",   
  "/portal(.*)",
  "/images(.*)",
  "/chatbot(.*)",
  "/api/widget(.*)",  
  "/api/mobile(.*)",  
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/(api|trpc)(.*)",
  ],
};
