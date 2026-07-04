import { useState } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'
import DarkGrainBackground from '../components/DarkGrainBackground'

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
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.92)', marginBottom: 6 }}>
            HolyFlow
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
