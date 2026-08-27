import { Check } from 'lucide-react'

export default function Stepper({ steps = [], currentStep = 1 }) {
  return <ol className="stepper" aria-label="Progress">
    {steps.map((step, index) => {
      const number = index + 1
      const state = number < currentStep ? 'complete' : number === currentStep ? 'active' : ''
      return <li className={`stepper-step stepper-step--${state}`} key={step}><span className="stepper-number">{state === 'complete' ? <Check size={16} strokeWidth={3} aria-label="Complete" /> : number}</span><span>{step}</span></li>
    })}
  </ol>
}
