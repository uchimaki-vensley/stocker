import { ItemRecord } from '../domain/models/item';
import { db } from './sqlite';

const nowIso = () => new Date().toISOString();

export const initDb = async (): Promise<void> => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      lastPurchasedAt TEXT NOT NULL,
      cycleDays INTEGER NOT NULL,
      notes TEXT,
      emoji TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_items_updatedAt ON items(updatedAt);`
  );
};

export const seedItemsIfEmpty = async (): Promise<void> => {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM items;`,
    []
  );
  if (row && row.count > 0) {
    return;
  }
  const now = nowIso();
  const seed: Omit<ItemRecord, 'id'>[] = [
    {
      name: '食器用洗剤',
      category: '掃除',
      quantity: 1,
      unit: '本',
      lastPurchasedAt: now,
      cycleDays: 30,
      notes: '詰め替え用を確認',
      emoji: '🧼',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'シャンプー',
      category: 'バス',
      quantity: 1,
      unit: '本',
      lastPurchasedAt: now,
      cycleDays: 45,
      notes: '家族で共用',
      emoji: '🧴',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: '醤油',
      category: '調味料',
      quantity: 1,
      unit: '本',
      lastPurchasedAt: now,
      cycleDays: 60,
      notes: '濃口',
      emoji: '🍶',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: '洗濯洗剤',
      category: '洗濯',
      quantity: 0,
      unit: '本',
      lastPurchasedAt: now,
      cycleDays: 25,
      notes: '在庫切れ',
      emoji: '🧺',
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.withTransactionAsync(async () => {
    for (const item of seed) {
      await db.runAsync(
        `INSERT INTO items
          (name, category, quantity, unit, lastPurchasedAt, cycleDays, notes, emoji, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.name,
          item.category,
          item.quantity,
          item.unit,
          item.lastPurchasedAt,
          item.cycleDays,
          item.notes,
          item.emoji,
          item.createdAt,
          item.updatedAt,
        ]
      );
    }
  });
};

export const fetchItems = (): Promise<ItemRecord[]> =>
  db.getAllAsync<ItemRecord>(`SELECT * FROM items ORDER BY updatedAt DESC;`, []);

export const createItem = async (item: {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cycleDays: number;
  notes?: string;
  emoji?: string;
}): Promise<void> => {
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO items
      (name, category, quantity, unit, lastPurchasedAt, cycleDays, notes, emoji, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      item.name,
      item.category,
      item.quantity,
      item.unit,
      now,
      item.cycleDays,
      item.notes ?? null,
      item.emoji ?? null,
      now,
      now,
    ]
  );
};

export const updateItemStock = async (
  id: number,
  quantity: number,
  lastPurchasedAt?: string
): Promise<void> => {
  const updatedAt = nowIso();
  const purchasedAt = lastPurchasedAt ?? updatedAt;
  await db.runAsync(
    `UPDATE items
     SET quantity = ?, lastPurchasedAt = ?, updatedAt = ?
     WHERE id = ?;`,
    [quantity, purchasedAt, updatedAt, id]
  );
};
