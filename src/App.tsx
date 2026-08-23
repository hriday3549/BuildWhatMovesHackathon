import { useEffect, useMemo, useRef, useState } from 'react'
import * as exifr from 'exifr'
import { ArrowRight, Camera, Check, ChevronRight, CircleAlert, Clock3, LocateFixed, MapPin, Mic, Navigation, Search, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, Upload, UserRound } from 'lucide-react'
import type { Coordinates, Route, Ticket } from './types'
import LocationMap from './components/LocationMap'
import { reverseGeocode, searchAddress, type AddressResult } from './services/location'
import { routeComplaint } from './services/routing'
import { addOfficerUpdate, createTicket, getTicket, getTickets, verifyOfficerUpdate } from './services/api'

const examples = ['The streetlight near my home has not worked for three nights.', 'There is a large pothole outside the bus stop.', 'Water is leaking from the public pipeline.']
const guidedIssues = {
  Roads: ['A pothole is causing accidents.', 'The road is flooded.', 'A footpath is blocked.'],
  Lighting: ['A streetlight is not working.', 'A public pole is damaged.'],
  Water: ['A public pipeline is leaking.', 'A drain is overflowing.'],
  Sanitation: ['Garbage has not been collected.', 'There is a public waste problem.']
}
const statusProgress: Record<Ticket['status'], number> = { Submitted: 1, Assigned: 2, 'In progress': 3, 'Pending verification': 3, Escalated: 3, Resolved: 4 }
const initialMapPoint: Coordinates = { latitude: 28.6139, longitude: 77.2090, label: 'Click the map to drop an issue pin' }
function formatDate(date: string) { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) }
function coordinateLabel(latitude: number, longitude: number) { return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }
function fileToDataUrl(file: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) }) }

export default function App() {
  const [view, setView] = useState<'login' | 'report' | 'success' | 'track' | 'officer'>('login')
  const [session, setSession] = useState<'citizen' | 'officer' | null>(null)
  const [complaint, setComplaint] = useState('')
  const [guidedCategory, setGuidedCategory] = useState<keyof typeof guidedIssues | null>(null)
  const [listening, setListening] = useState(false)
  const [draftLocation, setDraftLocation] = useState<Coordinates | null>(null)
  const [confirmedLocation, setConfirmedLocation] = useState<Coordinates | null>(null)
  const [locationPath, setLocationPath] = useState<'current' | 'search'>('current')
  const [geoStatus, setGeoStatus] = useState<'requesting' | 'ready' | 'denied' | 'unsupported'>('requesting')
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState<AddressResult[]>([])
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [locationMessage, setLocationMessage] = useState('We’re requesting permission to find your location. You can also search for a different place.')
  const [routing, setRouting] = useState<Route | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [trackId, setTrackId] = useState('')
  const [tracked, setTracked] = useState<Ticket | null>(null)
  const [citizenTickets, setCitizenTickets] = useState<Ticket[]>([])
  const [tracking, setTracking] = useState(false)
  const [officerTicketId, setOfficerTicketId] = useState('')
  const [officerTicket, setOfficerTicket] = useState<Ticket | null>(null)
  const [officerNote, setOfficerNote] = useState('Work completed. Site was inspected and the issue has been addressed.')
  const [officerPhoto, setOfficerPhoto] = useState<string | null>(null)
  const [officerGeo, setOfficerGeo] = useState<Coordinates | null>(null)
  const [officerCapturedAt, setOfficerCapturedAt] = useState<string | null>(null)
  const [officerPhotoName, setOfficerPhotoName] = useState('')
  const [officerMessage, setOfficerMessage] = useState('Choose the original camera photo. It must contain embedded EXIF GPS coordinates and the original capture time.')
  const [officerSaving, setOfficerSaving] = useState(false)
  const autoLocationRequested = useRef(false)

  useEffect(() => { setRouting(complaint.trim().length > 8 ? routeComplaint(complaint) : null) }, [complaint])
  useEffect(() => { if (!autoLocationRequested.current) { autoLocationRequested.current = true; requestCurrentLocation(true) } }, [])
  useEffect(() => { if (view === 'track') void loadCitizenTickets() }, [view])
  const ready = complaint.trim().length > 8 && confirmedLocation && routing
  const progress = useMemo(() => statusProgress[ticket?.status || 'Submitted'], [ticket])

  function startVoiceInput() {
    const SpeechRecognition = (window as Window & { webkitSpeechRecognition?: new () => { lang: string; start: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void; onerror: () => void } }).webkitSpeechRecognition
    if (!SpeechRecognition) { setLocationMessage('Voice input is not supported in this browser. You can type your answer instead.'); return }
    const recognition = new SpeechRecognition(); recognition.lang = 'en-IN'; setListening(true)
    recognition.onresult = event => { setComplaint(current => `${current}${current ? ' ' : ''}${event.results[0][0].transcript}`); setListening(false) }
    recognition.onend = () => setListening(false); recognition.onerror = () => setListening(false); recognition.start()
  }
  function chooseGuidedIssue(issue: string) { setComplaint(issue); setGuidedCategory(guidedCategory); }

  function setPin(latitude: number, longitude: number, label = `Pinned location · ${coordinateLabel(latitude, longitude)}`) {
    setDraftLocation({ latitude, longitude, label }); setConfirmedLocation(null); void updateAddress(latitude, longitude)
  }
  async function updateAddress(latitude: number, longitude: number) {
    try { const address = await reverseGeocode(latitude, longitude); setDraftLocation(current => current && current.latitude === latitude && current.longitude === longitude ? { ...current, label: address } : current) } catch { /* Exact pins still work if reverse geocoding fails. */ }
  }
  function requestCurrentLocation(automatic = false) {
    setLocationPath('current'); setGeoStatus('requesting'); setLocationMessage(automatic ? 'Your browser is asking to use your current location. This makes local routing more accurate.' : 'Finding your current location…')
    if (!navigator.geolocation) { setGeoStatus('unsupported'); setLocationMessage('This browser cannot share a location. Search for an address or place a pin on the map instead.'); return }
    navigator.geolocation.getCurrentPosition(
      position => { setGeoStatus('ready'); setLocationMessage('Current location found. Drag the pin or click the map to make it exact, then confirm it.'); setPin(position.coords.latitude, position.coords.longitude, 'Locating nearest address…') },
      () => { setGeoStatus('denied'); setLocationMessage('Location permission was not available. Search for the location or drop a pin directly on the map.') },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }
  async function findAddress() {
    if (addressQuery.trim().length < 3) return
    setSearchingAddress(true); setAddressResults([])
    try { const results = await searchAddress(addressQuery.trim()); setAddressResults(results); if (!results.length) setLocationMessage('No matching address found. Try a landmark, ward, street, or city name.') }
    catch { setLocationMessage('Address search is temporarily unavailable. You can still click or drag the map pin.') }
    finally { setSearchingAddress(false) }
  }
  function chooseAddress(result: AddressResult) { setDraftLocation({ latitude: result.latitude, longitude: result.longitude, label: result.label }); setConfirmedLocation(null); setAddressResults([]); setLocationMessage('Address selected. Drag the pin or click the map to make it exact, then confirm it.') }
  async function submit() { if (!ready || !routing || !confirmedLocation) return; setSubmitting(true); const result = await createTicket({ complaint: complaint.trim(), location: confirmedLocation, route: routing }); setTicket(result); setSubmitting(false); setView('success') }
  async function track() { if (!trackId.trim()) return; setTracking(true); setTracked((await getTicket(trackId)) ?? null); setTracking(false) }
  async function loadCitizenTickets() { setCitizenTickets(await getTickets()) }
  async function loadOfficerTicket() { if (!officerTicketId.trim()) return; setOfficerTicket((await getTicket(officerTicketId)) ?? null) }
  async function validateOfficerPhoto(file: File) {
    setOfficerPhoto(null); setOfficerGeo(null); setOfficerCapturedAt(null); setOfficerPhotoName('')
    setOfficerMessage('Checking the photo’s embedded GPS and original capture time…')
    try {
      const metadata = await exifr.parse(file, { gps: true, exif: true, tiff: true, reviveValues: true }) as { latitude?: number; longitude?: number; DateTimeOriginal?: Date | string } | undefined
      const latitude = metadata?.latitude
      const longitude = metadata?.longitude
      const originalTime = metadata?.DateTimeOriginal
      const capturedAt = originalTime instanceof Date ? originalTime : originalTime ? new Date(originalTime) : null
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || !capturedAt || Number.isNaN(capturedAt.getTime())) {
        setOfficerMessage('Photo rejected: this file does not contain both embedded EXIF GPS coordinates and the original capture time. Use the original camera photo, not a screenshot or forwarded copy.')
        return
      }
      const photoDataUrl = await fileToDataUrl(file)
      setOfficerPhoto(photoDataUrl)
      setOfficerGeo({ latitude, longitude, label: 'Embedded EXIF GPS coordinates' })
      setOfficerCapturedAt(capturedAt.toISOString())
      setOfficerPhotoName(file.name)
      setOfficerMessage('Metadata verified. This original photo has an embedded GPS coordinate and capture time.')
    } catch {
      setOfficerMessage('Photo rejected: its EXIF metadata could not be read. Use an original camera photo with location tagging enabled.')
    }
  }
  async function saveOfficerUpdate() {
    if (!officerTicket || !officerPhoto || !officerGeo || !officerCapturedAt || !officerNote.trim()) return
    setOfficerSaving(true)
    const updated = await addOfficerUpdate(officerTicket.id, { officerName: 'Demo Field Officer · Ward 12', note: officerNote.trim(), photoDataUrl: officerPhoto, location: officerGeo, capturedAt: officerCapturedAt, originalFileName: officerPhotoName })
    setOfficerTicket(updated ?? null); setOfficerSaving(false)
    if (updated) setOfficerMessage('Update sent. The citizen can now accept or reject the completion.')
  }
  async function verify(ticketId: string, decision: 'accepted' | 'rejected') {
    const updated = await verifyOfficerUpdate(ticketId, decision)
    if (updated) { setTracked(updated); if (ticket?.id === updated.id) setTicket(updated); if (officerTicket?.id === updated.id) setOfficerTicket(updated) }
  }
  function enterDemo(role: 'citizen' | 'officer') { setSession(role); setView(role === 'citizen' ? 'track' : 'officer') }

  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView(session ? 'report' : 'login')}><span className="brand-mark"><ShieldCheck size={21}/></span><span><b>Nivaran</b><small>CPGRAMS, reimagined</small></span></button><div className="header-actions"><button className="officer-link" onClick={() => enterDemo('officer')}><UserRound size={16}/> Officer demo</button><button className="track-link" onClick={() => { setSession('citizen'); setView('track') }}><Search size={17}/> My complaints</button></div></header>
    {view === 'login' && <section className="shell login-page"><div className="login-intro"><p className="eyebrow"><ShieldCheck size={15}/> A CIVIC RECORD YOU CAN TRUST</p><h1>Get the right person<br/><em>on the case.</em></h1><p className="lead">Nivaran makes public complaints visible, local, and verifiable from the first pin to the final proof.</p></div><section className="login-panel"><span className="login-kicker">DEMO ACCESS</span><h2>Choose your view</h2><p>Use a pre-seeded account to walk through the complete complaint lifecycle.</p><button className="demo-account" onClick={() => enterDemo('citizen')}><span className="account-icon"><UserRound size={20}/></span><span><b>Continue as Priya Sharma</b><small>Citizen · 4 active case records</small></span><ChevronRight size={18}/></button><button className="demo-account" onClick={() => enterDemo('officer')}><span className="account-icon officer"><Camera size={20}/></span><span><b>Continue as Officer Ramesh</b><small>Ward 12 · field completion workspace</small></span><ChevronRight size={18}/></button><div className="mock-otp"><Check size={15}/><span>Demo access uses a mocked OTP. No phone number is required.</span></div></section></section>}
    {view === 'report' && <section className="shell">
      <div className="hero"><p className="eyebrow"><Sparkles size={15}/> CUT THE RED TAPE</p><h1>Complaints that get finished,<br/><em>not just filed.</em></h1><p>Tell Nivaran what happened. We route it to the right ward team, show the evidence, and keep the outcome in your hands.</p></div>
      <div className="steps" aria-label="Complaint process"><Step n="1" label="Tell us" active/><Step n="2" label="Confirm location" active={!!confirmedLocation}/><Step n="3" label="Route issue" active={!!routing}/><Step n="4" label="Track action"/></div>
      <div className="grid"><section className="card report-card">
        <div className="section-title"><span className="num">1</span><div><h2>Tell us what happened</h2><p>A few quick choices help us send this to the right desk.</p></div></div>
        <div className="guided-panel"><span className="guided-label">NIVARAN INTAKE</span><strong>Which kind of civic issue is this?</strong><div className="guided-choices">{(Object.keys(guidedIssues) as Array<keyof typeof guidedIssues>).map(category => <button className={guidedCategory === category ? 'selected' : ''} key={category} onClick={() => setGuidedCategory(category)}>{category}</button>)}</div>{guidedCategory && <><strong className="guided-followup">What best describes it?</strong><div className="guided-choices issue-choices">{guidedIssues[guidedCategory].map(issue => <button key={issue} onClick={() => chooseGuidedIssue(issue)}>{issue}</button>)}</div></>}</div>
        <div className="input-wrap"><textarea value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Or describe it in your own words…" maxLength={1000}/><button className={listening ? 'mic listening' : 'mic'} title="Speak your complaint" aria-label="Speak your complaint" onClick={startVoiceInput}><Mic size={19}/></button></div><div className="voice-status">{listening ? 'Listening… speak naturally.' : 'You can type, choose an answer, or use your voice.'}</div><div className="examples">{examples.map(x => <button key={x} onClick={() => setComplaint(x)}>{x}</button>)}</div>
        <div className="section-title location-title"><span className="num">2</span><div><h2>Where is the issue?</h2><p>Choose current location or find a different address. You’ll confirm the pin before submitting.</p></div></div>
        <div className="location-paths" role="tablist"><button className={locationPath === 'current' ? 'selected' : ''} onClick={() => requestCurrentLocation()}><LocateFixed size={16}/> Use current location</button><button className={locationPath === 'search' ? 'selected' : ''} onClick={() => setLocationPath('search')}><Search size={16}/> Search a different location</button></div>
        {locationPath === 'current' ? <div className={'location-notice ' + geoStatus}><LocateFixed size={16}/><span>{locationMessage}</span><button onClick={() => requestCurrentLocation()}>Retry</button></div> : <div className="address-search"><label htmlFor="location-search">Search an address, landmark, ward, or city</label><div><input id="location-search" value={addressQuery} onChange={e => setAddressQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && findAddress()} placeholder="e.g. India Gate, New Delhi"/><button onClick={findAddress} disabled={searchingAddress || addressQuery.trim().length < 3}>{searchingAddress ? 'Searching…' : 'Search'}</button></div>{addressResults.length > 0 && <ul className="address-results">{addressResults.map(result => <li key={result.id}><button onClick={() => chooseAddress(result)}><MapPin size={15}/><span>{result.label}</span></button></li>)}</ul>}</div>}
        <div className="map-frame"><LocationMap point={draftLocation || initialMapPoint} onPinChange={(latitude, longitude) => { setLocationPath('search'); setLocationMessage('Pin adjusted. Check the address and confirm this exact location.'); setPin(latitude, longitude) }}/><div className="map-instruction"><MapPin size={15}/><span>Click to drop a pin, or drag the pin to adjust it.</span></div></div>
        {draftLocation && <div className={confirmedLocation ? 'confirm-location confirmed' : 'confirm-location'}><Navigation size={18}/><div><small>{confirmedLocation ? 'LOCATION CONFIRMED' : 'CONFIRM ISSUE LOCATION'}</small><strong>{draftLocation.label}</strong><span>{coordinateLabel(draftLocation.latitude, draftLocation.longitude)}</span></div>{confirmedLocation ? <Check className="confirmed-check" size={22}/> : <button onClick={() => setConfirmedLocation(draftLocation)}>Confirm pin</button>}</div>}
      </section><aside className="side">
        <section className="card routing"><div className="section-title"><span className="num">3</span><div><h2>Smart routing</h2><p>Suggested department</p></div></div>{routing ? <><div className="route-result"><div className="route-icon"><Check size={21}/></div><div><strong>{routing.department}</strong><span>{routing.team}</span></div><span className="confidence">{routing.confidence}% match</span></div><p className="route-note">{routing.reason} You can correct this later if needed.</p></> : <div className="empty-route"><Sparkles size={25}/><span>Start describing the issue to see the recommended department.</span></div>}</section>
        <section className="card escalation"><div className="section-title"><span className="num">4</span><div><h2>Built-in follow-through</h2><p>No chasing required</p></div></div><div className="mini-line"><i/><i/><i/></div><div className="sla"><div><Clock3 size={18}/><span><b>48 hours</b> for department update</span></div><div><CircleAlert size={18}/><span><b>Auto-escalation</b> to the next officer</span></div><div><Check size={18}/><span><b>72-hour target</b> for resolution</span></div></div></section>
        <button className="submit" disabled={!ready || submitting} onClick={submit}>{submitting ? 'Creating ticket…' : !confirmedLocation ? 'Confirm location to continue' : 'Submit complaint'}<ArrowRight size={19}/></button><p className="privacy"><ShieldCheck size={15}/> The pin and address are sent only after you confirm them.</p>
      </aside></div>
    </section>}
    {view === 'success' && ticket && <section className="shell confirmation"><div className="success-icon"><Check size={34}/></div><p className="eyebrow">COMPLAINT REGISTERED</p><h1>You’re all set.</h1><p className="lead">Your issue is now with the right team. We’ll keep the record and escalation path visible to you.</p><div className="ticket-box"><span>YOUR TICKET NUMBER</span><strong>{ticket.id}</strong><button onClick={() => { setTrackId(ticket.id); setView('track') }}>View live status <ChevronRight size={17}/></button></div><Timeline ticket={ticket} progress={progress}/><div className="confirmation-actions"><button className="officer-action" onClick={() => { setOfficerTicketId(ticket.id); setOfficerTicket(ticket); setView('officer') }}><Camera size={16}/> Open officer completion demo</button><button className="secondary" onClick={() => { setComplaint(''); setDraftLocation(null); setConfirmedLocation(null); setTicket(null); setView('report') }}>Report another issue</button></div></section>}
    {view === 'track' && <section className="shell tracking"><p className="eyebrow">PRIYA SHARMA · CITIZEN VIEW</p><h1>Your complaints</h1><p className="lead">Every case has a visible owner, next step, and proof before it can be closed.</p><div className="case-list">{citizenTickets.map(caseTicket => <button className="case-item" key={caseTicket.id} onClick={() => { setTrackId(caseTicket.id); setTracked(caseTicket) }}><span className={'case-status ' + caseTicket.status.toLowerCase().replace(/ /g, '-')} /> <span className="case-copy"><strong>{caseTicket.complaint}</strong><small>{caseTicket.id} · {caseTicket.route.team}</small></span><span className="case-state">{caseTicket.status}{caseTicket.status === 'Pending verification' && <b>Review evidence</b>}</span><ChevronRight size={17}/></button>)}</div><div className="track-form"><input value={trackId} onChange={e => setTrackId(e.target.value)} onKeyDown={e => e.key === 'Enter' && track()} placeholder="Enter a ticket number"/><button onClick={track} disabled={tracking}>{tracking ? 'Checking…' : 'Find ticket'}</button></div>{tracked ? <><div className="status-card"><span className="status-dot"/><div><small>CURRENT STATUS</small><strong>{tracked.status}</strong><p>{tracked.route.department} · {tracked.route.team}</p></div><MapPin size={22}/></div><OfficerEvidence ticket={tracked}/>{tracked.status === 'Pending verification' && <CitizenVerification ticket={tracked} onVerify={verify}/>}<Timeline ticket={tracked} progress={statusProgress[tracked.status]}/></> : trackId && !tracking ? <p className="not-found">We couldn’t find that ticket on this device. Check the number and try again.</p> : null}</section>}
    {view === 'officer' && <section className="shell officer-page"><p className="eyebrow"><UserRound size={15}/> DEMONSTRATION OFFICER WORKSPACE</p><h1>Close the loop with evidence.</h1><p className="lead">Only original camera images with embedded GPS and the original capture time can be sent to the citizen.</p><div className="officer-flow"><span>Officer</span><ArrowRight size={15}/><span>Geotagged photo</span><ArrowRight size={15}/><span>Citizen verification</span><ArrowRight size={15}/><span>Accept / Reject</span></div><section className="card officer-card"><div className="ticket-lookup"><div><label htmlFor="officer-ticket">Complaint ticket number</label><input id="officer-ticket" value={officerTicketId} onChange={e => setOfficerTicketId(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadOfficerTicket()} placeholder="SCG-2026-123456"/></div><button onClick={loadOfficerTicket}>Open ticket</button></div>{officerTicket ? <><div className="officer-ticket-summary"><span className="status-dot"/><div><small>ASSIGNED TICKET</small><strong>{officerTicket.id}</strong><p>{officerTicket.complaint}</p></div><span>{officerTicket.route.department}</span></div>{officerTicket.officerUpdate ? <div className="officer-sent"><Check size={19}/><span>This ticket already has a field update. It is currently <b>{officerTicket.status.toLowerCase()}</b>.</span></div> : <div className="evidence-grid"><label className={officerPhoto ? 'photo-drop has-photo' : 'photo-drop'}><input type="file" accept="image/*" capture="environment" onChange={async e => { const file = e.target.files?.[0]; if (file) await validateOfficerPhoto(file) }}/>{officerPhoto ? <img src={officerPhoto} alt="Officer completion evidence"/> : <><Upload size={26}/><strong>Capture original photo</strong><span>GPS and original capture time must be embedded in the image metadata.</span></>}</label><div className="officer-meta"><div className={officerGeo && officerCapturedAt ? 'geo-proof captured' : 'geo-proof'}><LocateFixed size={19}/><div><b>{officerGeo && officerCapturedAt ? 'EXIF GPS + capture time verified' : 'EXIF GPS + capture time required'}</b><span>{officerGeo && officerCapturedAt ? `${coordinateLabel(officerGeo.latitude, officerGeo.longitude)} · Taken ${formatDate(officerCapturedAt)}` : officerMessage}</span></div>{officerGeo && officerCapturedAt ? <Check size={17}/> : null}</div><p className="metadata-rule">Screenshots, edited images, and forwarded copies without original EXIF GPS and time are rejected.</p><label className="work-note">Completion note<textarea value={officerNote} onChange={e => setOfficerNote(e.target.value)} maxLength={500}/></label><button className="send-update" disabled={!officerPhoto || !officerGeo || !officerCapturedAt || !officerNote.trim() || officerSaving} onClick={saveOfficerUpdate}>{officerSaving ? 'Sending update…' : 'Send for citizen verification'}<ArrowRight size={17}/></button></div></div>}</> : <div className="empty-officer"><Camera size={26}/><span>Enter a ticket number to add a field completion update.</span></div>}</section></section>}
    <footer><span>© Nivaran · CPGRAMS, reimagined</span><span>Complaints that get finished, not just filed.</span></footer>
  </main>
}
function Step({ n, label, active = false }: { n: string; label: string; active?: boolean }) { return <div className={active ? 'step active' : 'step'}><span>{active ? <Check size={13}/> : n}</span>{label}</div> }
function Timeline({ ticket, progress }: { ticket: Ticket; progress: number }) { return <section className="timeline card"><div className="timeline-head"><div><small>CASE PROGRESS</small><h2>{ticket.status}</h2></div><span>Filed {formatDate(ticket.createdAt)}</span></div>{ticket.timeline.map((x, i) => <div className={'event ' + (i + 1 <= progress ? 'current' : '')} key={x.label}><span className="event-dot">{i + 1 < progress ? <Check size={12}/> : i + 1 === progress ? <Clock3 size={13}/> : null}</span><div><strong>{x.label}</strong><p>{x.detail}</p></div><time>{formatDate(x.time)}</time></div>)}</section> }
function OfficerEvidence({ ticket }: { ticket: Ticket }) {
  if (!ticket.officerUpdate) return null
  const update = ticket.officerUpdate
  return <section className="card evidence-card"><div className="evidence-head"><div><p className="eyebrow"><Camera size={14}/> FIELD COMPLETION EVIDENCE</p><h2>Officer update</h2><span>{update.officerName} · submitted {formatDate(update.createdAt)}</span></div><span className="geotag-pill"><LocateFixed size={13}/> EXIF verified</span></div><div className="evidence-body"><img src={update.photoDataUrl} alt="Completion evidence submitted by the field officer"/><div><p>{update.note}</p><div className="evidence-location"><MapPin size={15}/><span>{update.location.label}<b>{coordinateLabel(update.location.latitude, update.location.longitude)} · captured {formatDate(update.capturedAt)}</b></span></div><small className="original-file">Original file: {update.originalFileName}</small></div></div></section>
}
function CitizenVerification({ ticket, onVerify }: { ticket: Ticket; onVerify: (id: string, decision: 'accepted' | 'rejected') => void }) {
  return <section className="card verification-card"><div><p className="eyebrow"><ShieldCheck size={14}/> CITIZEN VERIFICATION REQUIRED</p><h2>Has this issue been resolved?</h2><p>Review the officer’s geotagged photo and confirm the work at the reported location.</p></div><div className="verification-actions"><button className="reject" onClick={() => onVerify(ticket.id, 'rejected')}><ThumbsDown size={16}/> Reject & reopen</button><button className="accept" onClick={() => onVerify(ticket.id, 'accepted')}><ThumbsUp size={16}/> Accept resolution</button></div></section>
}
