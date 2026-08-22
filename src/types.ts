export type Coordinates = { latitude: number; longitude: number; label: string }
export type Route = { department: string; team: string; category: string; confidence: number; reason: string }
export type TicketStatus = 'Submitted' | 'Assigned' | 'In progress' | 'Pending verification' | 'Escalated' | 'Resolved'
export type OfficerUpdate = { note: string; photoDataUrl: string; location: Coordinates; capturedAt: string; originalFileName: string; createdAt: string; officerName: string }
export type CitizenVerification = { decision: 'accepted' | 'rejected'; comment?: string; createdAt: string }
export type Ticket = { id: string; complaint: string; location: Coordinates; route: Route; status: TicketStatus; createdAt: string; dueAt: string; escalationAt: string; officerUpdate?: OfficerUpdate; citizenVerification?: CitizenVerification; timeline: { label: string; detail: string; time: string; state: 'done' | 'active' | 'future' }[] }
