import { useState } from 'react'
import { sb } from '../supabase'
import { gerarCodigoOrganizacao, traduzirErroAuth } from '../utils/auth'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgCriarScreen() {
  const { navigate, setMembroAtual, setOrganizacaoAtual } = useApp()
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const criar = async () => {
    setErro('')
    if (!nome.trim()) { setErro('Diz o nome da organização.'); return }
    setLoading(true)
    try {
      const { data: { user } } = await sb.auth.getUser()
      const codigo = gerarCodigoOrganizacao(nome.trim())
      const { data: org, error: orgErr } = await sb.from('organizacoes').insert({ nome: nome.trim(), codigo, criado_por: user.id }).select().single()
      if (orgErr) throw orgErr
      const nomeUtilizador = user.user_metadata?.nome || user.email
      const { data: membro, error: memErr } = await sb.from('membros').insert({ user_id: user.id, organizacao_id: org.id, nome: nomeUtilizador, role: 'admin', status: 'aprovado' }).select().single()
      if (memErr) throw memErr
      setMembroAtual(membro); setOrganizacaoAtual(org); navigate('org-codigo')
    } catch (err) {
      setErro(traduzirErroAuth(err.message))
    } finally { setLoading(false) }
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('org-escolha')}>
          <Icon name="chevron-left" size={20} />
        </button>
        <span className="header-title">Criar Organização</span>
      </div>
      <div className="content">
        {erro && <div className="auth-error">{erro}</div>}
        <div className="campo">
          <label>Nome da organização</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && criar()} placeholder="Ex: Igreja Aliança Vizela" />
        </div>
        <button className="btn-primary btn-accent" onClick={criar} disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'A criar...' : 'Criar Organização'}
        </button>
      </div>
    </div>
  )
}
