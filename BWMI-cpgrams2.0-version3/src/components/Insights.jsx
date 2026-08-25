import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Card from './Card'

export default function Insights({ tickets }) {
  const mapElement = useRef(null)
  useEffect(() => {
    if (!mapElement.current) return undefined
    const map = L.map(mapElement.current).setView([28.6139, 77.2090], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
    const grouped = new Map()
    tickets.forEach(ticket => { const key = `${ticket.location.latitude.toFixed(3)}:${ticket.location.longitude.toFixed(3)}`; const current = grouped.get(key); grouped.set(key, current ? { ...current, count: current.count + (ticket.communityCount || 1) } : { ticket, count: ticket.communityCount || 1 }) })
    grouped.forEach(({ ticket, count }) => L.circle([ticket.location.latitude, ticket.location.longitude], { radius: Math.min(238, (10 + count * 5) * 7), color: '#B4463C', fillColor: '#B4463C', fillOpacity: Math.min(.48, .2 + count * .05), weight: 1 }).bindTooltip(`${count} nearby report${count === 1 ? '' : 's'} · ${ticket.route.category}`).addTo(map))
    return () => map.remove()
  }, [tickets])
  const categories = [...new Set(tickets.map(ticket => ticket.route.category))].map(category => ({ category, count: tickets.filter(ticket => ticket.route.category === category).length })).sort((a, b) => b.count - a.count)
  const peak = Math.max(1, ...categories.map(item => item.count))
  return <main className="insights-page"><header className="insights-heading"><div><p className="eyebrow">PUBLIC SERVICE SIGNALS</p><h1>See what your community needs.</h1><p>Complaint density and outcomes are shown in aggregate. Personal details and exact citizen addresses are never exposed.</p></div><span className="privacy-pill">ANONYMIZED VIEW</span></header><div className="metric-grid">{[['Reports in view', tickets.length], ['Resolved', tickets.filter(ticket => ticket.status === 'Resolved').length], ['Escalated', tickets.filter(ticket => ticket.status === 'Escalated').length], ['Community reports', tickets.filter(ticket => ticket.communityComplaint).reduce((sum, ticket) => sum + (ticket.communityCount || 1), 0)]].map(([label, value]) => <Card className="metric" key={label}><span>{label}</span><strong>{value}</strong></Card>)}</div><div className="insights-grid"><Card className="heatmap-card"><div className="insights-card-head"><div><p className="eyebrow">COMMUNITY HEATMAP</p><h2>Where issues gather</h2></div><span>Grouped to 100m zones</span></div><div ref={mapElement} className="insights-map" /></Card><Card className="category-card"><p className="eyebrow">ANALYTICS</p><h2>Issue mix</h2><div className="category-bars">{categories.map(item => <div className="category-row" key={item.category}><div><span>{item.category}</span><b>{item.count}</b></div><i><em style={{ width: `${item.count / peak * 100}%` }} /></i></div>)}</div><p className="insights-note">Counts refresh when a complaint is filed.</p></Card></div></main>
}
