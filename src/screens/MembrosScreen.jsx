import { useState, useEffect } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'

export default function MembrosScreen() {
  const { organizacaoAtual, navigate } = useApp()
  const [pendentes, setPendentes] = useState([])
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = async () => {
    if (!organizacaoAtual?.id) return
    setLoading(true)
    const { data, error } = await sb.from('membros')
      .select('*').eq('organizacao_id', organizacaoAtual.id).order('created_at', { ascending: true })
    if (error) { console.error(error); setLoading(false); return }
    setPendentes((data || []).filter(m => m.status === 'pendente'))
    setMembros((data || []).filter(m => m.status !== 'pendente'))
    setLoading(false)
  }

  useEffect(() => { carregar() }, [organizacaoAtual?.id])

  const aprovar = async (id) => {
    await sb.from('membros').update({ status: 'aprovado' }).eq('id', id)
    carregar()
  }

  const rejeitar = async (id) => {
    if (!confirm('Rejeitar este pedido de acesso?')) return
    await sb.from('membros').update({ status: 'rejeitado' }).eq('id', id)
    carregar()
  }

  const promoverAdmin = async (id) => {
    await sb.from('membros').update({ role: 'admin' }).eq('id', id)
    carregar()
  }

  const copiarCodigo = () => {
    const codigo = organizacaoAtual?.codigo
    if (!codigo) return
    navigator.clipboard?.writeText(codigo)
      .then(() => alert('Código copiado: ' + codigo))
      .catch(() => alert('Código: ' + codigo))
  }

  const partilharCodigo = () => {
    const codigo = organizacaoAtual?.codigo
    const nome = organizacaoAtual?.nome
    if (!codigo) return
    if (navigator.share) {
      navigator.share({
        title: 'HolyFlow — ' + nome,
        text: `Entra na organização "${nome}" no Roteiro do Culto!\n\nUsa o código: ${codigo}\n\nAbre a app em: https://holyflow.pages.dev`,
      }).catch(() => {})
    } else {
      copiarCodigo()
    }
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('lista')}>›</button>
        <span className="header-title">Membros</span>
      </div>
      <div className="content">
        <div className="codigo-display" style={{ padding: '16px', marginBottom: '6px' }}>
          <div className="label">Código de acesso da organização</div>
          <div className="codigo" style={{ fontSize: '22px', letterSpacing: '2px' }}>
            {organizacaoAtual?.codigo || '—'}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={copiarCodigo} style={{ flex: 1, padding: '10px', fontSize: '13px' }}>
              📋 Copiar código
            </button>
            <button className="btn-primary" onClick={partilharCodigo} style={{ flex: 1, padding: '10px', fontSize: '13px' }}>
              ⬆ Partilhar
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text2)', textAlign: 'center', marginBottom: '16px' }}>
          Partilha este código com os líderes — eles pedem acesso e tu aprovares aqui.
        </p>

        {loading ? (
          <p style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>A carregar...</p>
        ) : (
          <>
            {pendentes.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warn-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  ⏳ Aguardando aprovação ({pendentes.length})
                </div>
                {pendentes.map(m => (
                  <div key={m.id} className="membro-row" style={{ background: 'var(--warn-bg)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: '6px', border: 'none' }}>
                    <div className="membro-info">
                      <div className="membro-nome">{m.nome}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-small" style={{ background: '#22c55e', color: '#fff', border: 'none' }} onClick={() => aprovar(m.id)}>✓ Aprovar</button>
                      <button className="btn-small" style={{ color: 'var(--danger)' }} onClick={() => rejeitar(m.id)}>✕</button>
                    </div>
                  </div>
                ))}
                <div style={{ height: '0.5px', background: 'var(--border)', margin: '14px 0' }} />
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Membros
              </div>
              {membros.length === 0 ? (
                <p style={{ color: 'var(--text2)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>Nenhum membro aprovado ainda.</p>
              ) : (
                membros.map(m => (
                  <div key={m.id} className="membro-row">
                    <div className="membro-info">
                      <div className="membro-nome">{m.nome}</div>
                      <div className="membro-status">
                        <span className={`badge-role ${m.role === 'admin' ? 'badge-admin' : 'badge-membro'}`}>
                          {m.role === 'admin' ? 'Admin' : 'Membro'}
                        </span>
                      </div>
                    </div>
                    {m.role === 'membro' && (
                      <button className="btn-small" onClick={() => promoverAdmin(m.id)}>Tornar Admin</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
