import { useState, useEffect, useRef } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

function GrainBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      draw()
    }

    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      // Dark base
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, w, h)

      // Soft light spot — upper right
      const g1 = ctx.createRadialGradient(w * 0.72, h * 0.22, 0, w * 0.72, h * 0.22, w * 0.55)
      g1.addColorStop(0, 'rgba(80,80,80,0.28)')
      g1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      // Soft light spot — lower center
      const g2 = ctx.createRadialGradient(w * 0.6, h * 0.72, 0, w * 0.6, h * 0.72, w * 0.5)
      g2.addColorStop(0, 'rgba(65,65,65,0.22)')
      g2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // Film grain
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

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

export default function AuthScreen() {
  const { setSessaoAtual, depoisDoLogin } = useApp()
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const mudarModo = (m) => { setModo(m); setErro('') }

  const submeter = async () => {
    setErro('')
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
      <div className="auth-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-logo">
          <div style={{ fontSize: 52 }}>📋</div>
          <h1 style={{ color: '#f0f0f5' }}>Roteiro do Culto</h1>
          <p style={{ color: 'rgba(240,240,245,0.6)' }}>Cria e partilha roteiros com a tua equipa</p>
        </div>
        <div style={{
          background: 'rgba(28,28,36,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
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
          <div className="campo" style={{ marginBottom: '20px' }}>
            <label style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} autoComplete="current-password" placeholder="••••••••"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button className="btn-primary btn-accent" onClick={submeter} disabled={loading}
            style={{ background: '#f0f0f5', color: '#0d0d0d', border: 'none' }}>
            {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
          </button>
        </div>
        <div className="auth-link" style={{ color: 'rgba(240,240,245,0.5)' }}>
          {modo === 'login'
            ? <>Ainda não tens conta? <span style={{ color: '#f0f0f5', fontWeight: 700 }} onClick={() => mudarModo('registo')}>Criar conta</span></>
            : <>Já tens conta? <span style={{ color: '#f0f0f5', fontWeight: 700 }} onClick={() => mudarModo('login')}>Entrar</span></>}
        </div>
      </div>
    </div>
  )
}
