import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'

export default function ListaScreen() {
  const {
    membroAtual, organizacaoAtual,
    roteiros, setRoteiros,
    navigate, logout,
    carregarRoteirosDaNuvem, abrirNovoRoteiro, abrirRoteiro,
  } = useApp()

  const ehAdmin = membroAtual?.role === 'admin'

  const apagarRoteiro = async (e, i) => {
    e.stopPropagation()
    if (!confirm('Apagar este roteiro?')) return
    const { error } = await sb.from('roteiros').delete().eq('id', roteiros[i].id)
    if (error) { alert('Erro ao apagar: ' + error.message); return }
    const lista = await carregarRoteirosDaNuvem(organizacaoAtual.id)
    setRoteiros(lista)
  }

  return (
    <div className="screen">
      <div className="header">
        <span style={{ fontSize: '22px' }}>📋</span>
        <span className="header-title">Roteiro do Culto</span>
        {ehAdmin && <button className="btn-icon" onClick={() => navigate('membros')}>👥</button>}
        {ehAdmin && <button className="btn-icon" onClick={abrirNovoRoteiro}>＋</button>}
        <button className="btn-icon" onClick={logout}>⎋</button>
      </div>
      <div className="content">
        {roteiros.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>Nenhum roteiro ainda.<br />{ehAdmin ? 'Cria o primeiro!' : 'Aguarda o admin criar um.'}</p>
          </div>
        ) : (
          roteiros.map((r, i) => (
            <div key={r.id} className="card" onClick={() => abrirRoteiro(i, roteiros)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div className="card-title">{r.nome}</div>
                  <div className="card-sub">
                    {formatarData(r.data)} · {r.momentos.length} momento{r.momentos.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {ehAdmin && (
                  <button className="btn-del" onClick={e => apagarRoteiro(e, i)} style={{ fontSize: '20px' }}>🗑</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {ehAdmin && (
        <div className="fab">
          <button className="btn-primary btn-accent" onClick={abrirNovoRoteiro}>＋ Novo Roteiro</button>
        </div>
      )}
    </div>
  )
}
