import { BriefcaseBusiness, CheckCircle2, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'

const roles = [
  {
    id: 'citizen_priya',
    name: 'Priya Sharma',
    role: 'Citizen',
    description: 'File and track grievances.',
    phone: '98XXXXXXXX',
    destination: '/dashboard',
    icon: UserRound,
  },
  {
    id: 'officer_ramesh',
    name: 'Ramesh Kumar',
    role: 'Officer',
    description: 'Investigate and resolve assigned tickets.',
    phone: '98XXXXXXXX',
    destination: '/officer',
    icon: BriefcaseBusiness,
  },
]

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roleParam = searchParams.get('role')
  const otpRequested = searchParams.get('otp') === 'true'
  const requestedRole = roleParam === 'officer' ? 'Officer' : roleParam === 'citizen' ? 'Citizen' : null
  const availableRoles = requestedRole ? roles.filter((role) => role.role === requestedRole) : roles
  const initialRoleId = availableRoles.length === 1 ? availableRoles[0].id : null
  const [selectedRole, setSelectedRole] = useState(initialRoleId)
  const [otpSent, setOtpSent] = useState(otpRequested && Boolean(initialRoleId))
  const activeRole = roles.find((role) => role.id === selectedRole)

  useEffect(() => {
    setSelectedRole(initialRoleId)
    setOtpSent(otpRequested && Boolean(initialRoleId))
  }, [initialRoleId, otpRequested])

  function chooseRole(role) {
    setSelectedRole(role.id)
    setOtpSent(false)
  }

  return (
    <main className="login-page">
      <section className="login-panel login-panel--intro" aria-labelledby="login-intro-heading">
        <span className="hero-badge">Nivaran · CPGRAMS 2.0</span>
        <h1 id="login-intro-heading">Two people,<br />one proof loop.</h1>
        <ol className="login-journey">
          <li><span>1</span><p>Pick who you are</p></li>
          <li><span>2</span><p>File or manage a real grievance</p></li>
          <li><span>3</span><p>Watch it get resolved end-to-end</p></li>
        </ol>
      </section>

      <section className="login-panel login-panel--form" aria-labelledby="login-form-heading">
        {!activeRole ? (
          <div className="login-form-content">
            <p className="eyebrow">Demo access</p>
            <h2 id="login-form-heading">Choose your role</h2>
            <p className="login-lede">Use either demo account to see the complaint journey from both sides.</p>
            <div className="role-grid">
              {availableRoles.map(({ id, name, role, description, icon: Icon }) => (
                <button className="role-card" key={id} type="button" onClick={() => chooseRole({ id })}>
                  <span className="role-icon"><Icon size={25} /></span>
                  <span className="role-name">{name}</span>
                  <span className="role-type">{role}</span>
                  <span className="role-description">{description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="login-form-content">
            <p className="eyebrow">Demo access</p>
            <h2 id="login-form-heading">Signing in as {activeRole.name}</h2>
            <p className="login-lede">{activeRole.role} account</p>
            <label className="login-label" htmlFor="demo-phone">Mobile number</label>
            <input id="demo-phone" className="login-input" value={activeRole.phone} readOnly aria-readonly="true" />
            {!otpSent ? (
              <Button onClick={() => setOtpSent(true)}>Send OTP</Button>
            ) : (
              <>
                <label className="login-label" htmlFor="demo-otp">Demo OTP — auto-filled for judges</label>
                <input id="demo-otp" className="login-input login-input--otp" value="123456" readOnly aria-readonly="true" />
                <div className="login-reassurance"><ShieldCheck size={20} /><span>This is a mocked login. No real SMS is sent.</span></div>
                <Button onClick={() => navigate(activeRole.destination)}>Continue</Button>
              </>
            )}
            {!requestedRole && <button className="change-role" type="button" onClick={() => setSelectedRole(null)}>Choose a different role</button>}
          </div>
        )}
      </section>
    </main>
  )
}
