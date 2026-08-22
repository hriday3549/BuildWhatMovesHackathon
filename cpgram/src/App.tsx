import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronRight, CircleAlert, Clock3, LocateFixed, MapPin, Mic, Navigation, Search, ShieldCheck, Sparkles } from 'lucide-react'
import type { Coordinates, Route, Ticket } from './types'
import LocationMap from './components/LocationMap'
import { reverseGeocode, searchAddress, type AddressResult } from './services/location'
import { routeComplaint } from './services/routing'
import { createTicket, getTicket } from './services/api'

const examples = ['The streetlight near my home has not worked for three nights.', 'There is a large pothole outside the bus stop.', 'Water is leaking from the public pipeline.']
const statusProgress: Record<Ticket['status'], number> = { Submitted: 1, Assigned: 2, 'In progress': 3, Escalated: 3, Resolved: 4 }
const initialMapPoint: Coordinates = { latitude: 28.6139, longitude: 77.2090, label: 'Click the map to drop an issue pin' }
function formatDate(date: string) { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) }
function coordinateLabel(latitude: number, longitude: number) { return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }

export default function App() {
  const [view, setView] = useState<'report' | 'success' | 'track'>('report')
  const [complaint, setComplaint] = useState('')
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
  const [tracking, setTracking] = useState(false)
  const autoLocationRequested = useRef(false)

  useEffect(() => { setRouting(complaint.trim().length > 8 ? routeComplaint(complaint) : null) }, [complaint])
  useEffect(() => { if (!autoLocationRequested.current) { autoLocationRequested.current = true; requestCurrentLocation(true) } }, [])
  const ready = complaint.trim().length > 8 && confirmedLocation && routing
  const progress = useMemo(() => statusProgress[ticket?.status || 'Submitted'], [ticket])

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

  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView('report')}><span className="brand-mark"><ShieldCheck size={21}/></span><span>Smart <b>CPGRAMS</b><small>Citizen civic services</small></span></button><button className="track-link" onClick={() => setView('track')}><Search size={17}/> Track complaint</button></header>
    {view === 'report' && <section className="shell">
      <div className="hero"><p className="eyebrow"><Sparkles size={15}/> SIMPLE. ACCOUNTABLE. LOCAL.</p><h1>Report a civic issue.<br/><em>We’ll take it from here.</em></h1><p>Describe the problem in your own words. We identify the right department, track its response, and escalate it if action is delayed.</p></div>
      <div className="steps" aria-label="Complaint process"><Step n="1" label="Tell us" active/><Step n="2" label="Confirm location" active={!!confirmedLocation}/><Step n="3" label="Route issue" active={!!routing}/><Step n="4" label="Track action"/></div>
      <div className="grid"><section className="card report-card">
        <div className="section-title"><span className="num">1</span><div><h2>What happened?</h2><p>Use any language you’re comfortable with.</p></div></div>
        <div className="input-wrap"><textarea value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="For example: The streetlight outside my house has been broken for three days." maxLength={1000}/><button className="mic" title="Voice input will connect here"><Mic size={19}/></button></div><div className="examples">{examples.map(x => <button key={x} onClick={() => setComplaint(x)}>{x}</button>)}</div>
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
    {view === 'success' && ticket && <section className="shell confirmation"><div className="success-icon"><Check size={34}/></div><p className="eyebrow">COMPLAINT REGISTERED</p><h1>You’re all set.</h1><p className="lead">Your issue is now with the right team. We’ll keep the record and escalation path visible to you.</p><div className="ticket-box"><span>YOUR TICKET NUMBER</span><strong>{ticket.id}</strong><button onClick={() => { setTrackId(ticket.id); setView('track') }}>View live status <ChevronRight size={17}/></button></div><Timeline ticket={ticket} progress={progress}/><button className="secondary" onClick={() => { setComplaint(''); setDraftLocation(null); setConfirmedLocation(null); setTicket(null); setView('report') }}>Report another issue</button></section>}
    {view === 'track' && <section className="shell tracking"><p className="eyebrow">TRANSPARENT STATUS</p><h1>Track your complaint</h1><p className="lead">Enter the ticket number you received when you submitted your issue.</p><div className="track-form"><input value={trackId} onChange={e => setTrackId(e.target.value)} onKeyDown={e => e.key === 'Enter' && track()} placeholder="e.g. SCG-2026-123456"/><button onClick={track} disabled={tracking}>{tracking ? 'Checking…' : 'Track status'}</button></div>{tracked ? <><div className="status-card"><span className="status-dot"/><div><small>CURRENT STATUS</small><strong>{tracked.status}</strong><p>{tracked.route.department} · {tracked.route.team}</p></div><MapPin size={22}/></div><Timeline ticket={tracked} progress={statusProgress[tracked.status]}/></> : trackId && !tracking ? <p className="not-found">We couldn’t find that ticket on this device. Check the number and try again.</p> : null}</section>}
    <footer><span>© Smart CPGRAMS prototype</span><span>Designed for a more responsive public service</span></footer>
  </main>
}
function Step({ n, label, active = false }: { n: string; label: string; active?: boolean }) { return <div className={active ? 'step active' : 'step'}><span>{active ? <Check size={13}/> : n}</span>{label}</div> }
function Timeline({ ticket, progress }: { ticket: Ticket; progress: number }) { return <section className="timeline card"><div className="timeline-head"><div><small>CASE PROGRESS</small><h2>{ticket.status}</h2></div><span>Filed {formatDate(ticket.createdAt)}</span></div>{ticket.timeline.map((x, i) => <div className={'event ' + (i + 1 <= progress ? 'current' : '')} key={x.label}><span className="event-dot">{i + 1 < progress ? <Check size={12}/> : i + 1 === progress ? <Clock3 size={13}/> : null}</span><div><strong>{x.label}</strong><p>{x.detail}</p></div><time>{formatDate(x.time)}</time></div>)}</section> }
