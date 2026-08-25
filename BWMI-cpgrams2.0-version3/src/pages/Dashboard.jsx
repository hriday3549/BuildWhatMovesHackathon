import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import StatusPill from '../components/StatusPill'
import { getTickets } from '../services/api'

export default function Dashboard() {
  const [tickets, setTickets] = useState([])
  useEffect(() => { getTickets().then(setTickets).catch(() => setTickets([])) }, [])
  return <main className="dashboard-page"><header className="dashboard-header"><div><p className="eyebrow">Your grievances</p><h1>Welcome back, Priya</h1></div><Button variant="success" to="/new-complaint">+ New complaint</Button></header>{tickets.length ? <div className="dashboard-sections">{[['Awaiting your sign-off', tickets.filter(ticket => ticket.status === 'Pending verification')], ['In progress', tickets.filter(ticket => ['In progress', 'Assigned', 'Escalated'].includes(ticket.status))], ['Resolved', tickets.filter(ticket => ticket.status === 'Resolved')]].map(([title, list]) => list.length ? <section className="ticket-section" key={title}><h2>{title}</h2><div className="ticket-list">{list.map(ticket => <a className="ticket-link" href={`/ticket/${ticket.id}`} key={ticket.id}><Card className={`ticket-card ${ticket.status === 'Resolved' ? 'ticket-card--muted' : ''}`}><span className="ticket-category-icon">●</span><div className="ticket-card-main"><div className="ticket-card-heading"><div><p className="ticket-category">{ticket.route.category}</p><h3>{ticket.complaint}</h3></div><StatusPill status={ticket.status} /></div><div className="ticket-card-meta"><span>{ticket.id}</span><span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span></div></div></Card></a>)}</div></section> : null)}</div> : <Card className="dashboard-empty-state"><p className="eyebrow">Ready when you are</p><h2>Something needs fixing?</h2><p>File your first complaint and we will help route it to the right local authority.</p><Button variant="success" to="/new-complaint">File a complaint</Button></Card>}</main>
}
