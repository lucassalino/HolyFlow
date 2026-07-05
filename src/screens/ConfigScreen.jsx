import { useState } from 'react'
import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function ConfigScreen() {
  const {
    navigate, logout, sairDaOrg,
    membroAtual, organizacaoAtual, setOrganizacaoAtual,
  } = useApp()

  const ehAdmin = membroAtual?.role === 'admin'

  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeOrg, setNomeOrg] = useState(organizacaoAtual?.nome || '')
  const [salvando, setSalvando] = useState(false)
  const [erroNome, setErroNome] = useState('')

  const salvarNomeOrg = async () => {
    const nome = nomeOrg.trim()
    if (!nome) { setErroNome('O nome não pode estar vazio.'); return }
    setSalvando(true)
    setErroNome('')
    const { error } = await sb.from('organizacoes').update({ nome }).eq('id', organizacaoAtual.id)
    setSalvando(false)
    if (error) { setErroNome('Erro ao guardar: ' + error.message); return }
    setOrganizacaoAtual({ ...organizacaoAtual, nome })
    setEditandoNome(false)
  }

  const cancelarEdicao = () => {
    setNomeOrg(organizacaoAtual?.nome || '')
    setErroNome('')
    setEditandoNome(false)
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
        text: `Entra na organização "${nome}" no HolyFlow!\n\nUsa o código: ${codigo}\n\nAbre a app em: https://holyflow.pages.dev`,
      }).catch(() => {})
    } else {
      copiarCodigo()
    }
  }

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 16px',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
  }
  const rowLast = { ...rowStyle, borderBottom: 'none' }
  const iconBox = {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="btn-back" onClick={() => navigate('lista')}>
          <Icon name="chevron-left" size={20} />
        </button>
        <span className="header-title">Configurações</span>
      </div>

      <div className="content">

        {/* ORGANIZAÇÃO */}
        <div className="group-label">Organização</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Nome */}
          {ehAdmin && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                Nome da organização
              </div>
              {editandoNome ? (
                <>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={nomeOrg}
                      onChange={e => setNomeOrg(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') salvarNomeOrg(); if (e.key === 'Escape') cancelarEdicao() }}
                      style={{ flex: 1, fontSize: 15, fontWeight: 600, padding: '8px 12px' }}
                      autoFocus
                    />
                    <button
                      onClick={salvarNomeOrg}
                      disabled={salvando}
                      style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'var(--accent)', color: 'var(--accent-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      {salvando ? '...' : <Icon name="check" size={16} />}
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'var(--bg3)', color: 'var(--text2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                  {erroNome && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{erroNome}</div>}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                    {organizacaoAtual?.nome}
                  </span>
                  <button
                    onClick={() => setEditandoNome(true)}
                    style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: 'var(--bg3)', color: 'var(--text2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer',
                    }}
                    title="Editar nome"
                  >
                    <Icon name="pencil" size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Código de convite — só admins */}
          {ehAdmin && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                Código de convite
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 12, color: 'var(--text)' }}>
                {organizacaoAtual?.codigo || '—'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={copiarCodigo}
                  style={{ flex: 1, padding: '9px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="copy" size={14} /> Copiar
                </button>
                <button className="btn-primary" onClick={partilharCodigo}
                  style={{ flex: 1, padding: '9px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="share" size={14} /> Partilhar
                </button>
              </div>
            </div>
          )}

          {/* Membros — só admins */}
          {ehAdmin && (
            <div style={rowStyle} onClick={() => navigate('membros')}>
              <div style={{ ...iconBox, background: 'var(--bg3)' }}>
                <Icon name="users" size={18} color="var(--text2)" />
              </div>
              <span style={{ flex: 1, fontWeight: 500 }}>Gerir membros</span>
              <Icon name="arrow-right" size={16} color="var(--text3)" />
            </div>
          )}

          {/* Sair da org */}
          <div style={rowLast} onClick={sairDaOrg}>
            <div style={{ ...iconBox, background: 'rgba(211,47,47,0.1)' }}>
              <Icon name="x" size={18} color="var(--danger)" />
            </div>
            <span style={{ flex: 1, fontWeight: 500, color: 'var(--danger)' }}>Sair desta organização</span>
          </div>
        </div>

        {/* CONTA */}
        <div className="group-label" style={{ marginTop: 8 }}>Conta</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={rowLast} onClick={logout}>
            <div style={{ ...iconBox, background: 'var(--bg3)' }}>
              <Icon name="logout" size={18} color="var(--text2)" />
            </div>
            <span style={{ flex: 1, fontWeight: 500 }}>Terminar sessão</span>
          </div>
        </div>

      </div>
    </div>
  )
}
