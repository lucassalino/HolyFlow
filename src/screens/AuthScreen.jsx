import { useState } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'

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
    <div className="screen">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="emoji">📋</div>
          <h1>Roteiro do Culto</h1>
          <p>Cria e partilha roteiros com a tua equipa</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${modo === 'login' ? ' active' : ''}`} onClick={() => mudarModo('login')}>Entrar</button>
          <button className={`auth-tab${modo === 'registo' ? ' active' : ''}`} onClick={() => mudarModo('registo')}>Criar Conta</button>
        </div>

        {erro && <div className="auth-error">{erro}</div>}

        {modo === 'registo' && (
          <div className="campo">
            <label>O teu nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={onKey} autoComplete="name" placeholder="João Silva" />
          </div>
        )}
        <div className="campo">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoComplete="email" placeholder="email@exemplo.com" />
        </div>
        <div className="campo">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} autoComplete="current-password" placeholder="••••••••" />
        </div>

        <button className="btn-primary btn-accent" onClick={submeter} disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'A processar...' : modo === 'registo' ? 'Criar Conta' : 'Entrar'}
        </button>

        <div className="auth-link">
          {modo === 'login'
            ? <>Ainda não tens conta? <span onClick={() => mudarModo('registo')}>Criar conta</span></>
            : <>Já tens conta? <span onClick={() => mudarModo('login')}>Entrar</span>}
        </div>
      </div>
    </div>
  )
}
