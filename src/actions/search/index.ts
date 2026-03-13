'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

const ALL_PAGES = [
  { title: 'Dashboard', path: '/dashboard', description: 'Overview of your metrics' },
  { title: 'Conversations', path: '/conversations', description: 'Customer chat conversations' },
  { title: 'Leads', path: '/leads', description: 'Manage your leads' },
  { title: 'Feedback', path: '/feedback', description: 'Customer feedback' },
  { title: 'Playground', path: '/playground', description: 'Test your chatbot' },
  { title: 'Integrations', path: '/integrations', description: 'Connect external services' },
  { title: 'Email Marketing', path: '/email-marketing', description: 'Email campaigns' },
  { title: 'Getting Started', path: '/getting-started', description: 'Setup checklist' },
  { title: 'Knowledge Base', path: '/knowledge-base', description: 'Upload docs and train your bot' },
  { title: 'Profile', path: '/account', description: 'Your profile settings' },
  { title: 'Security', path: '/account/security', description: 'Password and security settings' },
  { title: 'Billing', path: '/billing', description: 'Subscription and payment methods' },
  { title: 'Notifications', path: '/account/notifications', description: 'Notification preferences' },
  { title: 'Preferences', path: '/account/preferences', description: 'Language, timezone, appearance' },
]

export const globalSearch = async (query: string) => {
  const q = query.toLowerCase()

  const pages = ALL_PAGES.filter(
    (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  )

  const user = await currentUser()
  if (!user || query.length < 2) {
    return { pages, domains: [], conversations: [], leads: [], files: [] }
  }

  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  })
  if (!dbUser) return { pages, domains: [], conversations: [], leads: [], files: [] }

  const [domains, conversations, leads, files] = await Promise.all([
    client.domain.findMany({
      where: {
        userId: dbUser.id,
        name: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, name: true, icon: true },
      take: 3,
    }),
    client.chatRoom.findMany({
      where: {
        Domain: { userId: dbUser.id },
        Customer: { email: { contains: query, mode: 'insensitive' } },
      },
      select: {
        id: true,
        createdAt: true,
        Customer: { select: { email: true } },
        Domain: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    client.customer.findMany({
      where: {
        Domain: { userId: dbUser.id },
        email: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        email: true,
        domainId: true,
        Domain: { select: { name: true } },
      },
      take: 5,
    }),
    client.knowledgeBaseFile.findMany({
      where: {
        userId: dbUser.id,
        filename: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        filename: true,
        fileType: true,
        domainId: true,
        Domain: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  return { pages, domains, conversations, leads, files }
}
