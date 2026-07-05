import { useEffect } from 'react'
import { sb } from './supabase'
import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './screens/AuthScreen'
import OrgEscolhaScreen from './screens/OrgEscolhaScreen'
import OrgCriarScreen from './screens/OrgCriarScreen'
import OrgEntrarScreen from './screens/OrgEntrarScreen'
import OrgCodigoScreen from './screens/OrgCodigoScreen'
import PendenteScreen from './screens/PendenteScreen'
import ListaScreen from './screens/ListaScreen'
import EditorScreen from './screens/EditorScreen'
import MomentoScreen from './screens/MomentoScreen'
import PreviewScreen from './screens/PreviewScreen'
import MembrosScreen from './screens/MembrosScreen'

const AUTH_SCREENS = {
  auth: AuthScreen,
  'org-escolha': OrgEscolhaScreen,
  'org-criar': OrgCriarScreen,
  'org-entrar': OrgEntrarScreen,
  'org-codigo': OrgCodigoScreen,
  pendente: PendenteScreen,
}

const APP_SCREENS = {
  editor: EditorScreen,
  momento: MomentoScreen,
  preview: PreviewScreen,
  membros: MembrosScreen,
}

function AppInner() {
  const { screen, navigate, setSessaoAtual, depoisDoLogin } = useApp()

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessaoAtual(session)
        depoisDoLogin()
      } else {
        navigate('auth')
      }
    })
  }, [])

  if (screen === 'loading') {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text3)', fontSize: '14px' }}>A carregar...</span>
      </div>
    )
  }

  if (AUTH_SCREENS[screen]) {
    const Screen = AUTH_SCREENS[screen]
    return (
      <div className="app">
        <Screen key={screen} />
      </div>
    )
  }

  const RightScreen = APP_SCREENS[screen]
  return (
    <div className="app app--split">
      <div className={`app-sidebar${screen === 'lista' ? ' app-sidebar--active' : ''}`}>
        <ListaScreen />
      </div>
      {RightScreen && (
        <div className="app-main app-main--active">
          <RightScreen key={screen} />
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
