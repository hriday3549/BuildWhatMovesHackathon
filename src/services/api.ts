import type { Coordinates, OfficerUpdate, Route, Ticket } from '../types'
const key = 'smart-cpgrams-tickets'
function read(): Ticket[] { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function write(tickets: Ticket[]) { localStorage.setItem(key, JSON.stringify(tickets)) }
export async function createTicket(input: { complaint: string; location: Coordinates; route: Route }): Promise<Ticket> {
  await new Promise(resolve => setTimeout(resolve, 350)); const now = new Date(); const escalation = new Date(now.getTime() + 48 * 60 * 60 * 1000); const due = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  const ticket: Ticket = { id: `SCG-${now.getFullYear()}-${String(Math.floor(100000 + Math.random() * 899999))}`, complaint: input.complaint, location: input.location, route: input.route, status: 'Assigned', createdAt: now.toISOString(), escalationAt: escalation.toISOString(), dueAt: due.toISOString(), timeline: [
    { label: 'Complaint submitted', detail: 'Your report was securely recorded.', time: now.toISOString(), state: 'done' },
    { label: 'Assigned to department', detail: `${input.route.department} · ${input.route.team}`, time: now.toISOString(), state: 'active' },
    { label: 'Department response due', detail: 'Automatic escalation begins if there is no update.', time: escalation.toISOString(), state: 'future' },
    { label: 'Resolution target', detail: 'You will be asked to confirm the outcome.', time: due.toISOString(), state: 'future' }
  ] }; write([ticket, ...read()]); return ticket
}
export async function getTicket(id: string) { await new Promise(resolve => setTimeout(resolve, 160)); return read().find(ticket => ticket.id.toLowerCase() === id.trim().toLowerCase()) }

export async function addOfficerUpdate(id: string, update: Omit<OfficerUpdate, 'createdAt'>): Promise<Ticket | undefined> {
  await new Promise(resolve => setTimeout(resolve, 250))
  const createdAt = new Date().toISOString()
  let saved: Ticket | undefined
  const tickets = read().map(ticket => {
    if (ticket.id !== id) return ticket
    const next: Ticket = {
      ...ticket,
      status: 'Pending verification',
      officerUpdate: { ...update, createdAt },
      timeline: [
        ...ticket.timeline.map(event => event.state === 'active' ? { ...event, state: 'done' as const } : event),
        { label: 'Officer work update submitted', detail: `${update.officerName} attached a geotagged completion photo. Awaiting citizen verification.`, time: createdAt, state: 'active' as const }
      ]
    }
    saved = next
    return next
  })
  write(tickets); return saved
}

export async function verifyOfficerUpdate(id: string, decision: 'accepted' | 'rejected'): Promise<Ticket | undefined> {
  await new Promise(resolve => setTimeout(resolve, 180))
  const createdAt = new Date().toISOString()
  let saved: Ticket | undefined
  const tickets = read().map(ticket => {
    if (ticket.id !== id) return ticket
    const accepted = decision === 'accepted'
    const next: Ticket = {
      ...ticket,
      status: accepted ? 'Resolved' : 'In progress',
      citizenVerification: { decision, createdAt },
      timeline: [
        ...ticket.timeline.map(event => event.state === 'active' ? { ...event, state: 'done' as const } : event),
        { label: accepted ? 'Resolution accepted by citizen' : 'Resolution rejected by citizen', detail: accepted ? 'The complaint has been closed with the citizen’s confirmation.' : 'The complaint has been reopened and returned to the department.', time: createdAt, state: 'active' as const }
      ]
    }
    saved = next
    return next
  })
  write(tickets); return saved
}
