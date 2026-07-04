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

    ctx.fillStyle = '#060606'
    ctx.fillRect(0, 0, W, H)

    const g1 = ctx.createRadialGradient(W*0.78, H*0.22, 0, W*0.78, H*0.22, W*0.55)
    g1.addColorStop(0, 'rgba(80,80,80,0.32)')
    g1.addColorStop(0.4, 'rgba(50,50,50,0.18)')
    g1.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

    const g2 = ctx.createRadialGradient(W*0.65, H*0.52, 0, W*0.65, H*0.52, W*0.5)
    g2.addColorStop(0, 'rgba(65,65,65,0.28)')
    g2.addColorStop(0.5, 'rgba(35,35,35,0.14)')
    g2.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

    const g3 = ctx.createRadialGradient(W*0.42, H*0.78, 0, W*0.42, H*0.78, W*0.45)
    g3.addColorStop(0, 'rgba(55,55,55,0.22)')
    g3.addColorStop(0.6, 'rgba(25,25,25,0.10)')
    g3.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H)

    const g4 = ctx.createRadialGradient(W*0.05, H*0.05, 0, W*0.05, H*0.05, W*0.4)
    g4.addColorStop(0, 'rgba(0,0,0,0.3)')
    g4.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g4; ctx.fillRect(0, 0, W, H)

    const imgData = ctx.getImageData(0, 0, W, H)
    const d = imgData.data
    let seed = 137
    const rand = () => {
      seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5
      return (seed >>> 0) / 0xffffffff
    }
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * 44
      d[i]   = Math.max(0, Math.min(255, d[i]   + n))
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n))
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n))
    }
    ctx.putImageData(imgData, 0, 0)
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
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.82)',
    borderRadius: 10,
  }

  const labelStyle = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#060606' }}>
      <DarkGrainBackground />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-0.4px', color: 'rgba(255,255,255,0.90)', marginBottom: 6 }}>
            Roteiro do Culto
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
            Cria e partilha roteiros com a tua equipa
          </p>
        </div>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '26px 22px 22px',
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
            style={{ background: 'rgba(255,255,255,0.90)', color: '#080808', marginTop: 6 }}
          >
            {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.28)' }}>
          {modo === 'login'
            ? <>Ainda não tens conta? <span onClick={() => mudarModo('registo')} style={{ color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>Criar conta</span></>
            : <>Já tens conta? <span onClick={() => mudarModo('login')} style={{ color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>Entrar</span></>}
        </div>
      </div>
    </div>
  )
}
