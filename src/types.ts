export type Coordinates = { latitude: number; longitude: number; label: string }
export type Route = { department: string; team: string; category: string; confidence: number; reason: string }
export type TicketStatus = 'Submitted' | 'Assigned' | 'In progress' | 'Escalated' | 'Resolved'
export type Ticket = { id: string; complaint: string; location: Coordinates; route: Route; status: TicketStatus; createdAt: string; dueAt: string; escalationAt: string; timeline: { label: string; detail: string; time: string; state: 'done' | 'active' | 'future' }[] }
