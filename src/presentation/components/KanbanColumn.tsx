import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemRecord } from '../../domain/models/item';
import { ItemCard } from './ItemCard';

type KanbanColumnProps = {
  title: string;
  description: string;
  color: string;
  items: ItemRecord[];
  onConsume: (item: ItemRecord) => void;
  onRestock: (item: ItemRecord) => void;
};

export const KanbanColumn = ({
  title,
  description,
  color,
  items,
  onConsume,
  onRestock,
}: KanbanColumnProps) => {
  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.count}>{items.length}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onConsume={onConsume}
            onRestock={onRestock}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ede8e1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2329',
  },
  description: {
    fontSize: 12,
    color: '#7b838a',
  },
  countBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f1ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#1d2329',
    fontWeight: '700',
  },
  stack: {
    gap: 12,
    paddingBottom: 16,
  },
});
