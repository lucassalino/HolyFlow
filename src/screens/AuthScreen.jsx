import { useState, useEffect, useRef } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

function BibleBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const W = 390, H = 844
    c.width = W; c.height = H

    function rr(x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }

    function drawBook(cx, cy, angle, sc, label) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.scale(sc, sc)
      const bW = 200, bH = 260, sp = 14
      ctx.shadowBlur = 36; ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.fillStyle = '#0a0a0a'
      rr(-bW/2, -bH/2, bW, bH, 5); ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#181818'
      rr(-bW/2, -bH/2, bW, bH, 4); ctx.fill()
      ctx.fillStyle = '#0d0d0d'
      ctx.fillRect(-bW/2, -bH/2, sp, bH)
      const lx = -bW/2 + sp + 2, ly = -bH/2 + 8
      const pw = (bW - sp - 4) / 2, ph = bH - 16
      ctx.fillStyle = '#f0ece3'
      ctx.fillRect(lx, ly, pw, ph)
      ctx.fillStyle = '#ede9df'
      ctx.fillRect(lx + pw, ly, pw, ph)
      const g = ctx.createLinearGradient(lx + pw - 5, 0, lx + pw + 10, 0)
      g.addColorStop(0, 'rgba(0,0,0,0.3)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(lx + pw - 5, ly, 18, ph)
      for (let i = 0; i < 19; i++) {
        const w2 = i % 5 === 4 ? pw * 0.55 : pw * 0.82
        ctx.fillStyle = i === 0 ? '#333' : '#777'
        ctx.globalAlpha = i === 0 ? 0.9 : 0.55
        ctx.fillRect(lx + 7, ly + 12 + i * 12, w2, i === 0 ? 2.5 : 1.5)
      }
      ctx.globalAlpha = 0.4
      ctx.fillStyle = '#222'
      ctx.font = 'bold 26px Georgia, serif'
      ctx.fillText('3', lx + 7, ly + 46)
      for (let i = 0; i < 19; i++) {
        const w2 = i % 4 === 3 ? pw * 0.5 : pw * 0.8
        ctx.fillStyle = '#777'
        ctx.globalAlpha = 0.5
        ctx.fillRect(lx + pw + 7, ly + 12 + i * 12, w2, 1.5)
      }
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#333'
      ctx.font = '6px Georgia, serif'
      ctx.fillText(label, lx + pw + 7, ly + 8)
      ctx.save()
      ctx.translate(-bW/2 + sp/2, 0)
      ctx.rotate(-Math.PI / 2)
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#bbb'
      ctx.font = '6.5px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText(label, 0, 3)
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.restore()
    }

    function drawKeyboard(cx, cy, angle, sc) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.scale(sc, sc)
      const kW = 200, kH = 130
      ctx.shadowBlur = 28; ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.fillStyle = '#161616'
      rr(-kW/2, -kH/2, kW, kH, 8); ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#1f1f1f'
      rr(-25, 14, 50, 36, 4); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 0.5; ctx.stroke()
      const kw = 12, kh = 10, gx = 3, gy = 4
      const cols = 12, rows = 4
      const sx = -kW/2 + 8, sy = -kH/2 + 8
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          const kx = sx + cc * (kw + gx)
          const ky = sy + r * (kh + gy)
          ctx.fillStyle = '#282828'
          rr(kx, ky, kw, kh, 2); ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.04)'
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }
      ctx.restore()
    }

    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, W, H)
    const imgData = ctx.getImageData(0, 0, W, H)
    const d = imgData.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 18
      d[i] = Math.max(0, Math.min(255, d[i] + n))
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n))
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n))
    }
    ctx.putImageData(imgData, 0, 0)

    drawKeyboard(310, 85, 0.52, 0.9)
    drawBook(75, 220, -0.5, 0.9, 'HABACUQUE')
    drawBook(270, 470, 0.3, 1.0, 'SOFONIAS 1-2')
    drawBook(130, 690, -0.18, 0.85, 'LIVRO DE JONAS')

    ctx.globalAlpha = 0.035
    ctx.fillStyle = '#fff'
    ctx.fillRect(189, 355, 12, 55)
    ctx.fillRect(171, 373, 48, 14)
    ctx.globalAlpha = 1

    const ov = ctx.createLinearGradient(0, 200, 0, H)
    ov.addColorStop(0, 'rgba(8,8,8,0)')
    ov.addColorStop(0.45, 'rgba(8,8,8,0.6)')
    ov.addColorStop(1, 'rgba(8,8,8,0.97)')
    ctx.fillStyle = ov
    ctx.fillRect(0, 0, W, H)
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
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
      <BibleBackground />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 0 32px',
        zIndex: 1,
      }}>
        <div className="auth-logo" style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#f0f0f5', fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Roteiro do Culto</h1>
          <p style={{ color: 'rgba(240,240,245,0.45)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>Cria e partilha roteiros com a tua equipa</p>
        </div>
        <div style={{
          width: '100%',
          maxWidth: 390,
          padding: '0 24px',
        }}>
          <div style={{
            background: 'rgba(22,22,30,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '24px 20px 20px',
          }}>
            {erro && <div className="auth-error">{erro}</div>}
            {modo === 'registo' && (
              <div className="campo">
                <label style={{ color: 'rgba(255,255,255,0.5)' }}>O teu nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={onKey} autoComplete="name"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0f0f5' }} />
              </div>
            )}
            <div className="campo">
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoComplete="email"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0f0f5' }} />
            </div>
            <div className="campo">
              <label style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} autoComplete="current-password"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: '#f0f0f5' }} />
            </div>
            <button className="btn-primary" onClick={submeter} disabled={loading} style={{
              background: '#f0f0f5',
              color: '#0d0d0d',
              marginTop: 4,
            }}>
              {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
            </button>
          </div>
          <div className="auth-link" style={{ color: 'rgba(240,240,245,0.38)', textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            {modo === 'login'
              ? <>Ainda não tens conta? <span onClick={() => mudarModo('registo')} style={{ color: 'rgba(240,240,245,0.7)', cursor: 'pointer' }}>Criar conta</span></>
              : <>Já tens conta? <span onClick={() => mudarModo('login')} style={{ color: 'rgba(240,240,245,0.7)', cursor: 'pointer' }}>Entrar</span></>}
          </div>
        </div>
      </div>
    </div>
  )
}
