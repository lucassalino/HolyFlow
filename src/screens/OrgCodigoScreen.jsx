import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

export default function OrgCodigoScreen() {
  const { organizacaoAtual, membroAtual, entrarNaApp } = useApp()

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">Organização Criada</span>
      </div>
      <div className="content">
        <div className="empty-state" style={{ padding: '32px 0 24px' }}>
          <Icon name="check" size={52} color="#22c55e" />
          <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)', marginBottom: 6, marginTop: 12 }}>Tudo pronto!</p>
          <p>A tua organização foi criada com sucesso.</p>
        </div>
        <div className="codigo-display">
          <div className="label">Código de acesso</div>
          <div className="codigo">{organizacaoAtual?.codigo || '—'}</div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>
          Partilha este código com os líderes da tua igreja.
        </p>
        <button className="btn-primary btn-accent" onClick={() => entrarNaApp(membroAtual, organizacaoAtual)}>
          Continuar <Icon name="arrow-right" size={18} color="var(--accent-text)" />
        </button>
      </div>
    </div>
  )
}
