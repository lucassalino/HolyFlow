import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgEscolhaScreen() {
  const { navigate, logout } = useApp()
  return (
    <div className="screen">
      <div className="header"><span className="header-title">A tua Igreja</span><button className="btn-icon" onClick={logout}><Icon name="logout" size={18} /></button></div>
      <div className="content">
        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px', lineHeight: 1.5 }}>Para continuar, cria a tua organização ou entra com um código que já tenhas recebido.</p>
        <div className="org-choice-card" onClick={() => navigate('org-criar')}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="plus-square" size={32} color="var(--text2)" /></div><div className="title">Criar Organização</div><div className="desc">Sou pastor/líder e quero criar a minha igreja</div></div>
        <div className="org-choice-card" onClick={() => navigate('org-entrar')}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Icon name="key" size={32} color="var(--text2)" /></div><div className="title">Entrar com Código</div><div className="desc">Já recebi um código de uma organização</div></div>
      </div>
    </div>
  )
}
