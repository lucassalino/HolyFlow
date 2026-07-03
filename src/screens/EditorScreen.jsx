import { useRef } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'

export default function EditorScreen() {
  const {
    organizacaoAtual, editandoIdx, roteiros,
    momentos, setMomentos,
    setMomentoEditandoIdx,
    editorNome, setEditorNome,
    editorData, setEditorData,
    editorTema, setEditorTema,
    editorVersiculo, setEditorVersiculo,
    navigate, carregarRoteirosDaNuvem, setRoteiros,
  } = useApp()

  const dragSrcIdx = useRef(null)

  const guardar = async () => {
    const payload = {
      nome: editorNome.trim() || 'Sem título',
      data: editorData || null,
      tema: editorTema.trim(),
      versiculo: editorVersiculo.trim(),
      momentos: JSON.parse(JSON.stringify(momentos)),
    }
    try {
      if (editandoIdx !== null) {
        const { error } = await sb.from('roteiros')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', roteiros[editandoIdx].id)
        if (error) throw error
      } else {
        const { data: { user } } = await sb.auth.getUser()
        const { error } = await sb.from('roteiros')
          .insert({ ...payload, organizacao_id: organizacaoAtual.id, criado_por: user.id })
        if (error) throw error
      }
      const lista = await carregarRoteirosDaNuvem(organizacaoAtual.id)
      setRoteiros(lista)
      navigate('lista')
    } catch (err) {
      alert('Erro ao guardar: ' + err.message)
    }
  }

  const abrirAddMomento = () => { setMomentoEditandoIdx(null); navigate('momento') }
  const editarMomento = (i) => { setMomentoEditandoIdx(i); navigate('momento') }
  const removerMomento = (e, i) => {
    e.stopPropagation()
    const novo = [...momentos]; novo.splice(i, 1); setMomentos(novo)
  }

  const dragSrc = useRef(null)
  const onDragStart = (e, idx) => { dragSrcIdx.current = idx; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => e.target.classList.add('dragging'), 0) }
  const onDragOver = (e, idx) => { e.preventDefault(); if (idx === dragSrcIdx.current) return; document.querySelectorAll('.momento-item').forEach(el => el.classList.remove('drag-over')); e.currentTarget.classList.add('drag-over') }
  const onDragLeave = (e) => e.currentTarget.classList.remove('drag-over')
  const onDrop = (e, idx) => { e.preventDefault(); if (dragSrcIdx.current === null || dragSrcIdx.current === idx) return; const novo = [...momentos]; const [m] = novo.splice(dragSrcIdx.current, 1); novo.splice(idx, 0, m); dragSrcIdx.current = null; setMomentos(novo); document.querySelectorAll('.momento-item').forEach(el => el.classList.remove('drag-over', 'dragging')) }
  const onDragEnd = () => { document.querySelectorAll('.momento-item').forEach(el => el.classList.remove('dragging', 'drag-over')); dragSrcIdx.current = null }

  const touchSrc = useRef(null)
  const onTouchStart = (e, idx) => { touchSrc.current = idx; e.currentTarget.closest('.momento-item')?.classList.add('dragging') }
  const onTouchMove = (e) => { e.preventDefault(); const t = e.touches[0]; document.querySelectorAll('.momento-item').forEach(el => el.classList.remove('drag-over')); document.elementFromPoint(t.clientX, t.clientY)?.closest('.momento-item')?.classList.add('drag-over') }
  const onTouchEnd = (e) => { e.preventDefault(); const t = e.changedTouches[0]; const target = document.elementFromPoint(t.clientX, t.clientY)?.closest('.momento-item'); if (target && touchSrc.current !== null) { const tIdx = parseInt(target.dataset.idx); if (!isNaN(tIdx) && tIdx !== touchSrc.current) { const novo = [...momentos]; const [m] = novo.splice(touchSrc.current, 1); novo.splice(tIdx, 0, m); setMomentos(novo) } } touchSrc.current = null; document.querySelectorAll('.momento-item').forEach(el => el.classList.remove('dragging', 'drag-over')) }

  const renderBadge = (m) => {
    if (m.tipo === 'pessoa') return <span className="momento-badge badge-pessoa">{m.responsavel || 'Pessoa'}</span>
    if (m.tipo === 'video') return <span className="momento-badge badge-video">Vídeo</span>
    return <span className="momento-badge badge-projecao">Projeção</span>
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('lista')}>‹</button>
        <span className="header-title">{editandoIdx !== null ? 'Editar Roteiro' : 'Novo Roteiro'}</span>
        <button className="btn-icon" onClick={() => navigate('preview')}>👁</button>
      </div>
      <div className="content">
        <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="campo" style={{ marginBottom: 12 }}>
            <label>Nome do evento / culto</label>
            <input type="text" value={editorNome} onChange={e => setEditorNome(e.target.value)} placeholder="Culto de Domingo" />
          </div>
          <div className="campo" style={{ marginBottom: 12 }}>
            <label>Data</label>
            <input type="date" value={editorData} onChange={e => setEditorData(e.target.value)} />
          </div>
          <div className="campo" style={{ marginBottom: 12 }}>
            <label>Tema (opcional)</label>
            <input type="text" value={editorTema} onChange={e => setEditorTema(e.target.value)} placeholder="Amor e Gratidão" />
          </div>
          <div className="campo" style={{ marginBottom: 0 }}>
            <label>Versículo-chave (opcional)</label>
            <input type="text" value={editorVersiculo} onChange={e => setEditorVersiculo(e.target.value)} placeholder="João 3:16" />
          </div>
        </div>

        <div className="section-header" style={{ marginTop: 4 }}>
          <span className="section-label">Momentos</span>
          <button className="btn-icon" onClick={abrirAddMomento}>⊕</button>
        </div>

        {momentos.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <p>Ainda sem momentos.\nToca em ⊕ para adicionar.</p>
          </div>
        ) : (
          momentos.map((m, i) => (
            <div
              key={i}
              className="momento-item"
              draggable
              data-idx={i}
              onClick={() => editarMomento(i)}
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, i)}
              onDragEnd={onDragEnd}
            >
              <div
                className="drag-handle"
                onClick={e => e.stopPropagation()}
                onTouchStart={e => { e.stopPropagation(); onTouchStart(e, i) }}
                onTouchMove={e => { e.preventDefault(); onTouchMove(e) }}
                onTouchEnd={e => { e.preventDefault(); onTouchEnd(e) }}
                style={{ touchAction: 'none' }}
              >⠇</div>
              <div className="momento-num">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="momento-nome">{m.nome}</div>
                {m.musicas?.filter(x => x).length > 0 && (
                  <div className="momento-sub">🎵 {m.musicas.filter(x => x).join(' · ')}</div>
                )}
                {m.avisos?.filter(x => x).length > 0 && (
                  <div className="momento-sub">📢 {m.avisos.filter(x => x).length} aviso{m.avisos.filter(x => x).length > 1 ? 's' : ''}</div>
                )}
                {m.obs && <div className="momento-sub">{m.obs}</div>}
              </div>
              {renderBadge(m)}
              <button className="btn-del" onClick={e => removerMomento(e, i)}>🗑</button>
            </div>
          ))
        )}
      </div>
      <div className="fab">
        <button className="btn-primary btn-accent" onClick={guardar}>💾 Guardar Roteiro</button>
      </div>
    </div>
  )
}
