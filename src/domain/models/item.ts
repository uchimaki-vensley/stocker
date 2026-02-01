export type ItemRecord = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastPurchasedAt: string;
  cycleDays: number;
  notes: string | null;
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Stage = 'stock' | 'soon' | 'buy' | 'empty';

const dayMs = 24 * 60 * 60 * 1000;

const toDate = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
};

export const getDaysRemaining = (item: ItemRecord) => {
  if (item.cycleDays <= 0) return 0;
  const last = toDate(item.lastPurchasedAt);
  const next = new Date(last.getTime() + item.cycleDays * dayMs);
  return Math.ceil((next.getTime() - Date.now()) / dayMs);
};

export const getStage = (item: ItemRecord): Stage => {
  if (item.quantity <= 0) return 'empty';
  const daysRemaining = getDaysRemaining(item);
  if (daysRemaining <= 0) return 'buy';
  if (daysRemaining <= 3) return 'soon';
  return 'stock';
};

export const getDaysLabel = (item: ItemRecord) => {
  if (item.cycleDays <= 0) return 'サイクル未設定';
  const daysRemaining = getDaysRemaining(item);
  if (daysRemaining === 0) return '今日が補充目安';
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)}日超過`;
  return `あと${daysRemaining}日`;
};
