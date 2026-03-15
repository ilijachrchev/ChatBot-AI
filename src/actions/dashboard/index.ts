"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { stripe } from '@/lib/stripe'

export const getUserClients = async () => {
    try {

        const user = await currentUser()
        if (user) {
            const clients = await client.customer.count({
                where: {
                    Domain: {
                        User: {
                            clerkId: user.id,
                        },
                    },
                },
            })
            if (clients) {
                return clients
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserBalance = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const connectedStripe = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    stripeId: true,
                },
            })

            if (connectedStripe) {
                const transactions = await stripe.balance.retrieve({
                    stripeAccount: connectedStripe.stripeId!,
                })

                if (transactions) {
                    const sales = transactions.pending.reduce((total, next) => {
                        return total + next.amount
                    }, 0)
                    return sales / 100
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserPlanInfo = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const plan = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    _count: {
                        select: {
                            domains: true,
                        },
                    },
                    subscription: {
                        select: {
                            plan: true,
                            credits: true,
                        },
                    },
                },
            })
            if (plan) {
                return {
                    plan: plan.subscription?.plan,
                    credits: plan.subscription?.credits,
                    domains: plan._count.domains,
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserTransaction = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const connectedStripe = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    stripeId: true,
                },
            })

            if (connectedStripe) {
                const transactions = await stripe.charges.list({
                    stripeAccount: connectedStripe.stripeId!,
                })
                if (transactions) {
                    return {
                        charges: transactions.data.map(c => ({
                            id: c.id,
                            amount: c.amount,
                            currency: c.currency,
                            status: c.status,
                            created: c.created,
                            last4: c.payment_method_details?.card?.last4 ?? null,
                        }))
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}


export const getUserTotalProductPrices = async () => {
    try {
        const user = await currentUser()
        if (user) {
            const products = await client.product.findMany({
                where: {
                    Domain: {
                        User: {
                            clerkId: user.id,
                        },
                    },
                },
                select: {
                    price: true,
                },
            })

            if (products) {
                const total = products.reduce((total: number, next : { price: number }) => {
                    return total + next.price
                }, 0)

                return total
            }
        }
    } catch (error) {
        console.log(error)
    }
}