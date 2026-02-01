import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type AddItemModalProps = {
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
};

export const AddItemModal = ({ visible, onClose, onCreate }: AddItemModalProps) => {
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
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>在庫を追加</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>品目名</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="例: 歯磨き粉"
                placeholderTextColor="#9aa2a8"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>カテゴリ</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="例: 洗面"
                placeholderTextColor="#9aa2a8"
                style={styles.input}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>残量</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#9aa2a8"
                  style={styles.input}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>単位</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="本/個/袋"
                  placeholderTextColor="#9aa2a8"
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>消耗サイクル(日)</Text>
                <TextInput
                  value={cycleDays}
                  onChangeText={setCycleDays}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#9aa2a8"
                  style={styles.input}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>アイコン(絵文字)</Text>
                <TextInput
                  value={emoji}
                  onChangeText={setEmoji}
                  placeholder="🧻"
                  placeholderTextColor="#9aa2a8"
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>メモ</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="例: 詰め替え用もチェック"
                placeholderTextColor="#9aa2a8"
                style={[styles.input, styles.textarea]}
                multiline
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
            <Text style={styles.submitText}>追加する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2329',
  },
  close: {
    color: '#7b838a',
    fontWeight: '600',
  },
  field: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#5b656d',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e0d9',
    color: '#1d2329',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submit: {
    marginTop: 8,
    backgroundColor: '#1d2329',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#f9f6f0',
    fontWeight: '700',
  },
});
