import type { Coordinates, CreateTicketResult, OfficerUpdate, Route, StatusHistoryEntry, Ticket } from '../types'
const key = 'smart-cpgrams-tickets-v2'
const demoRoute: Route = { department: 'Public Works Department', team: 'Road Maintenance', category: 'Roads & footpaths', confidence: 91, reason: 'Matched road-maintenance keywords.' }
const demoLocation: Coordinates = { latitude: 28.6139, longitude: 77.2090, label: 'Near Ward 12 Community Hall, Delhi' }
function demoTicket(id: string, complaint: string, status: Ticket['status'], createdAt: string, officerUpdate?: OfficerUpdate): Ticket {
  const timeline = [
    { label: 'Complaint submitted', detail: 'Your report was securely recorded.', time: createdAt, state: 'done' as const },
    { label: 'Assigned to department', detail: `${demoRoute.department} · ${demoRoute.team}`, time: createdAt, state: status === 'Submitted' ? 'future' as const : 'done' as const },
    { label: officerUpdate ? 'Officer work update submitted' : 'Department response due', detail: officerUpdate ? 'A field photo is ready for your verification.' : 'Automatic escalation begins if there is no update.', time: officerUpdate?.createdAt ?? '2026-08-24T09:00:00Z', state: officerUpdate ? 'active' as const : status === 'In progress' ? 'active' as const : 'future' as const },
    { label: status === 'Resolved' ? 'Resolution accepted by citizen' : 'Resolution target', detail: status === 'Resolved' ? 'You confirmed the work at the reported location.' : 'You will be asked to confirm the outcome.', time: status === 'Resolved' ? '2026-08-22T16:00:00Z' : '2026-08-27T00:00:00Z', state: status === 'Resolved' ? 'done' as const : 'future' as const }
  ]
  return { id, complaint, location: demoLocation, route: demoRoute, status, createdAt, escalationAt: '2026-08-25T09:00:00Z', dueAt: '2026-08-27T00:00:00Z', escalationLevel: 0, currentAuthority: 'Ward Officer · Ward 12', communityCount: status === 'Pending verification' ? 3 : undefined, communityComplaint: status === 'Pending verification', officerUpdate, statusHistory: [{ oldStatus: null, newStatus: status, changedBy: 'system', timestamp: createdAt, reason: 'Seeded demonstration record' }], timeline }
}
const demoTickets: Ticket[] = [
  demoTicket('SCG-2026-004821', 'The pothole outside Ward 12 Community Hall has caused two accidents.', 'Pending verification', '2026-08-23T09:12:00Z', { officerName: 'Ramesh Kumar · Ward Officer', note: 'Road surface repaired and debris cleared. Please verify the site photo.', photoDataUrl: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05c?auto=format&fit=crop&w=900&q=80', location: { ...demoLocation, label: 'Ward 12 Community Hall · 28.613900, 77.209000' }, capturedAt: '2026-08-22T11:28:00Z', originalFileName: 'ward-12-repair.jpg', createdAt: '2026-08-22T11:30:00Z' }),
  demoTicket('SCG-2026-004792', 'A streetlight near the bus stop has not worked for three nights.', 'In progress', '2026-08-19T18:45:00Z'),
  demoTicket('SCG-2026-004731', 'Water is leaking from the public pipeline beside our lane.', 'Submitted', '2026-08-18T07:20:00Z'),
  demoTicket('SCG-2026-004510', 'The footpath outside the school was repaired last month.', 'Resolved', '2026-08-05T10:05:00Z')
]
function read(): Ticket[] { try { const stored = localStorage.getItem(key); const tickets = stored ? JSON.parse(stored) as Ticket[] : []; if (!tickets.length) { write(demoTickets); return demoTickets } return tickets } catch { return demoTickets } }
function write(tickets: Ticket[]) { localStorage.setItem(key, JSON.stringify(tickets)) }
const escalationPath = ['Ward Officer · Ward 12', 'Supervisor · Public Works Department', 'Nodal Officer · Municipal Grievance Cell']
function applySlaEscalation(tickets: Ticket[]) {
  const now = Date.now(); let changed = false
  const updated = tickets.map(ticket => {
    if (ticket.status === 'Resolved' || ticket.status === 'Pending verification' || now < new Date(ticket.escalationAt).getTime()) return ticket
    const level = ticket.escalationLevel ?? 0
    if (level >= escalationPath.length - 1) return ticket
    const nextLevel = level + 1
    const nextAuthority = escalationPath[nextLevel]
    const event: StatusHistoryEntry = { oldStatus: ticket.status, newStatus: 'Escalated', changedBy: 'sla-engine', timestamp: new Date().toISOString(), reason: 'SLA deadline exceeded' }
    changed = true
    return { ...ticket, status: 'Escalated' as const, escalationLevel: nextLevel, currentAuthority: nextAuthority, escalations: [...(ticket.escalations ?? []), { level: nextLevel, from: escalationPath[level], to: nextAuthority, timestamp: event.timestamp, reason: event.reason }], statusHistory: [...(ticket.statusHistory ?? []), event], timeline: [...ticket.timeline, { label: 'Automatically escalated', detail: `SLA exceeded. Assigned to ${nextAuthority}.`, time: event.timestamp, state: 'active' as const }] }
  })
  if (changed) write(updated)
  return updated
}
export async function getTickets(): Promise<Ticket[]> { await new Promise(resolve => setTimeout(resolve, 100)); return applySlaEscalation(read()) }
function distanceMetres(first: Coordinates, second: Coordinates) {
  const earthRadius = 6371000
  const latDelta = (second.latitude - first.latitude) * Math.PI / 180
  const lngDelta = (second.longitude - first.longitude) * Math.PI / 180
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(first.latitude * Math.PI / 180) * Math.cos(second.latitude * Math.PI / 180) * Math.sin(lngDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
export async function createTicket(input: { complaint: string; location: Coordinates; route: Route }): Promise<CreateTicketResult> {
  await new Promise(resolve => setTimeout(resolve, 350)); const now = new Date(); const escalation = new Date(now.getTime() + 48 * 60 * 60 * 1000); const due = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  const id = `SCG-${now.getFullYear()}-${String(Math.floor(100000 + Math.random() * 899999))}`
  const existing = read()
  const parent = existing.find(candidate => !candidate.clusterParentId && candidate.status !== 'Resolved' && candidate.route.category === input.route.category && distanceMetres(candidate.location, input.location) <= 100 && Math.abs(now.getTime() - new Date(candidate.createdAt).getTime()) <= 48 * 60 * 60 * 1000)
  const ticket: Ticket = { id, complaint: input.complaint, location: input.location, route: input.route, status: 'Assigned', createdAt: now.toISOString(), escalationAt: escalation.toISOString(), dueAt: due.toISOString(), escalationLevel: 0, currentAuthority: 'Ward Officer · Ward 12', clusterParentId: parent?.id, statusHistory: [{ oldStatus: null, newStatus: 'Assigned', changedBy: 'system', timestamp: now.toISOString(), reason: 'Complaint classified and routed' }], timeline: [
    { label: 'Complaint submitted', detail: 'Your report was securely recorded.', time: now.toISOString(), state: 'done' },
    { label: parent ? 'Joined a community complaint' : 'Assigned to department', detail: parent ? `Matched with nearby reports under ${parent.id}.` : `${input.route.department} · ${input.route.team}`, time: now.toISOString(), state: 'active' },
    { label: 'Department response due', detail: 'Automatic escalation begins if there is no update.', time: escalation.toISOString(), state: 'future' },
    { label: 'Resolution target', detail: 'You will be asked to confirm the outcome.', time: due.toISOString(), state: 'future' }
  ] }
  if (!parent) { write([ticket, ...existing]); return { ticket } }
  const nearbyCount = (parent.communityCount ?? 1) + 1
  const updatedParent = { ...parent, communityCount: nearbyCount, communityComplaint: true, clusterChildIds: [...(parent.clusterChildIds ?? []), ticket.id], timeline: [...parent.timeline, { label: 'Community complaint updated', detail: `${nearbyCount} nearby reports are now grouped into this parent case.`, time: now.toISOString(), state: 'active' as const }] }
  write([ticket, ...existing.map(candidate => candidate.id === parent.id ? updatedParent : candidate)])
  return { ticket, duplicateMatch: { parentId: parent.id, nearbyCount, parentComplaint: parent.complaint, distanceMetres: Math.round(distanceMetres(parent.location, input.location)) } }
}
export async function getTicket(id: string) { await new Promise(resolve => setTimeout(resolve, 160)); return applySlaEscalation(read()).find(ticket => ticket.id.toLowerCase() === id.trim().toLowerCase()) }
export async function getOfficerTicket(id: string) {
  await new Promise(resolve => setTimeout(resolve, 160))
  const tickets = applySlaEscalation(read())
  const ticket = tickets.find(candidate => candidate.id.toLowerCase() === id.trim().toLowerCase())
  if (!ticket?.clusterParentId) return ticket
  return tickets.find(candidate => candidate.id === ticket.clusterParentId)
}

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
