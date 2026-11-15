import { motion } from 'motion/react';
import { ChartNoAxesColumn, House, Plus, Settings2 } from 'lucide-react';
import './ui.css';

export type Tab = 'home' | 'log' | 'trends' | 'settings';

const TABS: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'trends', label: 'Trends', Icon: ChartNoAxesColumn },
  { id: 'settings', label: 'Settings', Icon: Settings2 },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-pill">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className="tab" aria-current={tab === id ? 'page' : undefined} onClick={() => onChange(id)}>
            {tab === id && <motion.span layoutId="tab-active" className="tab-active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <Icon size={22} strokeWidth={2.1} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <button className="tabbar-log press" aria-label="Log food" aria-current={tab === 'log' ? 'page' : undefined} onClick={() => onChange('log')}>
        <Plus size={28} strokeWidth={2.6} />
      </button>
    </nav>
  );
}
