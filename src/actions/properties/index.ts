'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const onGetDomainProperties = async (domainId: string) => {
  try {
    const properties = await (client as any).property.findMany({
      where: { domainId },
      orderBy: { createdAt: 'desc' },
    })
    return { status: 200, properties }
  } catch (error) {
    console.error(error)
    return { status: 500, properties: [] }
  }
}

export const onCreateProperty = async (
  domainId: string,
  data: {
    title: string
    description?: string | null
    price?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    location?: string | null
    propertyType?: string
    status?: string
    imageUrl?: string | null
  }
) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const property = await (client as any).property.create({
      data: { domainId, ...data },
    })
    return { status: 200, message: 'Property created', property }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Failed to create property' }
  }
}

export const onUpdateProperty = async (
  propertyId: string,
  data: {
    title?: string
    description?: string | null
    price?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    location?: string | null
    propertyType?: string
    status?: string
    imageUrl?: string | null
  }
) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const property = await (client as any).property.update({
      where: { id: propertyId },
      data,
    })
    return { status: 200, message: 'Property updated', property }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Failed to update property' }
  }
}

export const onDeleteProperty = async (propertyId: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    await (client as any).property.delete({ where: { id: propertyId } })
    return { status: 200, message: 'Property deleted' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Failed to delete property' }
  }
}
