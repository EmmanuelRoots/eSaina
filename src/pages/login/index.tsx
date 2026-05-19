import { useState } from "react"
import { useGoogleLogin } from "@react-oauth/google"
import type { CredentialResponse } from "@react-oauth/google"
import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Columns3, MessageSquare, Newspaper, Sparkles,
} from "lucide-react"
import { UseAuth } from "../../context/user"
import type { GoogleLoginDTO, LoginDTO } from "../../data/dto/login"
import "./login.css"

const LoginPage = () => {
  const { login } = UseAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const dto: LoginDTO = { email, password }
      await login(dto)
    } finally {
      setLoading(false)
    }
  }

  const onGoogleSuccess = (res: CredentialResponse) => {
    const googleUser = jwtDecode(res.credential || '') as GoogleLoginDTO
    login(googleUser)
  }

  return (
    <div className="login-container">
      {/* Left: branding */}
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
          <h1>Une plateforme,<br />tout votre travail.</h1>
          <p>
            Gérez vos projets, vos sprints, vos conversations et votre fil d'équipe — sans changer d'onglet.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { Icon: Columns3,       label: "Tableaux Kanban & backlogs" },
              { Icon: MessageSquare,  label: "Messages temps réel & salons" },
              { Icon: Newspaper,      label: "Fil d'actualité d'équipe" },
              { Icon: Sparkles,       label: "Assistant IA intégré" },
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

      {/* Right: form */}
      <div className="login-form-wrapper">
        <div className="login-form-card">
          <h2 className="login-title">Bon retour !</h2>
          <p className="login-subtitle">Connectez-vous pour continuer sur votre workspace.</p>

          <div style={{ width: '100%' }}>
            <GoogleLogin onSuccess={onGoogleSuccess} useOneTap={false} width="100%" />
          </div>

          <div className="login-divider">
            <div />
            <span>ou par email</span>
            <div />
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="login-field-label">Email</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={16} /></span>
                <input
                  type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="login-input"
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="login-field-label" style={{ marginBottom: 0 }}>Mot de passe</label>
                <a href="#" style={{ fontSize: 12, fontWeight: 600 }}>Oublié ?</a>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={16} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  style={{ paddingRight: 42 }}
                  required
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
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4,
              userSelect: 'none', cursor: 'pointer',
            }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
              Rester connecté
            </label>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Connexion…' : (
                <>
                  Se connecter <ArrowRight size={16} color="white" />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-link">
            Pas encore de compte ? <a href="#" style={{ fontWeight: 600 }}>Demander un accès</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
