import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgEscolhaScreen() {
  const { navigate, logout, minhasOrgs, selecionarOrg, showConfirm, showAlert } = useApp()

  const aprovadas = minhasOrgs.filter(m => m.status === 'aprovado')
  const pendentes = minhasOrgs.filter(m => m.status === 'pendente')
  const temOrgs = aprovadas.length > 0 || pendentes.length > 0

  const handleSair = async (e, membro) => {
    e.stopPropagation()
    const ok = await showConfirm({ message: `Sair de "${membro.organizacoes.nome}"?`, confirmLabel: 'Sair', danger: true })
    if (!ok) return
    const { sb } = await import('../supabase')
    const { error } = await sb.from('membros').delete().eq('id', membro.id)
    if (error) { await showAlert('Erro: ' + error.message); return }
    window.location.reload()
  }

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">Organizações</span>
        <button className="btn-icon" onClick={logout} title="Sair da conta">
          <Icon name="logout" size={18} />
        </button>
      </div>
      <div className="content">
        {aprovadas.length > 0 && (
          <>
            <div className="group-label">As minhas organizações</div>
            {aprovadas.map(m => (
              <div key={m.id} className="card" onClick={() => selecionarOrg(m, m.organizacoes)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="clipboard" size={20} color="var(--text2)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title">{m.organizacoes.nome}</div>
                    <div className="card-sub">{m.role === 'admin' ? 'Admin' : 'Membro'}</div>
                  </div>
                  <button
                    className="btn-icon" title="Sair desta organização"
                    onClick={e => handleSair(e, m)}
                    style={{ color: 'var(--danger)', background: 'transparent', flexShrink: 0 }}
                  ><Icon name="x" size={16} /></button>
                  <Icon name="arrow-right" size={18} color="var(--text3)" />
                </div>
              </div>
            ))}
          </>
        )}

        {pendentes.length > 0 && (
          <>
            <div className="group-label">A aguardar aprovação</div>
            {pendentes.map(m => (
              <div key={m.id} className="card" style={{ opacity: 0.65, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--warn-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="hourglass" size={20} color="var(--warn-text)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title">{m.organizacoes.nome}</div>
                    <div className="card-sub" style={{ color: 'var(--warn-text)' }}>Pedido pendente</div>
                  </div>
                  <button
                    className="btn-icon" title="Cancelar pedido"
                    onClick={e => handleSair(e, m)}
                    style={{ color: 'var(--danger)', background: 'transparent', flexShrink: 0 }}
                  ><Icon name="x" size={16} /></button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="group-label" style={{ marginTop: temOrgs ? 8 : 0 }}>
          {temOrgs ? 'Entrar noutra organização' : 'Para continuar, cria ou entra numa organização'}
        </div>
        <div className="org-choice-card" onClick={() => navigate('org-criar')}>
          <div className="icon"><Icon name="plus-circle" size={28} /></div>
          <div className="title">Criar Organização</div>
          <div className="desc">Sou pastor/líder e quero criar a minha igreja</div>
        </div>
        <div className="org-choice-card" onClick={() => navigate('org-entrar')}>
          <div className="icon"><Icon name="key" size={28} /></div>
          <div className="title">Entrar com Código</div>
          <div className="desc">Já recebi um código de uma organização</div>
        </div>
      </div>
    </div>
  )
}
