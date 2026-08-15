import { useState, useEffect, useRef } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

export function GrainBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth
      const h = canvas.height = canvas.offsetHeight

      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, w, h)

      const g1 = ctx.createRadialGradient(w * 0.72, h * 0.22, 0, w * 0.72, h * 0.22, w * 0.55)
      g1.addColorStop(0, 'rgba(80,80,80,0.28)')
      g1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      const g2 = ctx.createRadialGradient(w * 0.6, h * 0.72, 0, w * 0.6, h * 0.72, w * 0.5)
      g2.addColorStop(0, 'rgba(65,65,65,0.22)')
      g2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 38
        data[i] = Math.max(0, Math.min(255, data[i] + n))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
      }
      ctx.putImageData(imageData, 0, 0)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  )
}

export default function AuthScreen() {
  const { setSessaoAtual, depoisDoLogin, navigate } = useApp()
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  // recuperar senha
  const [passo, setPasso] = useState(1) // 1 = email, 2 = aguardar link
  const [reenviarEm, setReenviarEm] = useState(0)

  useEffect(() => {
    if (reenviarEm <= 0) return
    const t = setInterval(() => setReenviarEm(v => v <= 1 ? 0 : v - 1), 1000)
    return () => clearInterval(t)
  }, [reenviarEm])

  const mudarModo = (m) => { setModo(m); setErro(''); setPasso(1); setReenviarEm(0) }

  const enviarLink = async () => {
    if (!email) { setErro('Introduz o teu email.'); return }
    setErro('')
    setLoading(true)
    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
      localStorage.setItem('recuperando_senha', '1')
      setPasso(2)
      setReenviarEm(60)
    } catch (err) {
      setErro(traduzirErroAuth(err.message))
    } finally {
      setLoading(false)
    }
  }

  const submeter = async () => {
    setErro('')
    if (modo === 'recuperar') {
      await enviarLink()
      return
    }
    if (!email || !password) { setErro('Preenche email e password.'); return }
    if (modo === 'registo' && !nome) { setErro('Diz-nos o teu nome.'); return }
    setLoading(true)
    try {
      if (modo === 'registo') {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { nome } } })
        if (error) throw error
        setSessaoAtual(data.session || (await sb.auth.getSession()).data.session)
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSessaoAtual(data.session)
      }
      await depoisDoLogin()
    } catch (err) {
      setErro(traduzirErroAuth(err.message))
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') submeter() }

  return (
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#080808' }}>
      <GrainBackground />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.85) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', height: '100%',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="auth-logo" style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <h1 style={{ color: '#f0f0f5', fontSize: 26, fontWeight: 800, marginTop: 12, letterSpacing: '-0.5px' }}>HolyFlow</h1>
            <p style={{ color: 'rgba(240,240,245,0.55)', fontSize: 14, marginTop: 6 }}>Cria e partilha roteiros com a tua equipa</p>
          </div>

          <div style={{
            background: 'rgba(28,28,36,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius)',
            padding: '22px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {modo === 'recuperar' ? (
              passo === 1 ? (
                <>
                  {erro && <div className="auth-error">{erro}</div>}
                  <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Recuperar senha</div>
                  <div style={{ color: 'rgba(240,240,245,0.45)', fontSize: 13, marginBottom: 16 }}>Enviamos um link de acesso para o teu email.</div>
                  <div className="campo" style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
                      autoComplete="email" placeholder="email@exemplo.com"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <button className="btn-primary btn-accent" onClick={submeter} disabled={loading}
                    style={{ background: '#f0f0f5', color: '#0d0d0d', border: 'none' }}>
                    {loading ? 'A enviar...' : 'Enviar link'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
                    <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Verifica o teu email</div>
                    <div style={{ color: 'rgba(240,240,245,0.45)', fontSize: 13, lineHeight: 1.5 }}>
                      Enviámos um link para{' '}
                      <span style={{ color: 'rgba(240,240,245,0.75)', fontWeight: 600 }}>{email}</span>.<br />
                      Clica no link para definir uma nova senha.
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    {reenviarEm > 0 ? (
                      <span style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)' }}>Reenviar em {reenviarEm}s</span>
                    ) : (
                      <span
                        onClick={enviarLink}
                        style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', cursor: 'pointer', textDecoration: 'underline' }}
                      >Reenviar link</span>
                    )}
                  </div>
                </>
              )
            ) : (
              <>
                {erro && <div className="auth-error">{erro}</div>}
                {modo === 'registo' && (
                  <div className="campo">
                    <label style={{ color: 'rgba(255,255,255,0.4)' }}>O teu nome</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={onKey} autoComplete="name" placeholder="João Silva"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                )}
                <div className="campo">
                  <label style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoComplete="email" placeholder="email@exemplo.com"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div className="campo" style={{ marginBottom: modo === 'login' ? '6px' : '20px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} autoComplete="current-password" placeholder="••••••••"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                {modo === 'login' && (
                  <div style={{ textAlign: 'right', marginBottom: 16 }}>
                    <span
                      onClick={() => mudarModo('recuperar')}
                      style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', cursor: 'pointer' }}
                    >
                      Esqueci a senha
                    </span>
                  </div>
                )}
                <button className="btn-primary btn-accent" onClick={submeter} disabled={loading}
                  style={{ background: '#f0f0f5', color: '#0d0d0d', border: 'none' }}>
                  {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
                </button>
              </>
            )}
          </div>

          <div className="auth-link" style={{ color: 'rgba(240,240,245,0.45)', marginTop: 18 }}>
            {modo === 'recuperar'
              ? <span style={{ color: '#f0f0f5', fontWeight: 700, cursor: 'pointer' }} onClick={() => mudarModo('login')}>Voltar ao login</span>
              : modo === 'login'
                ? <>Ainda não tens conta? <span style={{ color: '#f0f0f5', fontWeight: 700, cursor: 'pointer' }} onClick={() => mudarModo('registo')}>Criar conta</span></>
                : <>Já tens conta? <span style={{ color: '#f0f0f5', fontWeight: 700, cursor: 'pointer' }} onClick={() => mudarModo('login')}>Entrar</span></>}
          </div>
        </div>
      </div>
    </div>
  )
}
