import { sb } from '../supabase'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function PendenteScreen() {
  const { membroAtual, setMembroAtual, organizacaoAtual, logout, entrarNaApp } = useApp()

  const verificar = async () => {
    if (!membroAtual) return
    const { data, error } = await sb.from('membros').select('*').eq('id', membroAtual.id).single()
    if (error) return
    const atualizado = { ...membroAtual, status: data.status, role: data.role }
    setMembroAtual(atualizado)
    if (data.status === 'aprovado') await entrarNaApp(atualizado, organizacaoAtual)
    else alert('Ainda sem resposta — pede ao administrador para te aprovar.')
  }

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">Aguardando Aprovação</span>
        <button className="btn-icon" onClick={logout}>
          <Icon name="logout" size={18} />
        </button>
      </div>
      <div className="content">
        <div className="pendente-box">
          <Icon name="hourglass" size={44} color="var(--warn-text)" />
          <h2 style={{ marginTop: 16 }}>O teu pedido foi enviado</h2>
          <p>Um administrador da organização precisa de aprovar o teu acesso antes de poderes ver os roteiros.</p>
        </div>
        <button className="btn-primary" onClick={verificar} style={{ marginBottom: 12, gap: 8 }}>
          <Icon name="refresh" size={17} /> Verificar novamente
        </button>
        <button className="btn-primary" onClick={logout} style={{ color: 'var(--danger)', gap: 8 }}>
          <Icon name="logout" size={17} /> Sair
        </button>
      </div>
    </div>
  )
}
