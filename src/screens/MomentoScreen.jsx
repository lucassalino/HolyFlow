import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

const OPCOES = ['Oração','Louvor','Dízimos / Ofertas','Oração p/ Crianças','Visitantes','Avisos','Ministração','Palavra','Ceia do Senhor','Testemunho','Encerramento']

export default function MomentoScreen() {
  const { momentos, setMomentos, momentoEditandoIdx, navigate } = useApp()
  const editando = momentoEditandoIdx !== null ? momentos[momentoEditandoIdx] : null
  const [sel, setSel] = useState(editando ? (OPCOES.includes(editando.nome) ? editando.nome : 'outro') : '')
  const [custom, setCustom] = useState(editando && !OPCOES.includes(editando.nome) ? editando.nome : '')
  const [tipo, setTipo] = useState(editando?.tipo || 'pessoa')
  const [responsavel, setResponsavel] = useState(editando?.responsavel || '')
  const [duracao, setDuracao] = useState(editando?.duracao || '')
  const [obs, setObs] = useState(editando?.obs || '')
  const [palavraTema, setPalavraTema] = useState(editando?.palavraTema || '')
  const [palavraTexto, setPalavraTexto] = useState(editando?.palavraTexto || '')
  const [musicas, setMusicas] = useState(editando?.musicas?.length ? [...editando.musicas] : [])
  const [avisos, setAvisos] = useState(editando?.avisos?.length ? [...editando.avisos] : [])

  const onSelectChange = (v) => { setSel(v); if (v === 'Louvor' && !musicas.length) setMusicas(['']); if (v === 'Avisos' && !avisos.length) setAvisos(['']) }

  const confirmar = () => {
    const nome = sel === 'outro' ? custom.trim() : sel
    if (!nome) return
    const novoMomento = { nome, tipo, responsavel: tipo === 'pessoa' ? responsavel.trim() : '', obs: obs.trim(), duracao: duracao.trim(), palavraTema: (sel === 'Palavra' || sel === 'Ministração') ? palavraTema.trim() : '', palavraTexto: (sel === 'Palavra' || sel === 'Ministração') ? palavraTexto.trim() : '', musicas: sel === 'Louvor' ? musicas.filter(x => x.trim()) : [], avisos: sel === 'Avisos' ? avisos.filter(x => x.trim()) : [] }
    const novo = [...momentos]
    if (momentoEditandoIdx !== null) novo[momentoEditandoIdx] = novoMomento
    else novo.push(novoMomento)
    setMomentos(novo)
    navigate('editor')
  }

  const updateMusica = (i, v) => { const a = [...musicas]; a[i] = v; setMusicas(a) }
  const addMusica = () => setMusicas([...musicas, ''])
  const removeMusica = (i) => { const a = [...musicas]; a.splice(i, 1); setMusicas(a) }
  const updateAviso = (i, v) => { const a = [...avisos]; a[i] = v; setAvisos(a) }
  const addAviso = () => setAvisos([...avisos, ''])
  const removeAviso = (i) => { const a = [...avisos]; a.splice(i, 1); setAvisos(a) }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('editor')}><Icon name="chevron-left" size={20} /></button>
        <span className="header-title">{momentoEditandoIdx !== null ? 'Editar Momento' : 'Adicionar Momento'}</span>
      </div>
      <div className="content">
        <div className="campo">
          <label>Tipo de momento</label>
          <select value={sel} onChange={e => onSelectChange(e.target.value)}>
            <option value="">— Escolhe um momento —</option>
            {OPCOES.map(o => <option key={o} value={o}>{o}</option>)}
            <option value="outro">Outro (escrever à mão)</option>
          </select>
        </div>
        {sel === 'outro' && <div className="campo"><label>Nome personalizado</label><input type="text" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Escreve o nome do momento..." autoFocus /></div>}
        {sel === 'Louvor' && <div className="extra-section"><div className="extra-section-title">Músicas do Louvor</div>{musicas.map((v, i) => (<div key={i} className="extra-row"><input type="text" placeholder="Nome da música..." value={v} onChange={e => updateMusica(i, e.target.value)} /><button className="btn-del" onClick={() => removeMusica(i)}><Icon name="x" size={15} /></button></div>))}<button className="btn-add-extra" onClick={addMusica}><Icon name="plus" size={15} /> Adicionar música</button></div>}
        {sel === 'Avisos' && <div className="extra-section"><div className="extra-section-title">Lista de Avisos</div>{avisos.map((v, i) => (<div key={i} className="extra-row"><input type="text" placeholder="Texto do aviso..." value={v} onChange={e => updateAviso(i, e.target.value)} /><button className="btn-del" onClick={() => removeAviso(i)}><Icon name="x" size={15} /></button></div>))}<button className="btn-add-extra" onClick={addAviso}><Icon name="plus" size={15} /> Adicionar aviso</button></div>}
        {(sel === 'Palavra' || sel === 'Ministração') && <div className="extra-section"><div className="extra-section-title">Detalhes da Palavra</div><div className="extra-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}><input type="text" placeholder="Tema da mensagem..." value={palavraTema} onChange={e => setPalavraTema(e.target.value)} style={{ padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit' }} /><input type="text" placeholder="Texto bíblico (ex: João 3:16)..." value={palavraTexto} onChange={e => setPalavraTexto(e.target.value)} style={{ padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '14px', fontFamily: 'inherit' }} /></div></div>}
        <div className="campo"><label>Tipo de responsável</label><div className="tipo-selector">{['pessoa', 'video', 'projecao'].map(t => (<button key={t} className={`tipo-btn${tipo === t ? ' selected' : ''}`} onClick={() => setTipo(t)}>{t === 'pessoa' ? 'Pessoa' : t === 'video' ? 'Vídeo' : 'Projeção'}</button>))}</div></div>
        {tipo === 'pessoa' && <div className="campo"><label>Nome do responsável</label><input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} /></div>}
        <div className="campo"><label>Duração (opcional)</label><input type="text" value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="Ex: 5 min, 25 min..." /></div>
        <div className="campo"><label>Observações (opcional)</label><input type="text" value={obs} onChange={e => setObs(e.target.value)} /></div>
        <div style={{ marginTop: '8px', marginBottom: '24px' }}><button className="btn-primary btn-accent" onClick={confirmar}><Icon name="check" size={18} color="var(--accent-text)" />{momentoEditandoIdx !== null ? 'Guardar alterações' : 'Adicionar'}</button></div>
      </div>
    </div>
  )
}
