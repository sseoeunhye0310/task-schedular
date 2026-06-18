import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useTasks } from './hooks/useTasks';
import LoginScreen from './components/LoginScreen';
import TodayTab from './components/TodayTab';
import CalendarTab from './components/CalendarTab';
import AreaTab from './components/AreaTab';
import MonthlyPlanTab from './components/MonthlyPlanTab';
import YearlyPlanTab from './components/YearlyPlanTab';
import ReportTab from './components/ReportTab';

const TABS = [
  { id: 'today', label: '오늘', icon: '☀️' },
  { id: 'calendar', label: '캘린더', icon: '📅' },
  { id: 'area', label: '영역별', icon: '📂' },
  { id: 'monthly', label: '월간', icon: '📆' },
  { id: 'report', label: '보고서', icon: '📋' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [tabHistory, setTabHistory] = useState(['today']);
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks(user);

  useEffect(() => {
    // 리다이렉트 결과 먼저 처리 후 auth 상태 구독
    const init = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
          setAuthLoading(false);
          return () => {};
        }
      } catch (e) {
        console.error('redirect result error', e);
      }
      const unsub = onAuthStateChanged(auth, u => {
        setUser(u);
        setAuthLoading(false);
      });
      return unsub;
    };
    let cleanup;
    init().then(fn => { cleanup = fn; });
    return () => { if (cleanup) cleanup(); };
  }, []);

  const goToTab = (tab) => {
    if (tab === activeTab) return;
    setTabHistory(prev => [...prev, tab]);
    setActiveTab(tab);
  };

  const goBack = () => {
    if (tabHistory.length <= 1) return;
    const newHistory = tabHistory.slice(0, -1);
    setTabHistory(newHistory);
    setActiveTab(newHistory[newHistory.length - 1]);
  };

  const goHome = () => {
    setTabHistory(['today']);
    setActiveTab('today');
  };

  const canGoBack = tabHistory.length > 1;
  const currentTabLabel = TABS.find(t => t.id === activeTab)?.label || '';

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
          <p style={{ color: '#9ca3af', fontSize: '16px' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const renderTab = () => {
    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
        <div style={{ fontSize: '32px' }}>📅</div>
        <p style={{ color: '#9ca3af', fontSize: '15px' }}>업무를 불러오는 중...</p>
      </div>
    );
    if (error) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', padding: '16px' }}>
        <div style={{ fontSize: '32px' }}>⚠️</div>
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>데이터를 불러오지 못했습니다.<br />인터넷 연결을 확인하고 새로고침해주세요.</p>
      </div>
    );
    switch (activeTab) {
      case 'today': return <TodayTab tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'calendar': return <CalendarTab tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'area': return <AreaTab tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} />;
      case 'monthly': return <MonthlyPlanTab user={user} tasks={tasks} />;
      case 'yearly': return <YearlyPlanTab user={user} />;
      case 'report': return <ReportTab tasks={tasks} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column', maxWidth: '640px', margin: '0 auto' }}>

      {/* 헤더 */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        gap: '8px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={goBack}
          disabled={!canGoBack}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid #e5e7eb', background: canGoBack ? '#fff' : '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: canGoBack ? 'pointer' : 'default',
            fontSize: '18px', color: canGoBack ? '#374151' : '#d1d5db',
            flexShrink: 0, transition: 'all 0.15s',
          }}
          aria-label="뒤로가기"
        >
          ‹
        </button>

        <button
          onClick={goHome}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid #e5e7eb', background: activeTab === 'today' ? '#E6F1FB' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '18px',
            color: activeTab === 'today' ? '#0C447C' : '#374151',
            flexShrink: 0, transition: 'all 0.15s',
          }}
          aria-label="홈으로"
        >
          🏠
        </button>

        <span style={{ flex: 1, fontSize: '17px', fontWeight: '700', color: '#1f2937', textAlign: 'center' }}>
          {currentTabLabel}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {user.photoURL
            ? <img src={user.photoURL} alt={user.displayName} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #e5e7eb' }} />
            : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#0C447C' }}>은</div>
          }
          <button
            onClick={() => signOut(auth)}
            style={{
              fontSize: '13px', color: '#9ca3af', border: '1px solid #e5e7eb',
              background: '#fff', borderRadius: '8px', padding: '5px 10px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭 콘텐츠 */}
      <main style={{ flex: 1, paddingBottom: '80px', overflow: 'auto' }}>
        {renderTab()}
      </main>

      {/* 하단 탭 바 */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '640px',
        background: '#fff', borderTop: '1px solid #f0f0f0',
        display: 'flex',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => goToTab(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '8px 0 10px', gap: '2px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeTab === tab.id ? '#0C447C' : '#9ca3af',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', fontFamily: 'inherit' }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0C447C' }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
