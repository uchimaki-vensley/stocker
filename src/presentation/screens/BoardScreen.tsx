import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ItemRecord, Stage, getStage } from '../../domain/models/item';
import { AddItemModal } from '../components/AddItemModal';
import { KanbanColumn } from '../components/KanbanColumn';

const columns: {
  key: Stage;
  title: string;
  description: string;
  color: string;
}[] = [
  { key: 'stock', title: '在庫あり', description: 'まだ余裕', color: '#3c7a6b' },
  { key: 'soon', title: 'そろそろ', description: '補充タイミング', color: '#d28c2f' },
  { key: 'buy', title: '買う', description: '今日/期限切れ', color: '#c04848' },
  { key: 'empty', title: '使い切り', description: '在庫なし', color: '#4e545b' },
];

type BoardScreenProps = {
  items: ItemRecord[];
  onLogout: () => void;
  onConsume: (item: ItemRecord) => void;
  onRestock: (item: ItemRecord) => void;
  onCreate: (payload: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    cycleDays: number;
    notes?: string;
    emoji?: string;
  }) => Promise<void>;
};

export const BoardScreen = ({
  items,
  onLogout,
  onConsume,
  onRestock,
  onCreate,
}: BoardScreenProps) => {
  const [addOpen, setAddOpen] = useState(false);

  const grouped = useMemo(() => {
    const bucket: Record<Stage, ItemRecord[]> = {
      stock: [],
      soon: [],
      buy: [],
      empty: [],
    };
    items.forEach((item) => {
      bucket[getStage(item)].push(item);
    });
    return bucket;
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Stocker</Text>
          <Text style={styles.subtitle}>日用品の在庫ボード</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.key}
            title={column.title}
            description={column.description}
            color={column.color}
            items={grouped[column.key]}
            onConsume={onConsume}
            onRestock={onRestock}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setAddOpen(true)}>
        <Text style={styles.fabText}>＋ 追加</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={async (payload) => {
          await onCreate(payload);
          setAddOpen(false);
        }}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f4ef',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d2329',
  },
  subtitle: {
    color: '#5b656d',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ddd6',
  },
  logoutText: {
    color: '#1d2329',
    fontWeight: '600',
  },
  row: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    gap: 16,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    backgroundColor: '#1d2329',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#1d2329',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  fabText: {
    color: '#f8f4ee',
    fontWeight: '700',
  },
});
