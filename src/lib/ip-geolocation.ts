import { headers } from 'next/headers'

export interface GeoLocation {
  ipAddress: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
}

export async function getGeoLocation(): Promise<GeoLocation> {
  const headersList = await headers()
  
  const ipAddress = 
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    '0.0.0.0'
  
  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,city`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error('Geolocation API failed')
    }
    
    const data = await response.json()
    
    if (data.status === 'fail') {
      console.warn('Geolocation failed:', data.message)
      return { ipAddress }
    }
    
    return {
      ipAddress,
      city: data.city,
      region: data.region,
      country: data.country,
      countryCode: data.countryCode,
    }
  } catch (error) {
    console.error('Error fetching geolocation:', error)
    return { ipAddress }
  }
}

export function calculateDistance(
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number }
): number {
  const R = 6371 
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLon = toRad(coord2.lon - coord1.lon)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}