import { useState, useEffect, useRef } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

function DarkGrainBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 390, H = 844
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#07090e'
    ctx.fillRect(0, 0, W, H)

    const blobs = [
      { x: 0.72, y: 0.28, r: 0.38, c: 'rgba(60,90,130,0.28)' },
      { x: 0.25, y: 0.62, r: 0.32, c: 'rgba(40,70,110,0.22)' },
      { x: 0.55, y: 0.72, r: 0.28, c: 'rgba(50,85,120,0.18)' },
      { x: 0.1,  y: 0.18, r: 0.22, c: 'rgba(30,55,90,0.16)' },
    ]
    blobs.forEach(b => {
      const gx = b.x * W, gy = b.y * H, gr = b.r * Math.max(W, H)
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
      g.addColorStop(0, b.c)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    })

    const imgData = ctx.getImageData(0, 0, W, H)
    const d = imgData.data
    let seed = 42
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff
      return (seed >>> 0) / 0xffffffff
    }
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * 38
      d[i]   = Math.max(0, Math.min(255, d[i]   + n))
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n))
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n))
    }
    ctx.putImageData(imgData, 0, 0)

    const bot = ctx.createLinearGradient(0, H * 0.45, 0, H)
    bot.addColorStop(0, 'rgba(4,6,10,0)')
    bot.addColorStop(1, 'rgba(4,6,10,0.55)')
    ctx.fillStyle = bot
    ctx.fillRect(0, 0, W, H)
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
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

  const fieldStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#07090e' }}>
      <DarkGrainBackground />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 24px 44px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', color: 'rgba(255,255,255,0.92)', marginBottom: 5 }}>
            Roteiro do Culto
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)' }}>
            Cria e partilha roteiros com a tua equipa
          </p>
        </div>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.055)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '24px 20px 20px',
        }}>
          {erro && <div className="auth-error">{erro}</div>}
          {modo === 'registo' && (
            <div className="campo">
              <label style={labelStyle}>O teu nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={onKey} autoComplete="name" style={fieldStyle} />
            </div>
          )}
          <div className="campo">
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoComplete="email" style={fieldStyle} />
          </div>
          <div className="campo">
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} autoComplete="current-password" style={fieldStyle} />
          </div>
          <button
            className="btn-primary"
            onClick={submeter}
            disabled={loading}
            style={{ background: 'rgba(255,255,255,0.92)', color: '#07090e', marginTop: 4 }}
          >
            {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: 'rgba(255,255,255,0.32)' }}>
          {modo === 'login'
            ? <>Ainda não tens conta? <span onClick={() => mudarModo('registo')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Criar conta</span></>
            : <>Já tens conta? <span onClick={() => mudarModo('login')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Entrar</span></>}
        </div>
      </div>
    </div>
  )
}
