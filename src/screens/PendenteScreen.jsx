import { sb } from '../supabase'
import { useApp } from '../context/AppContext'

export default function PendenteScreen() {
  const { membroAtual, setMembroAtual, organizacaoAtual, logout, entrarNaApp } = useApp()

  const verificar = async () => {
    if (!membroAtual) return
    const { data, error } = await sb.from('membros').select('*').eq('id', membroAtual.id).single()
    if (error) return
    const atualizado = { ...membroAtual, status: data.status, role: data.role }
    setMembroAtual(atualizado)
    if (data.status === 'aprovado') {
      await entrarNaApp(atualizado, organizacaoAtual)
    } else {
      alert('Ainda sem resposta — pede ao administrador para te aprovar.')
    }
  }

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">Aguardando Aprovação</span>
        <button className="btn-icon" onClick={logout}>⎋</button>
      </div>
      <div className="content">
        <div className="pendente-box">
          <div className="icon">⏳</div>
          <h2>O teu pedido foi enviado</h2>
          <p>Um administrador da organização precisa de aprovar o teu acesso antes de poderes ver os roteiros. Volta a abrir a app mais tarde.</p>
        </div>
        <button className="btn-primary" onClick={verificar}>🔄 Verificar novamente</button>
      </div>
    </div>
  )
}
