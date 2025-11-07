import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function ensureCurrentUser(domain: string) {
    const user = await currentUser();

    if (!user) {
        throw new Error("User is not authenticated");
    }

    const userDomains = await client.user.upsert({
        where: { clerkId: user.id },
        create: {
            clerkId: user.id,
            fullname: user.firstName || "User",
            type: "OWNER",
        },
        update: {
            fullname: user.firstName || "User",
        },
        select: {
            id: true,
            clerkId: true,
            fullname: true,
    },
    });
    return userDomains;
}

