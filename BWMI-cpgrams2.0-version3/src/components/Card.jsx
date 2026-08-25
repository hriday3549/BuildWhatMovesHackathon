export default function Card({ children, className = '', ticketStatus, ...props }) {
  const isOpenTicket = ticketStatus && ticketStatus !== 'resolved'
  return (
    <section className={`card ${isOpenTicket ? 'card--open-ticket' : ''} ${className}`.trim()} {...props}>
      <span className="card-tab" aria-hidden="true" />
      {isOpenTicket && <span className="ticket-ribbon" aria-hidden="true" />}
      {children}
    </section>
  )
}
