import { useState, useEffect } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

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

  const aprovar = async (id) => { await sb.from('membros').update({ status: 'aprovado' }).eq('id', id); carregar() }
  const rejeitar = async (id) => { if (!confirm('Rejeitar este pedido?')) return; await sb.from('membros').update({ status: 'rejeitado' }).eq('id', id); carregar() }
  const promoverAdmin = async (id) => { await sb.from('membros').update({ role: 'admin' }).eq('id', id); carregar() }

  const copiarCodigo = () => {
    const codigo = organizacaoAtual?.codigo
    if (!codigo) return
    navigator.clipboard?.writeText(codigo).then(() => alert('Código copiado: ' + codigo)).catch(() => alert('Código: ' + codigo))
  }

  const partilharCodigo = () => {
    const codigo = organizacaoAtual?.codigo
    const nome = organizacaoAtual?.nome
    if (!codigo) return
    if (navigator.share) {
      navigator.share({ title: 'HolyFlow — ' + nome, text: `Entra na organização "${nome}" no Roteiro do Culto!\n\nUsa o código: ${codigo}\n\nAbre a app em: https://holyflow.pages.dev` }).catch(() => {})
    } else { copiarCodigo() }
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('lista')}><Icon name="chevron-left" size={20} /></button>
        <span className="header-title">Membros</span>
      </div>
      <div className="content">
        <div className="codigo-display" style={{ marginBottom: '8px' }}>
          <div className="label">Código de acesso</div>
          <div className="codigo">{organizacaoAtual?.codigo || '—'}</div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={copiarCodigo} style={{ flex: 1, padding: '11px', fontSize: '13px', gap: 6 }}><Icon name="copy" size={16} /> Copiar</button>
            <button className="btn-primary" onClick={partilharCodigo} style={{ flex: 1, padding: '11px', fontSize: '13px', gap: 6 }}><Icon name="share" size={16} /> Partilhar</button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', marginBottom: '20px' }}>Partilha este código — os líderes pedem acesso e tu aprovares aqui.</p>
        {loading ? (
          <p style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>A carregar...</p>
        ) : (
          <>
            {pendentes.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div className="group-label" style={{ color: 'var(--warn-text)' }}>Aguardando aprovação ({pendentes.length})</div>
                <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  {pendentes.map((m, idx) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: idx < pendentes.length - 1 ? '1px solid var(--bg3)' : 'none' }}>
                      <div style={{ flex: 1 }}><div className="membro-nome">{m.nome}</div><div style={{ fontSize: 11, color: 'var(--warn-text)', marginTop: 2, fontWeight: 600 }}>Pendente</div></div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-small" style={{ background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => aprovar(m.id)}><Icon name="check" size={14} /> Aprovar</button>
                        <button className="btn-small" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center' }} onClick={() => rejeitar(m.id)}><Icon name="x" size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="group-label">Membros aprovados</div>
              <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {membros.length === 0 ? (
                  <p style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nenhum membro aprovado ainda.</p>
                ) : (
                  membros.map((m, idx) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: idx < membros.length - 1 ? '1px solid var(--bg3)' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div className="membro-nome">{m.nome}</div>
                        <div className="membro-status"><span className={`badge-role ${m.role === 'admin' ? 'badge-admin' : 'badge-membro'}`}>{m.role === 'admin' ? 'Admin' : 'Membro'}</span></div>
                      </div>
                      {m.role === 'membro' && <button className="btn-small" onClick={() => promoverAdmin(m.id)}>Tornar Admin</button>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
