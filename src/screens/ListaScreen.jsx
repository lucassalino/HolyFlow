import { useState } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import { formatarData } from '../utils/formatarData'
import Icon from '../components/Icon'
import { GrainBackground } from './AuthScreen'

export default function ListaScreen() {
  const {
    membroAtual, organizacaoAtual, minhasOrgs,
    roteiros, setRoteiros,
    navigate, selecionarOrg,
    carregarRoteirosDaNuvem, abrirNovoRoteiro, abrirRoteiro,
  } = useApp()

  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const ehAdmin = membroAtual?.role === 'admin'
  const orgsAprovadas = minhasOrgs.filter(m => m.status === 'aprovado')
  const inicial = organizacaoAtual?.nome?.[0]?.toUpperCase() || 'O'

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

      {/* Overlay + dropdown */}
      {mostrarDropdown && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 50 }}
          onClick={() => setMostrarDropdown(false)}
        >
          <div
            style={{
              position: 'absolute', top: 56, left: 12, right: 12,
              background: 'rgba(22,22,30,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Lista de orgs */}
            {orgsAprovadas.map((m, idx) => {
              const isAtual = m.organizacao_id === organizacaoAtual?.id
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: idx < orgsAprovadas.length - 1 || true ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    cursor: isAtual ? 'default' : 'pointer',
                  }}
                  onClick={() => {
                    if (!isAtual) { selecionarOrg(m, m.organizacoes); setMostrarDropdown(false) }
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: isAtual ? 'rgba(240,240,245,0.18)' : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15, color: '#f0f0f5', flexShrink: 0,
                  }}>{m.organizacoes.nome[0].toUpperCase()}</div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: isAtual ? 600 : 400, color: '#f0f0f5' }}>
                    {m.organizacoes.nome}
                  </span>
                  {isAtual && (
                    <div style={{ width: 7, height: 7, borderRadius: 99, background: '#4ade80', flexShrink: 0 }} />
                  )}
                </div>
              )
            })}

            {/* Nova organização */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                cursor: 'pointer',
              }}
              onClick={() => { navigate('org-escolha'); setMostrarDropdown(false) }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="plus" size={16} color="rgba(240,240,245,0.45)" />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)' }}>Nova organização</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header" style={{ position: 'relative', zIndex: 1, background: 'transparent', justifyContent: 'space-between' }}>
        {/* Trigger do dropdown — centro */}
        <button
          onClick={() => setMostrarDropdown(v => !v)}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '7px 12px',
            cursor: 'pointer',
            minWidth: 0,
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(240,240,245,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#f0f0f5', flexShrink: 0,
          }}>{inicial}</div>
          <span style={{
            flex: 1, fontWeight: 600, fontSize: 15, color: '#f0f0f5',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textAlign: 'left',
          }}>
            {organizacaoAtual?.nome || 'HolyFlow'}
          </span>
          <Icon
            name={mostrarDropdown ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="rgba(240,240,245,0.5)"
          />
        </button>

        {/* Engrenagem */}
        <button
          className="btn-icon"
          onClick={() => navigate('configuracoes')}
          title="Configurações"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,245,0.7)', marginLeft: 8, flexShrink: 0 }}
        >
          <Icon name="gear" size={18} />
        </button>
      </div>

      <div className="content" style={{ position: 'relative', zIndex: 1 }}>
        {roteiros.length === 0 ? (
          <div className="empty-state">
            <div className="icon">
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
