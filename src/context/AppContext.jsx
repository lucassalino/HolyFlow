import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { sb } from '../supabase'

const AppContext = createContext(null)
const LAST_ORG_KEY = 'holyflow_last_org_id'

function DialogModal({ dialogo, onClose }) {
  const isConfirm = dialogo.type === 'confirm'
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(false); if (e.key === 'Enter' && !isConfirm) onClose(true) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isConfirm, onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--bg2)',
        borderRadius: 20,
        padding: '24px',
        width: '100%',
        maxWidth: 320,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        border: '1px solid var(--border)',
      }}>
        {dialogo.title && (
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: 'var(--text)' }}>
            {dialogo.title}
          </div>
        )}
        <div style={{
          fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-line',
          color: dialogo.title ? 'var(--text2)' : 'var(--text)',
        }}>
          {dialogo.message}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {isConfirm && (
            <button
              onClick={() => onClose(false)}
              style={{
                flex: 1, padding: '11px', borderRadius: 10, border: 'none',
                background: 'var(--bg3)', color: 'var(--text2)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >Cancelar</button>
          )}
          <button
            onClick={() => onClose(true)}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: 'none',
              background: (isConfirm && dialogo.danger) ? 'var(--danger)' : 'var(--accent)',
              color: (isConfirm && dialogo.danger) ? '#fff' : 'var(--accent-text)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >{isConfirm ? (dialogo.confirmLabel || 'Confirmar') : 'OK'}</button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [message, onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1001,
      background: 'rgba(28,28,36,0.96)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 100,
      padding: '10px 20px',
      fontSize: 14, fontWeight: 500, color: '#f0f0f5',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

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

  const [dialogo, setDialogo] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  const navigate = useCallback((s) => setScreen(s), [])

  const showAlert = useCallback((message, title) => {
    return new Promise(resolve => setDialogo({ type: 'alert', title, message, resolve }))
  }, [])

  const showConfirm = useCallback(({ message, title, confirmLabel = 'Confirmar', danger = false }) => {
    return new Promise(resolve => setDialogo({ type: 'confirm', title, message, confirmLabel, danger, resolve }))
  }, [])

  const showToast = useCallback((message) => {
    setToastMsg(null)
    requestAnimationFrame(() => setToastMsg(message))
  }, [])

  const fecharDialogo = useCallback((result) => {
    setDialogo(prev => { if (prev?.resolve) prev.resolve(result); return null })
  }, [])

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
    if (membro.status === 'pendente') navigate('pendente')
    else await entrarNaApp(membro, org)
  }, [entrarNaApp, navigate])

  const trocarOrg = useCallback(() => {
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [navigate, _limparEstadoOrg])

  const sairDaOrg = useCallback(async () => {
    if (!membroAtual?.id || !organizacaoAtual?.id) return

    const { count, error: countError } = await sb
      .from('membros')
      .select('id', { count: 'exact', head: true })
      .eq('organizacao_id', organizacaoAtual.id)
      .eq('status', 'aprovado')

    if (countError) { await showAlert('Erro ao verificar membros.'); return }

    const ultimoMembro = count === 1
    const ok = await showConfirm(ultimoMembro ? {
      title: 'Sair da organização',
      message: `És o último membro de "${organizacaoAtual.nome}".\n\nAo saíres, a organização e todos os seus dados (roteiros, membros) serão apagados permanentemente.`,
      confirmLabel: 'Sair e Apagar',
      danger: true,
    } : {
      message: `Tens a certeza que queres sair de "${organizacaoAtual.nome}"?`,
      confirmLabel: 'Sair',
      danger: true,
    })
    if (!ok) return

    if (ultimoMembro) {
      const { error } = await sb.from('organizacoes').delete().eq('id', organizacaoAtual.id)
      if (error) { await showAlert('Erro ao apagar organização: ' + error.message); return }
    } else {
      const { error } = await sb.from('membros').delete().eq('id', membroAtual.id)
      if (error) { await showAlert('Erro ao sair: ' + error.message); return }
    }

    const novasOrgs = minhasOrgs.filter(m => m.id !== membroAtual.id)
    setMinhasOrgs(novasOrgs)
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [membroAtual, organizacaoAtual, minhasOrgs, navigate, _limparEstadoOrg, showAlert, showConfirm])

  const excluirOrg = useCallback(async () => {
    if (!organizacaoAtual?.id) return
    const ok = await showConfirm({
      title: 'Excluir organização',
      message: `Tens a certeza que queres apagar "${organizacaoAtual.nome}"?\n\nTodos os membros e roteiros serão apagados permanentemente.`,
      confirmLabel: 'Excluir',
      danger: true,
    })
    if (!ok) return

    const { error } = await sb.from('organizacoes').delete().eq('id', organizacaoAtual.id)
    if (error) { await showAlert('Erro ao apagar organização: ' + error.message); return }

    const novasOrgs = minhasOrgs.filter(m => m.organizacoes?.id !== organizacaoAtual.id)
    setMinhasOrgs(novasOrgs)
    _limparEstadoOrg()
    navigate('org-escolha')
  }, [organizacaoAtual, minhasOrgs, navigate, _limparEstadoOrg, showAlert, showConfirm])

  const depoisDoLogin = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { navigate('auth'); return }

    const { data: membros, error } = await sb
      .from('membros')
      .select('*, organizacoes(id, nome, codigo)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) { console.error(error); navigate('org-escolha'); return }

    if (!membros || !membros.length) { setMinhasOrgs([]); navigate('org-escolha'); return }

    setMinhasOrgs(membros)
    const aprovados = membros.filter(m => m.status === 'aprovado')
    const pendentes = membros.filter(m => m.status === 'pendente')

    if (aprovados.length === 0 && pendentes.length === 1) {
      setMembroAtual(pendentes[0]); setOrganizacaoAtual(pendentes[0].organizacoes); navigate('pendente'); return
    }
    if (aprovados.length === 0) { navigate('org-escolha'); return }

    const lastOrgId = localStorage.getItem(LAST_ORG_KEY)
    const ultimaMembro = lastOrgId ? aprovados.find(m => m.organizacoes?.id === lastOrgId) : null
    const membroParaEntrar = ultimaMembro || aprovados[0]
    const org = membroParaEntrar.organizacoes
    setMembroAtual(membroParaEntrar)
    setOrganizacaoAtual(org)
    await entrarNaApp(membroParaEntrar, org)
  }, [navigate, entrarNaApp])

  const abrirNovoRoteiro = useCallback(() => {
    setEditandoIdx(null); setEditorNome(''); setEditorData(new Date().toISOString().split('T')[0])
    setEditorTema(''); setEditorVersiculo(''); setMomentos([]); navigate('editor')
  }, [navigate])

  const abrirRoteiro = useCallback((i, lista) => {
    const r = lista[i]
    setEditandoIdx(i); setEditorNome(r.nome); setEditorData(r.data || '')
    setEditorTema(r.tema || ''); setEditorVersiculo(r.versiculo || '')
    setMomentos(JSON.parse(JSON.stringify(r.momentos))); navigate('editor')
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
      carregarRoteirosDaNuvem, abrirNovoRoteiro, abrirRoteiro,
      showAlert, showConfirm, showToast,
    }}>
      {children}
      {dialogo && <DialogModal dialogo={dialogo} onClose={fecharDialogo} />}
      {toastMsg && <Toast key={toastMsg + Date.now()} message={toastMsg} onDone={() => setToastMsg(null)} />}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
