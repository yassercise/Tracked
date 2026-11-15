import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

/** Same locations the original Tracked app writes to, so existing data carries over. */
export const UID = 'yasser-tracked';

export const daysCol = () => collection(db, 'tracked', UID, 'days');
export const dayRef = (key: string) => doc(db, 'tracked', UID, 'days', key);
export const settingsRef = () => doc(db, 'tracked', UID, 'meta', 'settings');
export const recentRef = () => doc(db, 'tracked', UID, 'meta', 'recent'); // { items: Food[] }
export const foodsCol = () => collection(db, 'tracked', UID, 'foods');
export const foodRef = (id: string) => doc(db, 'tracked', UID, 'foods', id);
