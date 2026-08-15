import { useEffect } from 'react'
import { sb } from './supabase'
import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './screens/AuthScreen'
import NovaSenhaScreen from './screens/NovaSenhaScreen'
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
import ConfigScreen from './screens/ConfigScreen'

const AUTH_SCREENS = {
  auth: AuthScreen,
  'nova-senha': NovaSenhaScreen,
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
  configuracoes: ConfigScreen,
}

function AppInner() {
  const { screen, navigate, setSessaoAtual, depoisDoLogin } = useApp()

  useEffect(() => {
    // Handle initial session (normal app load or magic link token in URL hash)
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const recuperando = localStorage.getItem('recuperando_senha')
        if (recuperando) {
          localStorage.removeItem('recuperando_senha')
          setSessaoAtual(session)
          navigate('nova-senha')
        } else {
          setSessaoAtual(session)
          depoisDoLogin()
        }
      } else {
        navigate('auth')
      }
    })

    // Catch magic link sign-in if session is established after initial getSession call
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const recuperando = localStorage.getItem('recuperando_senha')
        if (recuperando) {
          localStorage.removeItem('recuperando_senha')
          setSessaoAtual(session)
          navigate('nova-senha')
        }
      }
    })

    return () => subscription.unsubscribe()
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
