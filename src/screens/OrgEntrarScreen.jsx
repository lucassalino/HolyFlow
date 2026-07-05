import { useState } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgEntrarScreen() {
  const { navigate, setMembroAtual, setOrganizacaoAtual, setMinhasOrgs, minhasOrgs, selecionarOrg } = useApp()
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

      const { data: org, error: orgErr } = await sb
        .from('organizacoes').select('*').eq('codigo', c).maybeSingle()
      if (orgErr) throw orgErr
      if (!org) { setErro('Código não encontrado.'); setLoading(false); return }

      // verificar se já é membro
      const { data: membroExistente } = await sb
        .from('membros').select('*')
        .eq('user_id', user.id)
        .eq('organizacao_id', org.id)
        .maybeSingle()

      if (membroExistente) {
        if (membroExistente.status === 'aprovado') {
          setErro('Já és membro desta organização.')
        } else if (membroExistente.status === 'pendente') {
          // redirecionar para pendente
          setMembroAtual(membroExistente)
          setOrganizacaoAtual(org)
          navigate('pendente')
        } else if (membroExistente.status === 'rejeitado') {
          setErro('O teu pedido foi rejeitado. Contacta o administrador.')
        }
        setLoading(false)
        return
      }

      const nomeUtilizador = user.user_metadata?.nome || user.email
      const { data: membro, error: memErr } = await sb
        .from('membros')
        .insert({ user_id: user.id, organizacao_id: org.id, nome: nomeUtilizador, role: 'membro', status: 'pendente' })
        .select().single()
      if (memErr) throw memErr

      setMinhasOrgs([...minhasOrgs, { ...membro, organizacoes: org }])
      setMembroAtual(membro)
      setOrganizacaoAtual(org)
      navigate('pendente')
    } catch (err) {
      setErro(err.message || 'Erro ao processar o pedido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('org-escolha')}>
          <Icon name="chevron-left" size={20} />
        </button>
        <span className="header-title">Entrar com Código</span>
      </div>
      <div className="content">
        {erro && <div className="auth-error">{erro}</div>}
        <div className="campo">
          <label>Código da organização</label>
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && entrar()}
            placeholder="Ex: IGREJA-X7K2"
            style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}
          />
        </div>
        <button className="btn-primary btn-accent" onClick={entrar} disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'A processar...' : 'Pedir para Entrar'}
        </button>
      </div>
    </div>
  )
}
