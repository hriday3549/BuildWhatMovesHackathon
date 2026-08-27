const labels = { filed: 'Filed', in_progress: 'In progress', awaiting_signoff: 'Awaiting sign-off', resolved: 'Resolved', reopened: 'Reopened' }

export default function StatusPill({ status }) {
  const key = status?.replace('_', '-') || 'filed'
  return <span className={`status-pill status-pill--${key}`}>{labels[status] || status}</span>
}
