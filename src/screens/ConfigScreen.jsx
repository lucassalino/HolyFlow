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
    const { error } = await sb
      .from('organizacoes')
      .update({ nome })
      .eq('id', organizacaoAtual.id)
    setSalvando(false)
    if (error) { setErroNome('Erro ao guardar: ' + error.message); return }
    setOrganizacaoAtual({ ...organizacaoAtual, nome })
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

        {/* --- ORGANIZAÇÃO --- */}
        <div className="group-label">Organização</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Nome da org */}
          {ehAdmin ? (
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Nome da organização
              </div>
              {editandoNome ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={nomeOrg}
                    onChange={e => setNomeOrg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && salvarNomeOrg()}
                    style={{ flex: 1, fontSize: 15, fontWeight: 600 }}
                    autoFocus
                  />
                  <button className="btn-small" onClick={salvarNomeOrg} disabled={salvando}
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none' }}>
                    {salvando ? '...' : 'Guardar'}
                  </button>
                  <button className="btn-small" onClick={() => { setEditandoNome(false); setNomeOrg(organizacaoAtual?.nome || ''); setErroNome('') }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{organizacaoAtual?.nome}</span>
                  <button className="btn-small" onClick={() => setEditandoNome(true)}>
                    <Icon name="save" size={14} /> Editar
                  </button>
                </div>
              )}
              {erroNome && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{erroNome}</div>}
            </div>
          ) : (
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>Organização</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{organizacaoAtual?.nome}</div>
            </div>
          )}

          {/* Código de convite — só admins */}
          {ehAdmin && (
            <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Código de convite
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, marginBottom: 10 }}>
                {organizacaoAtual?.codigo || '—'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={copiarCodigo} style={{ flex: 1, padding: '9px', fontSize: 13 }}>
                  <Icon name="copy" size={14} /> Copiar
                </button>
                <button className="btn-primary" onClick={partilharCodigo} style={{ flex: 1, padding: '9px', fontSize: 13 }}>
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

          {/* Trocar org */}
          <div style={rowStyle} onClick={() => navigate('org-escolha')}>
            <div style={{ ...iconBox, background: 'var(--bg3)' }}>
              <Icon name="refresh" size={18} color="var(--text2)" />
            </div>
            <span style={{ flex: 1, fontWeight: 500 }}>Trocar organização</span>
            <Icon name="arrow-right" size={16} color="var(--text3)" />
          </div>

          {/* Sair da org */}
          <div style={{ ...rowLast, cursor: 'pointer' }} onClick={sairDaOrg}>
            <div style={{ ...iconBox, background: 'rgba(211,47,47,0.1)' }}>
              <Icon name="x" size={18} color="var(--danger)" />
            </div>
            <span style={{ flex: 1, fontWeight: 500, color: 'var(--danger)' }}>Sair desta organização</span>
          </div>
        </div>

        {/* --- CONTA --- */}
        <div className="group-label" style={{ marginTop: 8 }}>Conta</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ ...rowLast, cursor: 'pointer' }} onClick={logout}>
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
