import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useTasks } from './hooks/useTasks';
import LoginScreen from './components/LoginScreen';
import TodayTab from './components/TodayTab';
import AreaTab from './components/AreaTab';
import MonthlyPlanTab from './components/MonthlyPlanTab';
import YearlyPlanTab from './components/YearlyPlanTab';
import ReportTab from './components/ReportTab';

const TABS = [
  { id: 'today', label: '오늘', icon: '☀️' },
  { id: 'area', label: '영역별', icon: '📂' },
  { id: 'monthly', label: '월간', icon: '📆' },
  { id: 'yearly', label: '연간', icon: '🗓️' },
  { id: 'report', label: '보고서', icon: '📋' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks(user);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-400 text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const renderTab = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-base">불러오는 중...</p>
      </div>
    );
    switch (activeTab) {
      case 'today': return <TodayTab tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'area': return <AreaTab tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'monthly': return <MonthlyPlanTab user={user} tasks={tasks} />;
      case 'yearly': return <YearlyPlanTab user={user} />;
      case 'report': return <ReportTab tasks={tasks} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📅</span>
          <span className="font-bold text-gray-800 text-lg">업무 스케줄러</span>
        </div>
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full border-2 border-gray-100" />
          )}
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭 콘텐츠 */}
      <main className="flex-1 pb-24 overflow-auto">
        {renderTab()}
      </main>

      {/* 하단 탭 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-100 flex shadow-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span className="text-xs font-semibold">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
