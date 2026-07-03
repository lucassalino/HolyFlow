import { useApp } from '../context/AppContext'

export default function OrgCodigoScreen() {
  const { organizacaoAtual, membroAtual, entrarNaApp } = useApp()

  return (
    <div className="screen">
      <div className="header">
        <span className="header-title">Organização Criada</span>
      </div>
      <div className="content">
        <div className="codigo-display">
          <div className="label">Código da organização</div>
          <div className="codigo">{organizacaoAtual?.codigo || '—'}</div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', textAlign: 'center', marginBottom: '20px' }}>
          Partilha este código com os líderes da tua igreja para eles poderem pedir acesso.
        </p>
        <button className="btn-primary btn-accent" onClick={() => entrarNaApp(membroAtual, organizacaoAtual)}>
          Continuar
        </button>
      </div>
    </div>
  )
}
