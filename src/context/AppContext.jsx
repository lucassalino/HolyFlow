import { createContext, useContext, useState, useCallback } from 'react'
import { sb } from '../supabase'

const AppContext = createContext(null)

const LAST_ORG_KEY = 'holyflow_last_org_id'

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('loading')
  const [sessaoAtual, setSessaoAtual] = useState(null)
  const [membroAtual, setMembroAtual] = useState(null)
  const [organizacaoAtual, setOrganizacaoAtual] = useState(null)
  const [minhasOrgs, setMinhasOrgs] = useState([])

  const [roteiros, setRoteiros] = useState([])

  const [editandoIdx, setEditandoIdx] = useState(null)
  const [momentos, setMomentos] = useState([])
  const [momentoEditandoIdx, setMomentoEditandoIdx] = useState(null)
  const [editorNome, setEditorNome] = useState('')
  const [editorData, setEditorData] = useState('')
  const [editorTema, setEditorTema] = useState('')
  const [editorVersiculo, setEditorVersiculo] = useState('')

  const navigate = useCallback((s) => setScreen(s), [])

  const _limparEstadoOrg = useCallback(() => {
    setMembroAtual(null)
    setOrganizacaoAtual(null)
    setRoteiros([])
    localStorage.removeItem(LAST_ORG_KEY)
  }, [])

  const logout = useCallback(async () => {
    await sb.auth.signOut()
    _limparEstadoOrg()
    setSessaoAtual(null)
    setMinhasOrgs([])
    navigate('auth')
  }, [navigate, _limparEstadoOrg])

  const carregarRoteirosDaNuvem = useCallback(async (orgId) => {
    const { data, error } = await sb.from('roteiros')
      .select('*').eq('organizacao_id', orgId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return (data || []).map(r => ({
      id: r.id, nome: r.nome, data: r.data,
      tema: r.tema || '', versiculo: r.versiculo || '',
      momentos: r.momentos || [],
    }))
  }, [])

  const entrarNaApp = useCallback(async (membro, org) => {
    localStorage.setItem(LAST_ORG_KEY, org.id)
    const lista = await carregarRoteirosDaNuvem(org.id)
    setRoteiros(lista)
    navigate('lista')
  }, [carregarRoteirosDaNuvem, navigate])

  const selecionarOrg = useCallback(async (membro, org) => {
    setMembroAtual(membro)
    setOrganizacaoAtual(org)
    if (membro.status === 'pendente') {
      navigate('pendente')
    } else {
      await entrarNaApp(membro, org)
    }
  }, [entrarNaApp, navigate])

  const trocarOrg = useCallback(() => {
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [navigate, _limparEstadoOrg])

  const sairDaOrg = useCallback(async () => {
    if (!membroAtual?.id || !organizacaoAtual?.id) return

    // Verificar quantos membros aprovados existem na org
    const { count, error: countError } = await sb
      .from('membros')
      .select('id', { count: 'exact', head: true })
      .eq('organizacao_id', organizacaoAtual.id)
      .eq('status', 'aprovado')

    if (countError) { alert('Erro ao verificar membros.'); return }

    const ultimoMembro = count === 1

    const mensagem = ultimoMembro
      ? `És o último membro de "${organizacaoAtual.nome}".\n\nAo saíres, a organização e todos os seus dados (roteiros, membros) serão apagados permanentemente.\n\nTens a certeza?`
      : `Tens a certeza que queres sair de "${organizacaoAtual.nome}"?`

    if (!confirm(mensagem)) return

    if (ultimoMembro) {
      // Apagar a org inteira (cascade elimina membros + roteiros)
      const { error } = await sb.from('organizacoes').delete().eq('id', organizacaoAtual.id)
      if (error) { alert('Erro ao apagar organização: ' + error.message); return }
    } else {
      const { error } = await sb.from('membros').delete().eq('id', membroAtual.id)
      if (error) { alert('Erro ao sair: ' + error.message); return }
    }

    const novasOrgs = minhasOrgs.filter(m => m.id !== membroAtual.id)
    setMinhasOrgs(novasOrgs)
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [membroAtual, organizacaoAtual, minhasOrgs, navigate, _limparEstadoOrg])

  const excluirOrg = useCallback(async () => {
    if (!organizacaoAtual?.id) return
    if (!confirm(`Tens a certeza que queres apagar "${organizacaoAtual.nome}"?\n\nEsta ação é irreversível. Todos os membros e roteiros serão apagados permanentemente.`)) return

    const { error } = await sb.from('organizacoes').delete().eq('id', organizacaoAtual.id)
    if (error) { alert('Erro ao apagar organização: ' + error.message); return }

    const novasOrgs = minhasOrgs.filter(m => m.organizacoes?.id !== organizacaoAtual.id)
    setMinhasOrgs(novasOrgs)
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [organizacaoAtual, minhasOrgs, navigate, _limparEstadoOrg])

  const depoisDoLogin = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { navigate('auth'); return }

    const { data: membros, error } = await sb
      .from('membros')
      .select('*, organizacoes(id, nome, codigo)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) { console.error(error); navigate('org-escolha'); return }

    if (!membros || !membros.length) {
      setMinhasOrgs([])
      navigate('org-escolha')
      return
    }

    setMinhasOrgs(membros)

    const aprovados = membros.filter(m => m.status === 'aprovado')
    const pendentes = membros.filter(m => m.status === 'pendente')

    if (aprovados.length === 0 && pendentes.length === 1) {
      setMembroAtual(pendentes[0])
      setOrganizacaoAtual(pendentes[0].organizacoes)
      navigate('pendente')
      return
    }

    if (aprovados.length === 0) {
      navigate('org-escolha')
      return
    }

    const lastOrgId = localStorage.getItem(LAST_ORG_KEY)
    const ultimaMembro = lastOrgId
      ? aprovados.find(m => m.organizacoes?.id === lastOrgId)
      : null

    const membroParaEntrar = ultimaMembro || aprovados[0]
    const org = membroParaEntrar.organizacoes
    setMembroAtual(membroParaEntrar)
    setOrganizacaoAtual(org)
    await entrarNaApp(membroParaEntrar, org)
  }, [navigate, entrarNaApp])

  const abrirNovoRoteiro = useCallback(() => {
    setEditandoIdx(null)
    setEditorNome('')
    setEditorData(new Date().toISOString().split('T')[0])
    setEditorTema('')
    setEditorVersiculo('')
    setMomentos([])
    navigate('editor')
  }, [navigate])

  const abrirRoteiro = useCallback((i, lista) => {
    const r = lista[i]
    setEditandoIdx(i)
    setEditorNome(r.nome)
    setEditorData(r.data || '')
    setEditorTema(r.tema || '')
    setEditorVersiculo(r.versiculo || '')
    setMomentos(JSON.parse(JSON.stringify(r.momentos)))
    navigate('editor')
  }, [navigate])

  return (
    <AppContext.Provider value={{
      screen, navigate,
      sessaoAtual, setSessaoAtual,
      membroAtual, setMembroAtual,
      organizacaoAtual, setOrganizacaoAtual,
      minhasOrgs, setMinhasOrgs,
      roteiros, setRoteiros,
      editandoIdx, setEditandoIdx,
      momentos, setMomentos,
      momentoEditandoIdx, setMomentoEditandoIdx,
      editorNome, setEditorNome,
      editorData, setEditorData,
      editorTema, setEditorTema,
      editorVersiculo, setEditorVersiculo,
      logout, depoisDoLogin, entrarNaApp, selecionarOrg, trocarOrg, sairDaOrg, excluirOrg,
      carregarRoteirosDaNuvem,
      abrirNovoRoteiro, abrirRoteiro,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
