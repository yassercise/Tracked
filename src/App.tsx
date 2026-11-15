import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { todayKey } from './lib/dates';
import { categoryForNow } from './lib/meals';
import type { Category } from './lib/types';
import { useSettings } from './data/useSettings';
import { TabBar, type Tab } from './ui/TabBar';
import { ToastProvider } from './ui/Toast';
import { HomeScreen } from './screens/home/HomeScreen';
import { LogScreen } from './screens/log/LogScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { TrendsScreen } from './screens/trends/TrendsScreen';

export function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [dateKey, setDateKey] = useState(todayKey);
  const [logCat, setLogCat] = useState<Category>(categoryForNow);
  const { targets, saveTargets } = useSettings();

  // Each screen starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const openLog = (cat: Category | null) => {
    setLogCat(cat ?? categoryForNow());
    setTab('log');
  };

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}>
            {tab === 'home' && <HomeScreen dateKey={dateKey} onDateChange={setDateKey} targets={targets} onLog={openLog} />}
            {tab === 'log' && <LogScreen dateKey={dateKey} cat={logCat} targets={targets} onCatChange={setLogCat} onDone={() => setTab('home')} />}
            {tab === 'trends' && (
              <TrendsScreen
                targets={targets}
                onOpenDay={(key) => {
                  setDateKey(key);
                  setTab('home');
                }}
              />
            )}
            {tab === 'settings' && <SettingsScreen targets={targets} onSave={saveTargets} />}
          </motion.div>
        </AnimatePresence>
        <TabBar tab={tab} onChange={(t) => (t === 'log' ? openLog(null) : setTab(t))} />
      </ToastProvider>
    </MotionConfig>
  );
}
