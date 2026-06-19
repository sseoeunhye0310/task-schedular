import { useState } from 'react';
import { AREAS, AREA_MAP } from '../constants/areas';
import { localDateStr, taskDateStr } from '../hooks/useTasks';

const VIEWS = [
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'recurring', label: '반복' },
  { key: 'done', label: '완료' },
];

export default function AreaTab({ tasks, toggleTask, deleteTask }) {
  const [selectedArea, setSelectedArea] = useState('paua');
  const [view, setView] = useState('today');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = localDateStr(today);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const area = AREA_MAP[selectedArea];

  const filtered = tasks.filter(t => {
    if (t.area !== selectedArea) return false;
    const ds = taskDateStr(t);
    if (view === 'today') return ds === todayStr && !t.completed;
    if (view === 'week') {
      const d = t.date?.toDate();
      return d && d >= weekStart && d <= weekEnd && !t.completed;
    }
    if (view === 'recurring') return t.isRecurring && !t.completed;
    if (view === 'done') return t.completed;
    return false;
  });

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>

      {/* 영역 선택 그리드 (2열) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {AREAS.map(a => {
          const cnt = tasks.filter(t => t.area === a.code && !t.completed).length;
          const isSel = selectedArea === a.code;
          return (
            <button
              key={a.code}
              onClick={() => setSelectedArea(a.code)}
              style={{
                borderRadius: '16px', padding: '14px 16px', textAlign: 'left',
                border: isSel ? `2px solid ${a.text}` : '2px solid transparent',
                background: isSel ? a.text : a.bg,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700', color: isSel ? '#fff' : a.text, marginBottom: '2px' }}>
                {cnt}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: isSel ? 'rgba(255,255,255,0.85)' : a.text }}>
                {a.short}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택 영역명 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: area.text, flexShrink: 0 }} />
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{area.label}</span>
      </div>

      {/* 보기 탭 */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '14px', padding: '4px', marginBottom: '14px' }}>
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              background: view === v.key ? area.text : 'transparent',
              color: view === v.key ? '#fff' : '#9ca3af',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 할 일 목록 */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: '500' }}>해당 업무가 없습니다</p>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '13px 14px', background: '#fff', borderRadius: '14px',
            marginBottom: '7px', borderLeft: `4px solid ${area.text}`, boxSizing: 'border-box', width: '100%',
          }}>
            <button
              onClick={() => toggleTask(task.id, task.completed)}
              style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${task.completed ? area.text : '#d1d5db'}`,
                background: task.completed ? area.text : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              {task.completed && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '15px', fontWeight: '500', color: task.completed ? '#9ca3af' : '#1f2937',
                textDecoration: task.completed ? 'line-through' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {task.title}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                {task.date?.toDate()?.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                {task.isRecurring && ' · 반복'}
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '15px', color: '#d1d5db', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        ))
      )}
    </div>
  );
}
