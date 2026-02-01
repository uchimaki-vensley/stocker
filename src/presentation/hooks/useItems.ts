import { useCallback, useEffect, useState } from 'react';
import {
  createItem,
  fetchItems,
  initDb,
  seedItemsIfEmpty,
  updateItemStock,
} from '../../data/itemRepository';
import { ItemRecord } from '../../domain/models/item';

type CreateItemPayload = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cycleDays: number;
  notes?: string;
  emoji?: string;
};

export const useItems = () => {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await fetchItems();
    setItems(data);
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      setLoading(true);
      try {
        await initDb();
        await seedItemsIfEmpty();
        const data = await fetchItems();
        if (active) setItems(data);
      } catch (err) {
        if (active) setError('データベースに接続できませんでした。');
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const consume = useCallback(
    async (item: ItemRecord) => {
      const nextQuantity = Math.max(0, item.quantity - 1);
      await updateItemStock(item.id, nextQuantity, item.lastPurchasedAt);
      await refresh();
    },
    [refresh]
  );

  const restock = useCallback(
    async (item: ItemRecord) => {
      const nextQuantity = item.quantity + 1;
      await updateItemStock(item.id, nextQuantity, new Date().toISOString());
      await refresh();
    },
    [refresh]
  );

  const create = useCallback(
    async (payload: CreateItemPayload) => {
      await createItem(payload);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    loading,
    error,
    refresh,
    consume,
    restock,
    create,
  };
};
