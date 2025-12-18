import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Dashboard } from './views/Dashboard';
import { TopicCreator } from './views/TopicCreator';
import { TopicEditor } from './views/TopicEditor';
import { StudyMode } from './views/StudyMode';

// ============================================================================
// ROUTER INTERNO
// ============================================================================

function AppRouter() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'dashboard':
      return <Dashboard />;
    case 'creator':
      return <TopicCreator />;
    case 'editor':
      return <TopicEditor />;
    case 'study':
      return <StudyMode />;
    default:
      return <Dashboard />;
  }
}

// ============================================================================
// APP PRINCIPAL
// ============================================================================

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
