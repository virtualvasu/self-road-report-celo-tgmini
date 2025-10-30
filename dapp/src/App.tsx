import { useEffect } from 'react';
import IncidentManager from './components/IncidentManager';
import { getTelegram, isTelegram } from './lib/telegram';

function App() {
  useEffect(() => {
    if (!isTelegram()) return;
    const tg = getTelegram();
    tg?.ready();
    tg?.expand();
    const isDark = tg?.colorScheme === 'dark';
    document.documentElement.classList.toggle('dark', !!isDark);
  }, []);

  return <IncidentManager />;
}

export default App;