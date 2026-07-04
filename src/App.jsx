import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './screens/AuthScreen'
import ListaScreen from './screens/ListaScreen'
import EditorScreen from './screens/EditorScreen'
import MomentoScreen from './screens/MomentoScreen'
import PreviewScreen from './screens/PreviewScreen'
import MembrosScreen from './screens/MembrosScreen'
import OrgEscolhaScreen from './screens/OrgEscolhaScreen'
import OrgCriarScreen from './screens/OrgCriarScreen'
import OrgEntrarScreen from './screens/OrgEntrarScreen'
import OrgCodigoScreen from './screens/OrgCodigoScreen'
import PendenteScreen from './screens/PendenteScreen'
import LoadingScreen from './screens/LoadingScreen'

const SCREENS = {
  loading: LoadingScreen,
  auth: AuthScreen,
  lista: ListaScreen,
  editor: EditorScreen,
  momento: MomentoScreen,
  preview: PreviewScreen,
  membros: MembrosScreen,
  'org-escolha': OrgEscolhaScreen,
  'org-criar': OrgCriarScreen,
  'org-entrar': OrgEntrarScreen,
  'org-codigo': OrgCodigoScreen,
  pendente: PendenteScreen,
}

function AppInner() {
  const { screen } = useApp()
  const Screen = SCREENS[screen] || LoadingScreen
  return (
    <div className="app">
      <Screen />
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
