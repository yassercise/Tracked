import { MotionConfig } from 'motion/react';
import { useState } from 'react';
import { todayKey } from './lib/dates';
import { categoryForNow } from './lib/meals';
import type { Category } from './lib/types';
import { useSettings } from './data/useSettings';
import { TabBar, type Tab } from './ui/TabBar';
import { ToastProvider } from './ui/Toast';
import { HomeScreen } from './screens/home/HomeScreen';
import { LogScreen } from './screens/log/LogScreen';

export function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [dateKey, setDateKey] = useState(todayKey);
  const [logCat, setLogCat] = useState<Category>(categoryForNow);
  const { targets } = useSettings();

  const openLog = (cat: Category | null) => {
    setLogCat(cat ?? categoryForNow());
    setTab('log');
  };

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        {tab === 'home' && <HomeScreen dateKey={dateKey} onDateChange={setDateKey} targets={targets} onLog={openLog} />}
        {tab === 'log' && <LogScreen dateKey={dateKey} cat={logCat} onCatChange={setLogCat} onDone={() => setTab('home')} />}
        {tab === 'trends' && (
          <main className="screen placeholder">
            <h1>Trends</h1>
            <p>Weekly and monthly charts come after Log.</p>
          </main>
        )}
        {tab === 'settings' && (
          <main className="screen placeholder">
            <h1>Settings</h1>
            <p>Targets and saved foods come last.</p>
          </main>
        )}
        <TabBar tab={tab} onChange={(t) => (t === 'log' ? openLog(null) : setTab(t))} />
      </ToastProvider>
    </MotionConfig>
  );
}
