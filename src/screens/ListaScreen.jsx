import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'
import Icon from '../components/Icon'
import DarkGrainBackground from '../components/DarkGrainBackground'

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

  const glass = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.07)',
  }

  const podeBotaoApagar = (r) =>
    ehAdmin || r.criado_por === membroAtual?.user_id

  return (
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#060606' }}>
      <DarkGrainBackground />

      <div className="header" style={{
        position: 'relative', zIndex: 2,
        background: 'rgba(6,6,6,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span className="header-title" style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 700, letterSpacing: '-0.3px' }}>HolyFlow</span>
        {ehAdmin && (
          <button className="btn-icon" onClick={() => navigate('membros')} style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)' }}>
            <Icon name="users" size={18} />
          </button>
        )}
        <button className="btn-icon" onClick={logout} style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)' }}>
          <Icon name="logout" size={18} />
        </button>
      </div>

      <div className="content" style={{ position: 'relative', zIndex: 1 }}>
        {roteiros.length === 0 ? (
          <div className="empty-state" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Icon name="clipboard" size={52} color="rgba(255,255,255,0.15)" />
            <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 14 }}>
              {ehAdmin ? 'Nenhum roteiro ainda.\nCria o primeiro!' : 'Nenhum roteiro ainda.\nAguarda o admin criar um.'}
            </p>
          </div>
        ) : (
          <>
            <div className="group-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Roteiros</div>
            <div className="cards-grid">
              {roteiros.map((r, i) => (
                <div
                  key={r.id}
                  className="card"
                  onClick={() => abrirRoteiro(i, roteiros)}
                  style={{ ...glass, borderRadius: 16, marginBottom: 10, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon name="document" size={22} color="rgba(255,255,255,0.45)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                        <div className="card-title" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.nome}</div>
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                          padding: '2px 7px', borderRadius: 99,
                          background: r.status === 'publicado' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                          color: r.status === 'publicado' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                          border: r.status === 'publicado' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
                          flexShrink: 0,
                        }}>
                          {r.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                      <div className="card-sub" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {formatarData(r.data)} · {r.momentos.length} momento{r.momentos.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {podeBotaoApagar(r) && (
                      <button
                        className="btn-del"
                        onClick={e => apagarRoteiro(e, i)}
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {ehAdmin && (
        <div className="fab" style={{ position: 'relative', zIndex: 2, background: 'transparent' }}>
          <button
            className="btn-primary"
            onClick={abrirNovoRoteiro}
            style={{ background: 'rgba(255,255,255,0.90)', color: '#080808', maxWidth: 400 }}
          >
            <Icon name="plus" size={18} color="#080808" />
            Novo Roteiro
          </button>
        </div>
      )}
    </div>
  )
}
