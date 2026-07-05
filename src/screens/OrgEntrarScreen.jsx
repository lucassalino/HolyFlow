import { useState } from 'react'
import { sb } from '../supabase'
import { traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgEntrarScreen() {
  const { navigate, setMembroAtual, setOrganizacaoAtual } = useApp()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const entrar = async () => {
    setErro('')
    const c = codigo.trim().toUpperCase()
    if (!c) { setErro('Insere o código da organização.'); return }
    setLoading(true)
    try {
      const { data: { user } } = await sb.auth.getUser()
      const { data: org, error: orgErr } = await sb.from('organizacoes').select('*').eq('codigo', c).maybeSingle()
      if (orgErr) throw orgErr
      if (!org) { setErro('Código não encontrado.'); setLoading(false); return }
      const nomeUtilizador = user.user_metadata?.nome || user.email
      const { data: membro, error: memErr } = await sb.from('membros').insert({ user_id: user.id, organizacao_id: org.id, nome: nomeUtilizador, role: 'membro', status: 'pendente' }).select().single()
      if (memErr) throw memErr
      setMembroAtual(membro); setOrganizacaoAtual(org); navigate('pendente')
    } catch (err) { setErro(traduzirErroAuth(err.message)) } finally { setLoading(false) }
  }

  return (
    <div className="screen">
      <div className="header"><button className="btn-back" onClick={() => navigate('org-escolha')}><Icon name="chevron-left" size={20} /></button><span className="header-title">Entrar com Código</span></div>
      <div className="content">
        {erro && <div className="auth-error">{erro}</div>}
        <div className="campo"><label>Código da organização</label><input type="text" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && entrar()} placeholder="Ex: IGREJA-X7K2" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }} /></div>
        <button className="btn-primary btn-accent" onClick={entrar} disabled={loading} style={{ marginTop: '8px' }}>{loading ? 'A processar...' : 'Pedir para Entrar'}</button>
      </div>
    </div>
  )
}
