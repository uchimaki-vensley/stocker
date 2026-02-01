import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createItem,
  fetchItems,
  initDb,
  ItemRecord,
  seedItemsIfEmpty,
  updateItemStock,
} from './src/data/db';

type Stage = 'stock' | 'soon' | 'buy' | 'empty';

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

const dayMs = 24 * 60 * 60 * 1000;

const toDate = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? new Date() : new Date(parsed);
};

const getDaysRemaining = (item: ItemRecord) => {
  if (item.cycleDays <= 0) return 0;
  const last = toDate(item.lastPurchasedAt);
  const next = new Date(last.getTime() + item.cycleDays * dayMs);
  const diff = Math.ceil((next.getTime() - Date.now()) / dayMs);
  return diff;
};

const getStage = (item: ItemRecord): Stage => {
  if (item.quantity <= 0) return 'empty';
  const daysRemaining = getDaysRemaining(item);
  if (daysRemaining <= 0) return 'buy';
  if (daysRemaining <= 3) return 'soon';
  return 'stock';
};

const getDaysLabel = (item: ItemRecord) => {
  if (item.cycleDays <= 0) return 'サイクル未設定';
  const daysRemaining = getDaysRemaining(item);
  if (daysRemaining === 0) return '今日が補充目安';
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)}日超過`;
  return `あと${daysRemaining}日`;
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
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

  const refresh = async () => {
    const data = await fetchItems();
    setItems(data);
  };

  const handleConsume = async (item: ItemRecord) => {
    const nextQuantity = Math.max(0, item.quantity - 1);
    await updateItemStock(item.id, nextQuantity, item.lastPurchasedAt);
    await refresh();
  };

  const handleRestock = async (item: ItemRecord) => {
    const nextQuantity = item.quantity + 1;
    await updateItemStock(item.id, nextQuantity, new Date().toISOString());
    await refresh();
  };

  const handleCreate = async (payload: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    cycleDays: number;
    notes?: string;
    emoji?: string;
  }) => {
    await createItem(payload);
    await refresh();
  };

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

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => setLoggedIn(true)}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <SafeAreaView style={styles.boardContainer}>
      <View style={styles.boardHeader}>
        <View>
          <Text style={styles.boardTitle}>Stocker</Text>
          <Text style={styles.boardSubtitle}>日用品の在庫ボード</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLoggedIn(false)}
        >
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanbanRow}
      >
        {columns.map((column) => (
          <View key={column.key} style={styles.kanbanColumn}>
            <View style={styles.kanbanHeader}>
              <View
                style={[styles.kanbanDot, { backgroundColor: column.color }]}
              />
              <View style={styles.kanbanHeaderText}>
                <Text style={styles.kanbanTitle}>{column.title}</Text>
                <Text style={styles.kanbanDescription}>
                  {column.description}
                </Text>
              </View>
              <View style={styles.kanbanCountBadge}>
                <Text style={styles.kanbanCount}>
                  {grouped[column.key].length}
                </Text>
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardStack}
            >
              {grouped[column.key].map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardEmoji}>{item.emoji ?? '🧺'}</Text>
                    <View style={styles.cardTitleGroup}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardCategory}>{item.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    残量 {item.quantity} {item.unit} ・ {getDaysLabel(item)}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.cardNotes}>{item.notes}</Text>
                  ) : null}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.cardAction}
                      onPress={() => handleConsume(item)}
                    >
                      <Text style={styles.cardActionText}>使った</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cardAction, styles.cardActionPrimary]}
                      onPress={() => handleRestock(item)}
                    >
                      <Text style={styles.cardActionPrimaryText}>補充</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddOpen(true)}
      >
        <Text style={styles.fabText}>＋ 追加</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={async (payload) => {
          await handleCreate(payload);
          setAddOpen(false);
        }}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const LoginScreen = ({
  onLogin,
  loading,
  error,
}: {
  onLogin: () => void;
  loading: boolean;
  error: string | null;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.backgroundBlobBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Stocker</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            日用品の在庫を一枚のボードで管理しよう。
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9aa2a8"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9aa2a8"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => {
              if (loading) return;
              onLogin();
            }}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? '読み込み中…' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Reset', 'Password reset is not wired yet.')}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet?</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Sign up', 'Sign-up flow coming soon.')}
          >
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const AddItemModal = ({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    cycleDays: number;
    notes?: string;
    emoji?: string;
  }) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('本');
  const [cycleDays, setCycleDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState('');

  const reset = () => {
    setName('');
    setCategory('');
    setQuantity('1');
    setUnit('本');
    setCycleDays('30');
    setNotes('');
    setEmoji('');
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const qty = Number(quantity);
    const cycle = Number(cycleDays);
    if (!trimmedName) {
      Alert.alert('入力不足', '品目名を入力してください。');
      return;
    }
    if (!trimmedCategory) {
      Alert.alert('入力不足', 'カテゴリを入力してください。');
      return;
    }
    if (Number.isNaN(qty) || qty < 0) {
      Alert.alert('入力エラー', '残量は0以上の数値で入力してください。');
      return;
    }
    if (Number.isNaN(cycle) || cycle < 0) {
      Alert.alert('入力エラー', 'サイクル日数は0以上で入力してください。');
      return;
    }
    await onCreate({
      name: trimmedName,
      category: trimmedCategory,
      quantity: qty,
      unit: unit.trim() || '個',
      cycleDays: cycle,
      notes: notes.trim() || undefined,
      emoji: emoji.trim() || undefined,
    });
    reset();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>在庫を追加</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>品目名</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="例: 歯磨き粉"
                placeholderTextColor="#9aa2a8"
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>カテゴリ</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="例: 洗面"
                placeholderTextColor="#9aa2a8"
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>残量</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#9aa2a8"
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>単位</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="本/個/袋"
                  placeholderTextColor="#9aa2a8"
                  style={styles.modalInput}
                />
              </View>
            </View>
            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>消耗サイクル(日)</Text>
                <TextInput
                  value={cycleDays}
                  onChangeText={setCycleDays}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#9aa2a8"
                  style={styles.modalInput}
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>アイコン(絵文字)</Text>
                <TextInput
                  value={emoji}
                  onChangeText={setEmoji}
                  placeholder="🧻"
                  placeholderTextColor="#9aa2a8"
                  style={styles.modalInput}
                />
              </View>
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>メモ</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="例: 詰め替え用もチェック"
                placeholderTextColor="#9aa2a8"
                style={[styles.modalInput, styles.modalTextarea]}
                multiline
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.modalSubmit} onPress={handleSubmit}>
            <Text style={styles.modalSubmitText}>追加する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1eb',
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#f5c46b',
    opacity: 0.45,
  },
  backgroundBlobBottom: {
    position: 'absolute',
    bottom: -160,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#8cc6c0',
    opacity: 0.35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 10,
  },
  brand: {
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#60666d',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1d2329',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b656d',
    lineHeight: 22,
  },
  form: {
    gap: 18,
    paddingVertical: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#4b545b',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1d2329',
    borderWidth: 1,
    borderColor: '#e0ddd7',
  },
  primaryButton: {
    backgroundColor: '#1d2329',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#f8f4ee',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  link: {
    color: '#345b57',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#5b656d',
  },
  footerLink: {
    color: '#1d2329',
    fontWeight: '700',
  },
  errorText: {
    color: '#c04848',
    fontWeight: '600',
  },
  boardContainer: {
    flex: 1,
    backgroundColor: '#f7f4ef',
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  boardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d2329',
  },
  boardSubtitle: {
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
  kanbanRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    gap: 16,
  },
  kanbanColumn: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ede8e1',
  },
  kanbanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kanbanDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  kanbanHeaderText: {
    flex: 1,
  },
  kanbanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2329',
  },
  kanbanDescription: {
    fontSize: 12,
    color: '#7b838a',
  },
  kanbanCountBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f1ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kanbanCount: {
    color: '#1d2329',
    fontWeight: '700',
  },
  cardStack: {
    gap: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#f9f8f6',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#efeae2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2329',
  },
  cardCategory: {
    color: '#7b838a',
    fontSize: 12,
  },
  cardMeta: {
    marginTop: 8,
    color: '#4b545b',
    fontSize: 13,
  },
  cardNotes: {
    marginTop: 6,
    color: '#7b838a',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cardAction: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2ded8',
    alignItems: 'center',
  },
  cardActionText: {
    color: '#4b545b',
    fontWeight: '600',
  },
  cardActionPrimary: {
    backgroundColor: '#1d2329',
    borderColor: '#1d2329',
  },
  cardActionPrimaryText: {
    color: '#f9f6f0',
    fontWeight: '700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2329',
  },
  modalClose: {
    color: '#7b838a',
    fontWeight: '600',
  },
  modalField: {
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalFieldHalf: {
    flex: 1,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    color: '#5b656d',
    marginBottom: 6,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e0d9',
    color: '#1d2329',
  },
  modalTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalSubmit: {
    marginTop: 8,
    backgroundColor: '#1d2329',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#f9f6f0',
    fontWeight: '700',
  },
});
