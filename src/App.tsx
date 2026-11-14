import { useRoute } from './router';
import { usePrefs } from './i18n';
import { TabBar } from './components/TabBar';
import { Corrections } from './screens/Corrections';
import { Correction } from './screens/Correction';
import { Note } from './screens/Note';
import { Tir } from './screens/Tir';
import { Tournois } from './screens/Tournois';
import { Jour } from './screens/Jour';
import { Historique } from './screens/Historique';
import { Progres } from './screens/Progres';
import { Reglages } from './screens/Reglages';

export function App() {
  const [name = 'corrections', param = ''] = useRoute();
  // Changer de langue redessine tout l'écran.
  const { lang } = usePrefs();
  let screen: JSX.Element;
  let tab: string | null = null;
  switch (name) {
    case 'tir': screen = <Tir key="jour" mode="cours" />; break;
    case 'tournoi': screen = <Tir key="tournoi" mode="tournoi" />; break;
    case 'correction': screen = <Correction />; break;
    case 'note': screen = <Note key={param} id={param} />; break;
    case 'jour': screen = <Jour key={param} id={param} />; break;
    case 'historique': screen = <Historique id={param} />; break;
    case 'tournois': screen = <Tournois />; tab = 'tournois'; break;
    case 'progres': screen = <Progres />; tab = 'progres'; break;
    case 'reglages': screen = <Reglages />; tab = 'reglages'; break;
    default: screen = <Corrections />; tab = 'corrections';
  }
  return (
    <div className="app" key={lang}>
      {screen}
      {tab && <TabBar current={tab} />}
    </div>
  );
}
