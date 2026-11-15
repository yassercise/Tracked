import { useEffect, useState } from 'react';
import type { Food } from '../../lib/types';
import { Sheet } from '../../ui/Sheet';
import { EMPTY_DRAFT, MacroFields, draftMacros, type FoodDraft } from './MacroFields';
import '../home/home.css';
import './log.css';

interface Props {
  /** null = closed, 'new' = creating, a Food = editing that saved food */
  editing: Food | 'new' | null;
  onClose: () => void;
  onSave: (f: Food) => void;
  onDelete?: (f: Food) => void;
}

/** Create or edit a saved food. Used from Log and from Settings. */
export function FoodFormSheet({ editing, onClose, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<FoodDraft>(EMPTY_DRAFT);
  const [mode, setMode] = useState<Food | 'new'>('new'); // kept while the sheet animates out
  const valid = draft.name.trim().length > 0;

  useEffect(() => {
    if (!editing) return;
    setMode(editing);
    setDraft(editing === 'new' ? EMPTY_DRAFT : { name: editing.name, cal: String(editing.cal), prot: String(editing.prot), carb: String(editing.carb), fat: String(editing.fat) });
  }, [editing]);

  const isEdit = mode !== 'new';
  return (
    <Sheet open={!!editing} onClose={onClose} label={isEdit ? 'Edit food' : 'New food'}>
      <form
        className="msheet"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSave({ ...(isEdit ? mode : {}), name: draft.name.trim(), ...draftMacros(draft) });
        }}
      >
        <h2 className="msheet-name">{isEdit ? 'Edit food' : 'New food'}</h2>
        <p className="manual-hint">Enter the macros for one serving.</p>
        <MacroFields draft={draft} onChange={setDraft} />
        <button className="btn btn-primary press" disabled={!valid}>{isEdit ? 'Save changes' : 'Save food'}</button>
        {isEdit && onDelete && (
          <button type="button" className="btn btn-quiet press" onClick={() => onDelete(mode)}>Delete food</button>
        )}
      </form>
    </Sheet>
  );
}
