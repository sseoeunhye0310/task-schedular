import { useState } from 'react';
import { AREAS, AREA_MAP } from '../constants/areas';

export default function AreaTab({ tasks, toggleTask, deleteTask }) {
  const [selectedArea, setSelectedArea] = useState('paua');
  const [view, setView] = useState('today');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const areaTasks = tasks.filter(t => t.area === selectedArea);
  const area = AREA_MAP[selectedArea];

  const filtered = areaTasks.filter(t => {
    const d = t.date?.toDate();
    if (!d) return false;
    const ds = d.toISOString().split('T')[0];
    if (view === 'today') return ds === todayStr && !t.completed;
    if (view === 'week') return d >= weekStart && d <= weekEnd && !t.completed;
    if (view === 'recurring') return t.isRecurring && !t.completed;
    if (view === 'done') return t.completed;
    return false;
  });

  const VIEWS = [
    { key: 'today', label: '오늘' },
    { key: 'week', label: '이번 주' },
    { key: 'recurring', label: '반복' },
    { key: 'done', label: '완료' },
  ];

  return (
    <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
      {/* 영역 선택 */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {AREAS.map(a => {
          const cnt = tasks.filter(t => t.area === a.code && !t.completed).length;
          return (
            <button
              key={a.code}
              onClick={() => setSelectedArea(a.code)}
              className="rounded-2xl p-3 text-left transition-all active:scale-95"
              style={selectedArea === a.code
                ? { background: a.text, boxShadow: `0 4px 14px ${a.text}55` }
                : { background: a.bg }
              }
            >
              <p className="text-xl font-bold mb-0.5" style={{ color: selectedArea === a.code ? '#fff' : a.text }}>
                {cnt}
              </p>
              <p className="text-xs font-semibold leading-tight" style={{ color: selectedArea === a.code ? 'rgba(255,255,255,0.85)' : a.text }}>
                {a.short}
              </p>
            </button>
          );
        })}
      </div>

      {/* 선택된 영역 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-4 rounded-full" style={{ background: area.text }} />
        <h3 className="text-lg font-bold text-gray-800">{area.label}</h3>
      </div>

      {/* 보기 탭 */}
      <div className="flex gap-1.5 mb-4 bg-gray-100 rounded-2xl p-1.5">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="flex-1 text-sm py-2 rounded-xl font-semibold transition-all"
            style={view === v.key
              ? { background: area.text, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
              : { color: '#9ca3af' }
            }
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 할 일 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-base text-gray-400 font-medium">해당 업무가 없습니다</p>
        </div>
      ) : (
        filtered.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 py-3.5 px-4 rounded-2xl mb-2.5 bg-white shadow-sm"
            style={{ borderLeft: `5px solid ${area.text}` }}
          >
            <button
              onClick={() => toggleTask(task.id, task.completed)}
              className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: task.completed ? area.text : '#d1d5db',
                background: task.completed ? area.text : 'transparent',
              }}
            >
              {task.completed && <span className="text-white text-xs font-bold">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className="text-base font-medium"
                style={{
                  color: task.completed ? '#9ca3af' : '#1f2937',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {task.date?.toDate()?.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                {task.isRecurring && ' · 반복'}
              </p>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-base"
            >✕</button>
          </div>
        ))
      )}
    </div>
  );
}
