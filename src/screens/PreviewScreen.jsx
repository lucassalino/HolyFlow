import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'
import { gerarPDF } from '../utils/pdf'

export default function PreviewScreen() {
  const { momentos, editorNome, editorData, editorTema, editorVersiculo, editandoIdx, roteiros, navigate } = useApp()

  const nomeEvento = editorNome || 'Sem título'
  const dataEvento = formatarData(editorData)

  const partilhar = () => {
    if (navigator.share) {
      const linhas = momentos.map((m, i) => {
        const resp = m.tipo === 'pessoa' ? (m.responsavel || '—') : m.tipo === 'video' ? 'Vídeo' : 'Projeção'
        let txt = `${i + 1}. ${m.nome} — ${resp}`
        if (m.obs) txt += ` (${m.obs})`
        if (m.musicas?.filter(x => x).length) txt += '\n   🎵 ' + m.musicas.filter(x => x).join(', ')
        if (m.avisos?.filter(x => x).length) txt += '\n   📢 ' + m.avisos.filter(x => x).join('\n   📢 ')
        return txt
      }).join('\n')
      navigator.share({ title: nomeEvento, text: `${nomeEvento}\n${dataEvento}\n\n${linhas}` }).catch(() => {})
    } else {
      gerarPDF({ nome: nomeEvento, data: editorData, tema: editorTema, versiculo: editorVersiculo }, momentos)
    }
  }

  const onGerarPDF = () => {
    gerarPDF({ nome: nomeEvento, data: editorData, tema: editorTema, versiculo: editorVersiculo }, momentos)
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('editor')}>‹</button>
        <span className="header-title">Roteiro Final</span>
        <button className="btn-icon" onClick={partilhar}>⬆</button>
      </div>
      <div className="content">
        <div className="preview-header">
          <div className="preview-evento">{nomeEvento}</div>
          <div className="preview-data">{dataEvento}</div>
          {editorTema && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>{editorTema}</div>}
          {editorVersiculo && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{editorVersiculo}</div>}
        </div>
        {momentos.length === 0 ? (
          <div className="empty-state"><p>Nenhum momento adicionado.</p></div>
        ) : (
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            {momentos.map((m, i) => {
              const resp = m.tipo === 'pessoa' ? (m.responsavel || '—') : m.tipo === 'video' ? '▶ Vídeo' : '🏗 Projeção'
              return (
                <div key={i} className="preview-item" style={{ padding: '14px 16px' }}>
                  <div className="preview-n">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="preview-nome">{m.nome}</div>
                    <div className="preview-responsavel">{resp}</div>
                    {m.obs && <div className="preview-sub-item">· {m.obs}</div>}
                    {m.musicas?.filter(x => x).map((mu, j) => (
                      <div key={j} className="preview-sub-item">🎵 {mu}</div>
                    ))}
                    {m.avisos?.filter(x => x).map((av, j) => (
                      <div key={j} className="preview-sub-item">📢 {av}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="fab" style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary btn-accent" onClick={onGerarPDF} style={{ flex: 1 }}>📄 Gerar PDF</button>
        <button className="btn-primary" onClick={partilhar} style={{ flex: '0 0 54px', padding: '15px 0' }}>⬆</button>
      </div>
    </div>
  )
}
