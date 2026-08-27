import { Bolt, Droplets, Lightbulb, MapPin, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './Card'
import StatusPill from './StatusPill'

const categoryIcons = {
  Roads: MapPin,
  Water: Droplets,
  Electricity: Lightbulb,
  Sanitation: Trash2,
}

function TicketCardContent({ ticket, actions }) {
  const Icon = categoryIcons[ticket.category] || Bolt
  return (
    <>
      <span className="ticket-category-icon" aria-hidden="true"><Icon size={19} /></span>
      <div className="ticket-card-main">
        <div className="ticket-card-heading">
          <div>
            <p className="ticket-category">{ticket.category}</p>
            <h3>{ticket.title}</h3>
          </div>
          <StatusPill status={ticket.status} />
        </div>
        <div className="ticket-card-meta">
          <span>{ticket.id}</span>
          <span>{ticket.date}</span>
        </div>
      </div>
      {ticket.photoUrl && <img className="ticket-thumbnail" src={ticket.photoUrl} alt="Repair proof" />}
      {actions && <div className="ticket-card-actions">{actions}</div>}
    </>
  )
}

export default function TicketCard({ ticket, muted = false, to, actions }) {
  const classes = `ticket-card ${ticket.status === 'awaiting_signoff' ? 'ticket-card--awaiting' : ''} ${muted ? 'ticket-card--muted' : ''}`.trim()
  const card = (
    <Card ticketStatus={ticket.status} className={classes}>
      <TicketCardContent ticket={ticket} actions={actions} />
    </Card>
  )

  if (!to) return card

  return (
    <Link to={to} className="ticket-link" aria-label={`Open ticket ${ticket.id}: ${ticket.title}`}>
      {card}
    </Link>
  )
}
