import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function LocationMap({ point, onPinChange }) {
  const element = useRef(null)
  const callback = useRef(onPinChange)
  callback.current = onPinChange
  useEffect(() => {
    if (!element.current) return undefined
    const map = L.map(element.current).setView([point.latitude, point.longitude], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
    const marker = L.marker([point.latitude, point.longitude], { draggable: true }).addTo(map)
    const update = event => { const { lat, lng } = event.target.getLatLng(); callback.current(lat, lng) }
    marker.on('dragend', update)
    map.on('click', event => callback.current(event.latlng.lat, event.latlng.lng))
    return () => map.remove()
  }, [])
  useEffect(() => { if (element.current) element.current.__point = point }, [point])
  return <div ref={element} className="map-placeholder leaflet-map" role="img" aria-label="Interactive location map" />
}
