import { useState } from 'react';
import { BoardScreen } from './src/presentation/screens/BoardScreen';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { useItems } from './src/presentation/hooks/useItems';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { items, loading, error, consume, restock, create } = useItems();

  if (!loggedIn) {
    return (
      <LoginScreen onLogin={() => setLoggedIn(true)} loading={loading} error={error} />
    );
  }

  return (
    <BoardScreen
      items={items}
      onLogout={() => setLoggedIn(false)}
      onConsume={consume}
      onRestock={restock}
      onCreate={create}
    />
  );
}
