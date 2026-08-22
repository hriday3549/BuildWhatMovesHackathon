import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates } from '../types'

type Props = { point: Coordinates | null; onPinChange: (latitude: number, longitude: number) => void }

const fallback: L.LatLngExpression = [28.6139, 77.2090]
const pinIcon = L.divIcon({ className: 'location-pin-wrap', html: '<span class="location-pin">●</span>', iconSize: [32, 38], iconAnchor: [16, 34] })

export default function LocationMap({ point, onPinChange }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const updateRef = useRef(onPinChange)
  updateRef.current = onPinChange

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return
    const map = L.map(elementRef.current, { zoomControl: false }).setView(fallback, 13)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    map.on('click', event => updateRef.current(event.latlng.lat, event.latlng.lng))
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null; markerRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !point) return
    const target: L.LatLngExpression = [point.latitude, point.longitude]
    map.flyTo(target, Math.max(map.getZoom(), 17), { duration: 0.55 })
    if (!markerRef.current) {
      markerRef.current = L.marker(target, { icon: pinIcon, draggable: true, autoPan: true }).addTo(map)
      markerRef.current.on('dragend', () => {
        const position = markerRef.current?.getLatLng()
        if (position) updateRef.current(position.lat, position.lng)
      })
    } else markerRef.current.setLatLng(target)
  }, [point?.latitude, point?.longitude])

  return <div ref={elementRef} className="leaflet-map" aria-label="Interactive location map. Click to drop a pin or drag the pin to adjust it." />
}
