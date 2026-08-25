import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Ticket } from '../types'

type Props = { tickets: Ticket[] }

export default function Insights({ tickets }: Props) {
  const mapElement = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!mapElement.current) return
    const map = L.map(mapElement.current, { zoomControl: false }).setView([28.6139, 77.2090], 12)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
    const grouped = new Map<string, { ticket: Ticket; count: number }>()
    tickets.forEach(ticket => {
      const key = `${ticket.location.latitude.toFixed(3)}:${ticket.location.longitude.toFixed(3)}`
      const current = grouped.get(key)
      grouped.set(key, current ? { ...current, count: current.count + (ticket.communityCount ?? 1) } : { ticket, count: ticket.communityCount ?? 1 })
    })
    grouped.forEach(({ ticket, count }) => {
      const radius = Math.min(34, 10 + count * 5)
      L.circle([ticket.location.latitude, ticket.location.longitude], { radius: radius * 7, color: '#b4463c', fillColor: '#b4463c', fillOpacity: Math.min(.48, .2 + count * .05), weight: 1 }).bindTooltip(`${count} nearby report${count === 1 ? '' : 's'} · ${ticket.route.category}`).addTo(map)
    })
    return () => { map.remove() }
  }, [tickets])

  const total = tickets.length
  const resolved = tickets.filter(ticket => ticket.status === 'Resolved').length
  const escalated = tickets.filter(ticket => ticket.status === 'Escalated').length
  const community = tickets.filter(ticket => ticket.communityComplaint).reduce((sum, ticket) => sum + (ticket.communityCount ?? 1), 0)
  const categories = [...new Set(tickets.map(ticket => ticket.route.category))].map(category => ({ category, count: tickets.filter(ticket => ticket.route.category === category).length })).sort((a, b) => b.count - a.count)
  const peak = Math.max(1, ...categories.map(item => item.count))

  return <section className="shell insights dashboard-page"><div className="insights-heading"><div><p className="eyebrow">PUBLIC SERVICE SIGNALS</p><h1>See what your community needs.</h1><p className="lead">Complaint density and outcomes are shown in aggregate. Personal details and exact citizen addresses are never exposed.</p></div><span className="privacy-pill">ANONYMIZED VIEW</span></div><div className="metric-grid"><Metric label="Reports in view" value={String(total)}/><Metric label="Resolved" value={String(resolved)}/><Metric label="Escalated" value={String(escalated)}/><Metric label="Community reports" value={String(community)}/></div><div className="insights-grid"><section className="card heatmap-card"><div className="insights-card-head"><div><p className="eyebrow">COMMUNITY HEATMAP</p><h2>Where issues gather</h2></div><span>Grouped to 100m zones</span></div><div ref={mapElement} className="insights-map"/></section><section className="card category-card"><p className="eyebrow">ANALYTICS</p><h2>Issue mix</h2><div className="category-bars">{categories.map(item => <div className="category-row" key={item.category}><div><span>{item.category}</span><b>{item.count}</b></div><i><em style={{ width: `${item.count / peak * 100}%` }}/></i></div>)}</div><p className="insights-note">Counts are based on prototype records and refresh when a complaint is filed.</p></section></div></section>
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="metric card"><span>{label}</span><strong>{value}</strong></div> }
