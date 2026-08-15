import { useState } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { GrainBackground } from './AuthScreen'

export default function NovaSenhaScreen() {
  const { navigate, depoisDoLogin, setSessaoAtual } = useApp()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const submeter = async () => {
    setErro('')
    if (!password || !confirmar) { setErro('Preenche os dois campos.'); return }
    if (password.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirmar) { setErro('As senhas não coincidem.'); return }
    setLoading(true)
    try {
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error
      setSucesso(true)
      setTimeout(async () => {
        const { data: { session } } = await sb.auth.getSession()
        if (session) {
          setSessaoAtual(session)
          await depoisDoLogin()
        } else {
          navigate('auth')
        }
      }, 1800)
    } catch (err) {
      setErro(err.message || 'Erro ao atualizar a senha.')
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
          </div>

          <div style={{
            background: 'rgba(28,28,36,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius)',
            padding: '22px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {sucesso ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Senha atualizada!</div>
                <div style={{ color: 'rgba(240,240,245,0.55)', fontSize: 14 }}>A entrar na app...</div>
              </div>
            ) : (
              <>
                <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Nova senha</div>
                <div style={{ color: 'rgba(240,240,245,0.45)', fontSize: 13, marginBottom: 16 }}>Define a tua nova senha abaixo.</div>
                {erro && <div className="auth-error">{erro}</div>}
                <div className="campo">
                  <label style={{ color: 'rgba(255,255,255,0.4)' }}>Nova senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey}
                    autoComplete="new-password" placeholder="••••••••"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div className="campo" style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmar senha</label>
                  <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} onKeyDown={onKey}
                    autoComplete="new-password" placeholder="••••••••"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <button className="btn-primary btn-accent" onClick={submeter} disabled={loading}
                  style={{ background: '#f0f0f5', color: '#0d0d0d', border: 'none' }}>
                  {loading ? 'A guardar...' : 'Guardar nova senha'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
