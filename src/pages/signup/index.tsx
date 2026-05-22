import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  User as UserIcon, Phone, Columns3, MessageSquare, Newspaper, Sparkles,
} from "lucide-react"
import { UseAuth } from "../../context/user"
import type { SubscribeDTO } from "../../data/dto/login"
import "../login/login.css"

type Errors = Partial<Record<keyof SubscribeDTO | 'confirm', string>>

const SignupPage = () => {
  const { subscribe } = UseAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const validate = (): boolean => {
    const next: Errors = {}
    if (!firstName.trim()) next.firstName = "Le prénom est requis."
    if (!lastName.trim()) next.lastName = "Le nom est requis."
    if (!email.trim()) next.email = "L'email est requis."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Format d'email invalide."
    if (!phoneNumber.trim()) next.phoneNumber = "Le téléphone est requis."
    if (!password) next.password = "Le mot de passe est requis."
    else if (password.length < 6) next.password = "6 caractères minimum."
    if (confirm !== password) next.confirm = "Les mots de passe ne correspondent pas."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await subscribe({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      })
    } catch {
      // alert déjà géré dans AuthProvider
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-branding">
        <div className="login-branding-orb-1" />
        <div className="login-branding-orb-2" />

        <div className="login-brand-header">
          <div className="login-brand-logo">e</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>eSaina</div>
            <div style={{
              fontSize: 11, opacity: 0.85, letterSpacing: 1.2,
              textTransform: 'uppercase', fontWeight: 600,
            }}>Workspace</div>
          </div>
        </div>

        <div className="login-brand-content">
          <h1>Rejoignez votre équipe<br />en quelques secondes.</h1>
          <p>
            Créez votre compte et accédez à vos projets, vos sprints et le fil d'équipe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { Icon: Columns3, label: "Tableaux Kanban & backlogs" },
              { Icon: MessageSquare, label: "Messages temps réel & salons" },
              { Icon: Newspaper, label: "Fil d'actualité d'équipe" },
              { Icon: Sparkles, label: "Assistant IA intégré" },
            ].map((f, i) => (
              <div key={i} className="login-feature">
                <span className="login-feature-icon">
                  <f.Icon size={14} color="white" strokeWidth={2.4} />
                </span>
                <span style={{ fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-brand-footer">
          <span>© {new Date().getFullYear()} eSaina</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <span>Conditions</span>
            <span>Confidentialité</span>
          </span>
        </div>
      </div>

      <div className="login-form-wrapper">
        <div className="login-form-card">
          <h2 className="login-title">Créer un compte</h2>
          <p className="login-subtitle">Commencez gratuitement en moins d'une minute.</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="login-field-label">Prénom</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><UserIcon size={16} /></span>
                  <input
                    autoComplete="given-name"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="login-input"
                    style={{
                      borderColor: errors.firstName ? 'var(--color-error)' : undefined,
                    }}
                  />
                </div>
                {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
              </div>
              <div>
                <label className="login-field-label">Nom</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><UserIcon size={16} /></span>
                  <input
                    autoComplete="family-name"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="login-input"
                    style={{
                      borderColor: errors.lastName ? 'var(--color-error)' : undefined,
                    }}
                  />
                </div>
                {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
              </div>
            </div>

            <div>
              <label className="login-field-label">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={16} /></span>
                <input
                  type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="login-input"
                  style={{
                    borderColor: errors.email ? 'var(--color-error)' : undefined,
                  }}
                />
              </div>
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </div>

            <div>
              <label className="login-field-label">Téléphone</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Phone size={16} /></span>
                <input
                  type="tel" autoComplete="tel"
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+261 00 000 0000"
                  className="login-input"
                  style={{
                    borderColor: errors.phoneNumber ? 'var(--color-error)' : undefined,
                  }}
                />
              </div>
              {errors.phoneNumber && <FieldError>{errors.phoneNumber}</FieldError>}
            </div>

            <div>
              <label className="login-field-label">Mot de passe</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={16} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  style={{
                    paddingRight: 42,
                    borderColor: errors.password ? 'var(--color-error)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="login-input-toggle"
                  title={showPw ? 'Masquer' : 'Afficher'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </div>

            <div>
              <label className="login-field-label">Confirmer le mot de passe</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={16} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  style={{
                    borderColor: errors.confirm ? 'var(--color-error)' : undefined,
                  }}
                />
              </div>
              {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
            </div>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Création…' : (
                <>
                  Créer mon compte <ArrowRight size={16} color="white" />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-link">
            Déjà un compte ?{' '}
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/') }}
              style={{ fontWeight: 600 }}
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const FieldError = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    marginTop: 6, fontSize: 12, fontWeight: 500,
    color: 'var(--color-error)',
  }}>{children}</div>
)

export default SignupPage
