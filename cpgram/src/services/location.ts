import type { Coordinates } from '../types'

type NominatimResult = { place_id: number; lat: string; lon: string; display_name: string }

export type AddressResult = Coordinates & { id: string }

/** Public OpenStreetMap geocoding for the prototype. Move this behind your own API/provider before production. */
export async function searchAddress(query: string): Promise<AddressResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.search = new URLSearchParams({ format: 'jsonv2', addressdetails: '1', limit: '5', q: query }).toString()
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Address search is unavailable')
  const results = await response.json() as NominatimResult[]
  return results.map(result => ({ id: String(result.place_id), latitude: Number(result.lat), longitude: Number(result.lon), label: result.display_name }))
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.search = new URLSearchParams({ format: 'jsonv2', lat: String(latitude), lon: String(longitude) }).toString()
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Address lookup is unavailable')
  const result = await response.json() as { display_name?: string }
  return result.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}
