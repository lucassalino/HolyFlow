import { useState } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

function BibleBackground() {
  return (
    <svg
      viewBox="0 0 390 844"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.13,
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Dark background */}
      <rect width="390" height="844" fill="#000" />

      {/* Book 1 — top-left, rotated -35deg */}
      <g transform="rotate(-35 120 200)">
        {/* Cover */}
        <rect x="20" y="100" width="200" height="260" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
        {/* Spine */}
        <rect x="20" y="100" width="14" height="260" rx="2" fill="#222" />
        {/* Left page */}
        <rect x="34" y="108" width="86" height="244" fill="#e8e8e8" />
        {/* Right page */}
        <rect x="122" y="108" width="90" height="244" fill="#f0f0f0" />
        {/* Center gutter shadow */}
        <rect x="118" y="108" width="8" height="244" fill="#ccc" opacity="0.5" />
        {/* Text lines left page */}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(i => (
          <rect key={i} x="40" y={118 + i * 12} width={i % 5 === 4 ? 55 : 74} height="1.5" fill="#888" opacity="0.7" />
        ))}
        {/* Bold heading left */}
        <rect x="40" y="116" width="60" height="3" fill="#444" />
        {/* Text lines right page */}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(i => (
          <rect key={i} x="128" y={118 + i * 12} width={i % 4 === 3 ? 50 : 72} height="1.5" fill="#888" opacity="0.7" />
        ))}
        {/* Chapter number */}
        <text x="128" y="145" fontSize="28" fill="#555" fontFamily="Georgia, serif" fontWeight="bold">3</text>
        {/* Book title on spine */}
        <text x="27" y="230" fontSize="7" fill="#999" fontFamily="Georgia, serif" writingMode="tb">HABACUQUE</text>
      </g>

      {/* Book 2 — center, rotated 20deg */}
      <g transform="rotate(20 240 500)">
        <rect x="130" y="380" width="220" height="280" rx="4" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1.5" />
        <rect x="130" y="380" width="14" height="280" rx="2" fill="#1a1a1a" />
        <rect x="144" y="389" width="96" height="262" fill="#e5e5e5" />
        <rect x="242" y="389" width="100" height="262" fill="#efefef" />
        <rect x="238" y="389" width="8" height="262" fill="#bbb" opacity="0.4" />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(i => (
          <rect key={i} x="150" y={399 + i * 11} width={i % 6 === 5 ? 60 : 82} height="1.5" fill="#777" opacity="0.7" />
        ))}
        <rect x="150" y="397" width="70" height="3" fill="#333" />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(i => (
          <rect key={i} x="248" y={399 + i * 11} width={i % 5 === 4 ? 55 : 84} height="1.5" fill="#777" opacity="0.7" />
        ))}
        <text x="150" y="428" fontSize="22" fill="#444" fontFamily="Georgia, serif" fontWeight="bold">1</text>
        <text x="150" y="406" fontSize="6" fill="#666" fontFamily="Georgia, serif" letterSpacing="1">SOFONIAS 1-2</text>
        <text x="137" y="520" fontSize="7" fill="#888" fontFamily="Georgia, serif" writingMode="tb">SOFONIAS</text>
      </g>

      {/* Book 3 — bottom-right, rotated -15deg */}
      <g transform="rotate(-15 310 720)">
        <rect x="180" y="600" width="200" height="250" rx="4" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="1.5" />
        <rect x="180" y="600" width="14" height="250" rx="2" fill="#1e1e1e" />
        <rect x="194" y="608" width="86" height="234" fill="#e8e8e8" />
        <rect x="282" y="608" width="90" height="234" fill="#f2f2f2" />
        <rect x="278" y="608" width="8" height="234" fill="#c0c0c0" opacity="0.4" />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => (
          <rect key={i} x="200" y={618 + i * 12} width={i % 5 === 4 ? 55 : 72} height="1.5" fill="#888" opacity="0.7" />
        ))}
        <rect x="200" y="617" width="55" height="2.5" fill="#444" />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => (
          <rect key={i} x="288" y={618 + i * 12} width={i % 4 === 3 ? 50 : 74} height="1.5" fill="#888" opacity="0.7" />
        ))}
        <text x="187" y="720" fontSize="7" fill="#999" fontFamily="Georgia, serif" writingMode="tb">LIVRO DE JONAS</text>
      </g>

      {/* Laptop keyboard hint — top-right */}
      <g transform="rotate(30 350 80)" opacity="0.6">
        <rect x="230" y="-60" width="220" height="160" rx="8" fill="#0a0a0a" stroke="#222" strokeWidth="1" />
        {/* Key rows */}
        {[0,1,2,3].map(row => (
          [0,1,2,3,4,5,6,7,8,9].map(col => (
            <rect key={`${row}-${col}`}
              x={238 + col * 20} y={-52 + row * 32}
              width="15" height="24" rx="3"
              fill="#1a1a1a" stroke="#333" strokeWidth="0.5"
            />
          ))
        ))}
      </g>

      {/* Subtle cross watermark center */}
      <g opacity="0.06">
        <rect x="185" y="320" width="20" height="80" rx="3" fill="white" />
        <rect x="165" y="345" width="60" height="20" rx="3" fill="white" />
      </g>
    </svg>
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
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#0d0d0d' }}>
      <BibleBackground />

      {/* Gradient overlay to darken bottom where form sits */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.7) 40%, rgba(13,13,13,0.92) 100%)',
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
