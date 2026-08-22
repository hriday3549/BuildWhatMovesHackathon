import type { Route } from '../types'
const rules = [
  { terms: ['streetlight', 'light', 'lamp', 'electricity', 'pole'], route: { department: 'Municipal Electrical Division', team: 'Streetlight Maintenance', category: 'Public lighting', confidence: 94, reason: 'Matched public-lighting keywords.' } },
  { terms: ['road', 'pothole', 'footpath', 'sidewalk'], route: { department: 'Public Works Department', team: 'Road Maintenance', category: 'Roads & footpaths', confidence: 91, reason: 'Matched road-maintenance keywords.' } },
  { terms: ['water', 'tap', 'leak', 'drainage', 'sewer'], route: { department: 'Water & Sanitation Department', team: 'Field Operations', category: 'Water & sanitation', confidence: 90, reason: 'Matched water or sanitation keywords.' } },
  { terms: ['garbage', 'waste', 'trash', 'clean', 'sanitation'], route: { department: 'Municipal Sanitation Department', team: 'Ward Sanitation Team', category: 'Solid waste', confidence: 89, reason: 'Matched sanitation keywords.' } }
]
export function routeComplaint(text: string): Route { const match = rules.find(rule => rule.terms.some(term => text.toLowerCase().includes(term))); return match?.route ?? { department: 'Municipal Grievance Cell', team: 'Triage & Referral', category: 'General civic service', confidence: 72, reason: 'No specific rule matched; sent for assisted triage.' } }
