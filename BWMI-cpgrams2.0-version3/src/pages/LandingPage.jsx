import { MapPin, MessageCircleMore, Mic, Stamp } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { landingStats } from '../mockData'

const steps = [
  {
    title: 'Tell us',
    description: 'Describe the issue by voice or text, and add a photo if you can.',
    icon: <><Mic size={22} /><MessageCircleMore size={15} /></>,
  },
  {
    title: 'We route it',
    description: 'Your report goes straight to the right local ward officer.',
    icon: <MapPin size={24} />,
  },
  {
    title: "You confirm it's fixed",
    description: 'See the proof, then approve the fix or reopen the complaint.',
    icon: <Stamp size={24} />,
  },
]

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="hero-card" aria-labelledby="hero-heading">
        <div className="hero-circle hero-circle--large" aria-hidden="true" />
        <div className="hero-circle hero-circle--small" aria-hidden="true" />
        <div className="hero-content">
          <span className="hero-badge">Nivaran · CPGRAMS 2.0</span>
          <h1 id="hero-heading">Report Public Service Complaints.</h1>
          <p>Tell us what needs fixing. We will send it to the right local authority and keep you involved until it is resolved.</p>
          <div className="hero-actions">
            <Button variant="success" to="/login?role=citizen">File a Grievance</Button>
            <Button variant="secondary" className="button--hero-outline" to="/login?role=citizen">Track a Grievance</Button>
          </div>
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-it-works-heading">
        <div className="section-intro">
          <p className="eyebrow">A clear path to resolution</p>
          <h2 id="how-it-works-heading">How it works</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <Card className="how-it-works-card" key={step.title}>
              <span className="step-badge" aria-label={`Step ${index + 1}`}>{index + 1}</span>
              <span className="feature-icon" aria-hidden="true">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="why-nivaran" aria-labelledby="why-nivaran-heading">
        <h2 id="why-nivaran-heading">Why Nivaran</h2>
        <p>The evidence-based closure loop is a root-cause fix, not a UI polish. It directly answers the single biggest reason citizens distrust CPGRAMS today: "Resolved" being a claim instead of a fact. Nobody else in the room is likely to have built a system where trust is manufactured through an actual verification step, with a felt moment (the ribbon-cut/stamp) that makes that verification visible and satisfying.</p>
      </section>

      <section className="stats-strip" aria-label="Nivaran service statistics">
        {landingStats.map((stat) => (
          <div className="stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>
    </main>
  )
}
