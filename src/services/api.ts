import type { Coordinates, OfficerUpdate, Route, Ticket } from '../types'
const key = 'smart-cpgrams-tickets'
const demoRoute: Route = { department: 'Public Works Department', team: 'Road Maintenance', category: 'Roads & footpaths', confidence: 91, reason: 'Matched road-maintenance keywords.' }
const demoLocation: Coordinates = { latitude: 28.6139, longitude: 77.2090, label: 'Near Ward 12 Community Hall, Delhi' }
function demoTicket(id: string, complaint: string, status: Ticket['status'], createdAt: string, officerUpdate?: OfficerUpdate): Ticket {
  const timeline = [
    { label: 'Complaint submitted', detail: 'Your report was securely recorded.', time: createdAt, state: 'done' as const },
    { label: 'Assigned to department', detail: `${demoRoute.department} · ${demoRoute.team}`, time: createdAt, state: status === 'Submitted' ? 'future' as const : 'done' as const },
    { label: officerUpdate ? 'Officer work update submitted' : 'Department response due', detail: officerUpdate ? 'A field photo is ready for your verification.' : 'Automatic escalation begins if there is no update.', time: officerUpdate?.createdAt ?? '2026-08-24T09:00:00Z', state: officerUpdate ? 'active' as const : status === 'In progress' ? 'active' as const : 'future' as const },
    { label: status === 'Resolved' ? 'Resolution accepted by citizen' : 'Resolution target', detail: status === 'Resolved' ? 'You confirmed the work at the reported location.' : 'You will be asked to confirm the outcome.', time: status === 'Resolved' ? '2026-08-22T16:00:00Z' : '2026-08-27T00:00:00Z', state: status === 'Resolved' ? 'done' as const : 'future' as const }
  ]
  return { id, complaint, location: demoLocation, route: demoRoute, status, createdAt, escalationAt: '2026-08-25T09:00:00Z', dueAt: '2026-08-27T00:00:00Z', officerUpdate, timeline }
}
const demoTickets: Ticket[] = [
  demoTicket('SCG-2026-004821', 'The pothole outside Ward 12 Community Hall has caused two accidents.', 'Pending verification', '2026-08-20T09:12:00Z', { officerName: 'Ramesh Kumar · Ward Officer', note: 'Road surface repaired and debris cleared. Please verify the site photo.', photoDataUrl: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05c?auto=format&fit=crop&w=900&q=80', location: { ...demoLocation, label: 'Ward 12 Community Hall · 28.613900, 77.209000' }, capturedAt: '2026-08-22T11:28:00Z', originalFileName: 'ward-12-repair.jpg', createdAt: '2026-08-22T11:30:00Z' }),
  demoTicket('SCG-2026-004792', 'A streetlight near the bus stop has not worked for three nights.', 'In progress', '2026-08-19T18:45:00Z'),
  demoTicket('SCG-2026-004731', 'Water is leaking from the public pipeline beside our lane.', 'Submitted', '2026-08-18T07:20:00Z'),
  demoTicket('SCG-2026-004510', 'The footpath outside the school was repaired last month.', 'Resolved', '2026-08-05T10:05:00Z')
]
function read(): Ticket[] { try { const stored = localStorage.getItem(key); const tickets = stored ? JSON.parse(stored) as Ticket[] : []; if (!tickets.length) { write(demoTickets); return demoTickets } return tickets } catch { return demoTickets } }
function write(tickets: Ticket[]) { localStorage.setItem(key, JSON.stringify(tickets)) }
export async function getTickets(): Promise<Ticket[]> { await new Promise(resolve => setTimeout(resolve, 100)); return read() }
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
