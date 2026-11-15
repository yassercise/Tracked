import { AnimatePresence, motion } from 'motion/react';
import { ChartNoAxesColumn, House, Plus, Settings2 } from 'lucide-react';
import './ui.css';

export type Tab = 'home' | 'log' | 'trends' | 'settings';

const TABS: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'trends', label: 'Trends', Icon: ChartNoAxesColumn },
  { id: 'settings', label: 'Settings', Icon: Settings2 },
];

/** Full-width glass tab bar at the bottom, with the Log button floating above its right edge. */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <>
      <AnimatePresence>
        {tab !== 'log' && (
          <motion.button
            className="fab"
            aria-label="Log food"
            onClick={() => onChange('log')}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          >
            <Plus size={28} strokeWidth={2.6} />
          </motion.button>
        )}
      </AnimatePresence>

      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-pill">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} className="tab" aria-current={tab === id ? 'page' : undefined} onClick={() => onChange(id)}>
              {tab === id && <motion.span layoutId="tab-active" className="tab-active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <Icon size={24} strokeWidth={2.1} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
