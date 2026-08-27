import { CheckCircle2, Clock3, MapPin, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import StatusPill from '../components/StatusPill'
import { getTicket, verifyOfficerUpdate } from '../services/api'

export default function TicketDetail() {
  const { id } = useParams(); const [ticket, setTicket] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { getTicket(id).then(value => setTicket(value || null)).finally(() => setLoading(false)) }, [id])
  if (loading) return <main className="ticket-detail-page"><p>Loading ticket...</p></main>
  if (!ticket) return <main className="ticket-detail-page"><Card><h1>Ticket not found</h1><Button to="/dashboard">Back to complaints</Button></Card></main>
  const verify = decision => verifyOfficerUpdate(ticket.id, decision).then(updated => updated && setTicket(updated))
  const stages = ['Filed', 'Assigned', 'In Progress', 'Proof Submitted', 'Awaiting Your Sign-off', 'Resolved']; const current = ticket.status === 'Resolved' ? 5 : ticket.status === 'Pending verification' ? 4 : ticket.status === 'In progress' ? 2 : 1
  return <main className="ticket-detail-page"><header className="ticket-detail-header"><div><p className="eyebrow">{ticket.route.category}</p><h1>{ticket.complaint}</h1><p className="ticket-detail-id">{ticket.id}</p></div><StatusPill status={ticket.status} /></header><section className="journey-line" aria-label="Ticket journey">{stages.map((stage, index) => <article className={`journey-stage journey-stage--${index < current ? 'complete' : index === current ? 'current' : 'future'}`} key={stage}><span className="journey-icon">{index < current ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</span><h2>{stage}</h2><time>{index <= current ? new Date(ticket.timeline[Math.min(index, ticket.timeline.length - 1)].time).toLocaleString('en-IN') : 'Pending'}</time></article>)}</section>{ticket.officerUpdate && <Card className="proof-card"><div className="proof-copy"><p className="eyebrow">Proof submitted</p><h2>Field repair photo</h2><p>{ticket.officerUpdate.note}</p></div><figure className="proof-photo"><img src={ticket.officerUpdate.photoDataUrl} alt="Submitted repair proof" /><figcaption><MapPin size={15} /> {ticket.officerUpdate.location.label} · {new Date(ticket.officerUpdate.capturedAt).toLocaleString('en-IN')}</figcaption></figure>{ticket.status === 'Pending verification' && <div className="proof-actions"><Button variant="success" onClick={() => verify('accepted')}><ThumbsUp size={16} /> Confirm Fixed</Button><Button variant="danger" onClick={() => verify('rejected')}><ThumbsDown size={16} /> Reopen This</Button></div>}{ticket.status !== 'Pending verification' && <p className="ticket-confirmation-message"><ShieldCheck size={16} /> Verification recorded: {ticket.citizenVerification?.decision}</p>}</Card>}<Card className="ticket-history"><h2>Case history</h2>{ticket.timeline.map(event => <div className="history-row" key={`${event.label}-${event.time}`}><span>{event.label}</span><small>{event.detail}</small><time>{new Date(event.time).toLocaleString('en-IN')}</time></div>)}</Card></main>
}
