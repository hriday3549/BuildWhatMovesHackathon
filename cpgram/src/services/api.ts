import type { Coordinates, Route, Ticket } from '../types'
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
