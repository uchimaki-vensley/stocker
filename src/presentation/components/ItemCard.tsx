import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemRecord, getDaysLabel } from '../../domain/models/item';

type ItemCardProps = {
  item: ItemRecord;
  onConsume: (item: ItemRecord) => void;
  onRestock: (item: ItemRecord) => void;
};

export const ItemCard = ({ item, onConsume, onRestock }: ItemCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{item.emoji ?? '🧺'}</Text>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        残量 {item.quantity} {item.unit} ・ {getDaysLabel(item)}
      </Text>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => onConsume(item)}>
          <Text style={styles.actionText}>使った</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, styles.actionPrimary]}
          onPress={() => onRestock(item)}
        >
          <Text style={styles.actionPrimaryText}>補充</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f8f6',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#efeae2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2329',
  },
  category: {
    color: '#7b838a',
    fontSize: 12,
  },
  meta: {
    marginTop: 8,
    color: '#4b545b',
    fontSize: 13,
  },
  notes: {
    marginTop: 6,
    color: '#7b838a',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  action: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2ded8',
    alignItems: 'center',
  },
  actionText: {
    color: '#4b545b',
    fontWeight: '600',
  },
  actionPrimary: {
    backgroundColor: '#1d2329',
    borderColor: '#1d2329',
  },
  actionPrimaryText: {
    color: '#f9f6f0',
    fontWeight: '700',
  },
});
