import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'
import Icon from '../components/Icon'

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
        <Icon name="clipboard" size={22} />
        <span className="header-title">Roteiro do Culto</span>
        {ehAdmin && (
          <button className="btn-icon" onClick={() => navigate('membros')}>
            <Icon name="users" size={18} />
          </button>
        )}
        <button className="btn-icon" onClick={logout}>
          <Icon name="logout" size={18} />
        </button>
      </div>

      <div className="content">
        {roteiros.length === 0 ? (
          <div className="empty-state">
            <div className="icon" style={{ fontSize: 48 }}>
              <Icon name="clipboard" size={52} color="var(--text3)" />
            </div>
            <p>{ehAdmin ? 'Nenhum roteiro ainda.\nCria o primeiro!' : 'Nenhum roteiro ainda.\nAguarda o admin criar um.'}</p>
          </div>
        ) : (
          <>
            <div className="group-label">Roteiros</div>
            {roteiros.map((r, i) => (
              <div key={r.id} className="card" onClick={() => abrirRoteiro(i, roteiros)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text2)', flexShrink: 0,
                  }}>
                    <Icon name="document" size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title">{r.nome}</div>
                    <div className="card-sub">
                      {formatarData(r.data)} · {r.momentos.length} momento{r.momentos.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {ehAdmin && (
                    <button className="btn-del" onClick={e => apagarRoteiro(e, i)}>
                      <Icon name="trash" size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {ehAdmin && (
        <div className="fab">
          <button className="btn-primary btn-accent" onClick={abrirNovoRoteiro}>
            <Icon name="plus" size={18} color="var(--accent-text)" />
            Novo Roteiro
          </button>
        </div>
      )}
    </div>
  )
}
