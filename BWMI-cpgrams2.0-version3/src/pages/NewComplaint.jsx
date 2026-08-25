import { Camera, LocateFixed, MapPin, Mic, Navigation, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import Stepper from '../components/Stepper'
import LocationMap from '../components/LocationMap'
import { createTicket } from '../services/api'
import { reverseGeocode, searchAddress } from '../services/location'
import { routeComplaint } from '../services/routing'

const steps = ['Category', 'Details', 'Location', 'Review']
const categories = ['Roads', 'Lighting', 'Water', 'Sanitation', 'Other']
const guided = { Roads: ['A pothole is causing accidents.', 'The road is flooded.', 'A footpath is blocked.'], Lighting: ['A streetlight is not working.', 'A public pole is damaged.'], Water: ['A public pipeline is leaking.', 'A drain is overflowing.'], Sanitation: ['Garbage has not been collected.', 'There is a public waste problem.'], Other: ['A public facility needs attention.', 'There is a public safety concern.'] }
const initialPoint = { latitude: 28.6139, longitude: 77.209, label: 'Click the map to drop an issue pin' }

export default function NewComplaint() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [complaint, setComplaint] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const [point, setPoint] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [path, setPath] = useState('current')
  const [geoStatus, setGeoStatus] = useState('requesting')
  const [message, setMessage] = useState('We are requesting permission to find your location. You can also search for a different place.')
  const [query, setQuery] = useState('')
  const [manualLabel, setManualLabel] = useState('')
  const [manualLatitude, setManualLatitude] = useState('')
  const [manualLongitude, setManualLongitude] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const route = complaint.trim().length > 8 ? routeComplaint(complaint) : null

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('unsupported'); setMessage('This browser cannot share a location. Search for an address or place a pin instead.'); return }
    navigator.geolocation.getCurrentPosition(position => { setGeoStatus('ready'); setPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'Current location' }); setMessage('Current location found. Adjust the pin, then confirm it.') }, () => { setGeoStatus('denied'); setMessage('Location permission was not available. Search for the location or drop a pin directly on the map.') })
  }, [])
  useEffect(() => () => recognitionRef.current?.stop(), [])

  function setPin(latitude, longitude) { const next = { latitude, longitude, label: `Pinned location · ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }; setPoint(next); setConfirmed(null); reverseGeocode(latitude, longitude).then(label => setPoint(current => current && current.latitude === latitude ? { ...current, label } : current)).catch(() => {}) }
  function applyManualLocation() { const latitude = Number(manualLatitude); const longitude = Number(manualLongitude); if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) { setMessage('Enter a valid latitude between -90 and 90 and longitude between -180 and 180.'); return }; setPoint({ latitude, longitude, label: manualLabel.trim() || 'Manually entered location' }); setConfirmed(null); setMessage('Manual location added. Confirm the pin before continuing.') }
  async function findAddress() { if (query.trim().length < 3) return; setSearching(true); try { setResults(await searchAddress(query.trim())) } catch { setMessage('Address search is temporarily unavailable. You can still click or drag the map pin.') } finally { setSearching(false) } }
  function speak() { if (listening) { recognitionRef.current?.stop(); return }; const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) { setMessage('Voice input is not supported in this browser. You can type your answer instead.'); return }; const recognition = new Recognition(); recognitionRef.current = recognition; recognition.lang = 'en-IN'; recognition.interimResults = true; recognition.continuous = false; recognition.maxAlternatives = 1; setListening(true); setMessage('Listening... speak naturally, then pause to add your words.'); recognition.onresult = event => { const finalized = Array.from(event.results).filter(result => result.isFinal).map(result => result[0].transcript.trim()).filter(Boolean).join(' '); if (finalized) setComplaint(current => `${current}${current ? ' ' : ''}${finalized}`) }; recognition.onerror = event => { setListening(false); recognitionRef.current = null; setMessage(event.error === 'not-allowed' ? 'Microphone permission was denied. Allow microphone access or type your answer instead.' : 'Voice input could not be started. You can type your answer instead.') }; recognition.onend = () => { setListening(false); recognitionRef.current = null; setMessage('Voice input finished. Review the text before continuing.') }; try { recognition.start() } catch { setListening(false); recognitionRef.current = null; setMessage('Voice input is already starting. Try again in a moment.') } }
  async function submit() { if (!route || !confirmed) return; setSubmitting(true); const result = await createTicket({ complaint: complaint.trim(), location: confirmed, route }); setSubmitting(false); window.location.href = `/ticket/${result.ticket.id}` }

  return <main className="complaint-page">
    <header className="complaint-header"><p className="eyebrow"><Sparkles size={15} /> New complaint</p><h1>Tell us what needs fixing.</h1><p>We will guide your report to the right local authority and keep you involved until it is resolved.</p></header>
    <Stepper steps={steps} currentStep={step} />
    {step === 1 && <section className="complaint-step"><h2>Choose a category</h2><p>Pick the option that best describes the issue.</p><div className="category-grid">{categories.map(item => <button className="category-tile" type="button" key={item} onClick={() => { setCategory(item); setStep(2) }}><span className="category-tile-icon"><MapPin size={26} /></span><span>{item}</span></button>)}</div></section>}
    {step === 2 && <section className="complaint-step complaint-details"><p className="eyebrow">Category: {category}</p><h2>Tell us more</h2><div className="choice-chips">{guided[category].map(issue => <button className="choice-chip" type="button" key={issue} onClick={() => setComplaint(issue)}>{issue}</button>)}</div><div className="description-field"><label htmlFor="complaint-description">Describe the issue</label><div className="textarea-wrap"><textarea id="complaint-description" value={complaint} onChange={event => setComplaint(event.target.value)} placeholder="Tell us what happened and where it is..." rows="5" /><button className={listening ? 'mic-button mic-button--listening' : 'mic-button'} type="button" onClick={speak} aria-pressed={listening}><Mic size={18} /> {listening ? 'Listening...' : 'Use voice'}</button></div></div><div className="wizard-actions"><Button variant="secondary" onClick={() => setStep(1)}>Back</Button><Button disabled={complaint.trim().length <= 8} onClick={() => setStep(3)}>Next</Button></div></section>}
    {step === 3 && <section className="complaint-step complaint-location"><p className="eyebrow">Step 3 of 4</p><h2>Where is the issue?</h2><div className="location-paths"><button className={path === 'current' ? 'selected' : ''} onClick={() => setPath('current')}><LocateFixed size={16} /> Use current location</button><button className={path === 'search' ? 'selected' : ''} onClick={() => setPath('search')}><Search size={16} /> Search a different location</button></div>{path === 'current' ? <div className={`location-notice ${geoStatus}`}><LocateFixed size={16} /><span>{message}</span></div> : <div className="address-search"><label htmlFor="address-query">Search an address, landmark, ward, or city</label><div><input id="address-query" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && findAddress()} placeholder="e.g. India Gate, New Delhi" /><button type="button" onClick={findAddress} disabled={searching}>{searching ? 'Searching...' : 'Search'}</button></div>{results.map(result => <button className="address-result" type="button" key={result.id} onClick={() => { setPoint(result); setConfirmed(null); setResults([]) }}>{result.label}</button>)}</div>}<div className="manual-location"><p className="manual-location-title">Enter location manually</p><div className="manual-location-fields"><label>Address or landmark<input value={manualLabel} onChange={event => setManualLabel(event.target.value)} placeholder="Ward, street, or landmark" /></label><label>Latitude<input inputMode="decimal" value={manualLatitude} onChange={event => setManualLatitude(event.target.value)} placeholder="28.6139" /></label><label>Longitude<input inputMode="decimal" value={manualLongitude} onChange={event => setManualLongitude(event.target.value)} placeholder="77.2090" /></label><button type="button" onClick={applyManualLocation}>Use this location</button></div></div><LocationMap point={point || initialPoint} onPinChange={setPin} />{point && <div className={confirmed ? 'confirm-location is-confirmed' : 'confirm-location'}><Navigation size={18} /><div><small>{confirmed ? 'LOCATION CONFIRMED' : 'CONFIRM ISSUE LOCATION'}</small><strong>{point.label}</strong><span>{point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}</span></div><button type="button" onClick={() => setConfirmed(current => current ? null : point)}>{confirmed ? 'Change confirmation' : 'Confirm pin'}</button></div>}<div className="wizard-actions"><Button variant="secondary" onClick={() => setStep(2)}>Back</Button><Button disabled={!confirmed} onClick={() => setStep(4)}>Next</Button></div></section>}
    {step === 4 && <section className="complaint-step complaint-review"><p className="eyebrow">Step 4 of 4</p><h2>Review your complaint</h2><div className="review-card"><dl><div><dt>Category</dt><dd>{category}</dd></div><div><dt>Location</dt><dd>{confirmed?.label}</dd></div><div className="review-description"><dt>Description</dt><dd>{complaint}</dd></div><div><dt>Suggested department</dt><dd>{route?.department} · {route?.team}</dd></div></dl></div><div className="wizard-actions"><Button variant="secondary" onClick={() => setStep(3)}>Back</Button><Button variant="success" disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : 'Submit complaint'}</Button></div></section>}
  </main>
}
