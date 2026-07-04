import { createContext, useContext, useState, useCallback } from 'react'
import { sb } from '../supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('loading')
  const [sessaoAtual, setSessaoAtual] = useState(null)
  const [membroAtual, setMembroAtual] = useState(null)
  const [organizacaoAtual, setOrganizacaoAtual] = useState(null)

  const [roteiros, setRoteiros] = useState([])

  const [editandoIdx, setEditandoIdx] = useState(null)
  const [momentos, setMomentos] = useState([])
  const [momentoEditandoIdx, setMomentoEditandoIdx] = useState(null)
  const [editorNome, setEditorNome] = useState('')
  const [editorData, setEditorData] = useState('')
  const [editorTema, setEditorTema] = useState('')
  const [editorVersiculo, setEditorVersiculo] = useState('')
  const [editorStatus, setEditorStatus] = useState('rascunho')

  const navigate = useCallback((s) => setScreen(s), [])

  const logout = useCallback(async () => {
    await sb.auth.signOut()
    setSessaoAtual(null)
    setMembroAtual(null)
    setOrganizacaoAtual(null)
    setRoteiros([])
    navigate('auth')
  }, [navigate])

  const carregarRoteirosDaNuvem = useCallback(async (orgId) => {
    const { data, error } = await sb.from('roteiros')
      .select('*').eq('organizacao_id', orgId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return (data || []).map(r => ({
      id: r.id, nome: r.nome, data: r.data,
      tema: r.tema || '', versiculo: r.versiculo || '',
      momentos: r.momentos || [],
      status: r.status || 'rascunho',
      criado_por: r.criado_por,
    }))
  }, [])

  const entrarNaApp = useCallback(async (membro, org) => {
    const lista = await carregarRoteirosDaNuvem(org.id)
    setRoteiros(lista)
    navigate('lista')
  }, [carregarRoteirosDaNuvem, navigate])

  const depoisDoLogin = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { navigate('auth'); return }

    const { data: membros, error } = await sb
      .from('membros')
      .select('*, organizacoes(id, nome, codigo)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) { console.error(error); navigate('org-escolha'); return }
    if (!membros || !membros.length) { navigate('org-escolha'); return }

    const membro = membros[0]
    const org = membros[0].organizacoes
    setMembroAtual(membro)
    setOrganizacaoAtual(org)

    if (membro.status === 'pendente') navigate('pendente')
    else if (membro.status === 'rejeitado') navigate('org-escolha')
    else await entrarNaApp(membro, org)
  }, [navigate, entrarNaApp])

  const abrirNovoRoteiro = useCallback(() => {
    setEditandoIdx(null)
    setEditorNome('')
    setEditorData(new Date().toISOString().split('T')[0])
    setEditorTema('')
    setEditorVersiculo('')
    setEditorStatus('rascunho')
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
    setEditorStatus(r.status || 'rascunho')
    setMomentos(JSON.parse(JSON.stringify(r.momentos)))
    navigate('editor')
  }, [navigate])

  return (
    <AppContext.Provider value={{
      screen, navigate,
      sessaoAtual, setSessaoAtual,
      membroAtual, setMembroAtual,
      organizacaoAtual, setOrganizacaoAtual,
      roteiros, setRoteiros,
      editandoIdx, setEditandoIdx,
      momentos, setMomentos,
      momentoEditandoIdx, setMomentoEditandoIdx,
      editorNome, setEditorNome,
      editorData, setEditorData,
      editorTema, setEditorTema,
      editorVersiculo, setEditorVersiculo,
      editorStatus, setEditorStatus,
      logout, depoisDoLogin, entrarNaApp,
      carregarRoteirosDaNuvem,
      abrirNovoRoteiro, abrirRoteiro,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
