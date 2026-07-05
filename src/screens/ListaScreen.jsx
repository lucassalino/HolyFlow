import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'
import Icon from '../components/Icon'
import { GrainBackground } from './AuthScreen'

const DARK = 'rgba(8,8,8,0)'

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

  const cardStyle = {
    background: 'rgba(28,28,36,0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: 'none',
  }

  return (
    <div className="screen" style={{ position: 'relative', overflow: 'hidden', background: '#080808' }}>
      <GrainBackground />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.45) 0%, rgba(8,8,8,0.25) 40%, rgba(8,8,8,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      <div className="header" style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <Icon name="clipboard" size={22} color="rgba(240,240,245,0.8)" />
        <span className="header-title" style={{ color: '#f0f0f5' }}>HolyFlow</span>
        {ehAdmin && (
          <button className="btn-icon" onClick={() => navigate('membros')}
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.7)' }}>
            <Icon name="users" size={18} />
          </button>
        )}
        <button className="btn-icon" onClick={logout}
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.7)' }}>
          <Icon name="logout" size={18} />
        </button>
      </div>

      <div className="content" style={{ position: 'relative', zIndex: 1 }}>
        {roteiros.length === 0 ? (
          <div className="empty-state">
            <div className="icon" style={{ fontSize: 48 }}>
              <Icon name="clipboard" size={52} color="rgba(240,240,245,0.25)" />
            </div>
            <p style={{ color: 'rgba(240,240,245,0.4)' }}>
              {ehAdmin ? 'Nenhum roteiro ainda.\nCria o primeiro!' : 'Nenhum roteiro ainda.\nAguarda o admin criar um.'}
            </p>
          </div>
        ) : (
          <>
            <div className="group-label" style={{ color: 'rgba(240,240,245,0.35)' }}>Roteiros</div>
            {roteiros.map((r, i) => (
              <div key={r.id} className="card" onClick={() => abrirRoteiro(i, roteiros)} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon name="document" size={22} color="rgba(240,240,245,0.5)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title" style={{ color: '#f0f0f5' }}>{r.nome}</div>
                    <div className="card-sub" style={{ color: 'rgba(240,240,245,0.45)' }}>
                      {formatarData(r.data)} · {r.momentos.length} momento{r.momentos.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {ehAdmin && (
                    <button className="btn-del" onClick={e => apagarRoteiro(e, i)} style={{ color: 'rgba(240,240,245,0.3)' }}>
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
        <div className="fab" style={{ position: 'relative', zIndex: 1, background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button className="btn-primary btn-accent" onClick={abrirNovoRoteiro}
            style={{ background: '#f0f0f5', color: '#0d0d0d' }}>
            <Icon name="plus" size={18} color="#0d0d0d" />
            Novo Roteiro
          </button>
        </div>
      )}
    </div>
  )
}
