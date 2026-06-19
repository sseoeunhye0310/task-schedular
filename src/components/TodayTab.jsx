import { useState } from 'react';
import { AREAS, AREA_MAP } from '../constants/areas';
import { localDateStr, taskDateStr } from '../hooks/useTasks';

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const S = {
  wrap: { padding: '16px', boxSizing: 'border-box', width: '100%' },
  hero: { background: '#1A3557', borderRadius: '20px', padding: '20px', marginBottom: '14px', color: '#fff' },
  heroYear: { fontSize: '13px', color: '#93b8d4', marginBottom: '2px' },
  heroDateRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  heroDate: { fontSize: '20px', fontWeight: '700', flex: 1, textAlign: 'center' },
  heroNavBtn: { width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  todayChip: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#fff', marginLeft: '8px', verticalAlign: 'middle' },
  heroRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' },
  heroLabel: { fontSize: '13px', color: '#93b8d4' },
  heroCount: { fontSize: '18px', fontWeight: '700' },
  heroBar: { height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' },
  heroFill: { height: '100%', background: '#fff', borderRadius: '3px', transition: 'width .6s' },
  heroPct: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'right' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' },
  chip: { fontSize: '13px', fontWeight: '600', padding: '6px 12px', borderRadius: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '4px' },
  dot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  sectionLabel: { fontSize: '14px', fontWeight: '700', color: '#1f2937', flex: 1 },
  sectionCnt: { fontSize: '12px', color: '#9ca3af' },
  taskItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#fff', borderRadius: '14px', marginBottom: '7px', borderLeft: '4px solid', boxSizing: 'border-box', width: '100%' },
  checkBtn: { width: '22px', height: '22px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', background: 'transparent' },
  taskText: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: '15px', fontWeight: '500', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  taskMeta: { fontSize: '12px', color: '#9ca3af', display: 'flex', gap: '5px', alignItems: 'center' },
  badge: { fontSize: '11px', padding: '1px 7px', borderRadius: '10px', fontWeight: '500' },
  delBtn: { width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '15px', color: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '15px', color: '#6b7280', fontWeight: '500' },
  emptySubText: { fontSize: '13px', color: '#9ca3af', marginTop: '4px' },
  fab: { position: 'fixed', bottom: '80px', right: '20px', width: '54px', height: '54px', borderRadius: '50%', background: '#1A3557', border: 'none', cursor: 'pointer', fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,53,87,0.4)', zIndex: 5 },
  form: { background: '#fff', borderRadius: '18px', padding: '18px', marginBottom: '14px', border: '1px solid #e5e7eb' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' },
  input: { width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit', background: '#f9fafb' },
  select: { flex: 1, padding: '11px 12px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: '#f9fafb' },
  dateInput: { padding: '11px 12px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: '#f9fafb' },
  btnRow: { display: 'flex', gap: '8px', marginTop: '4px' },
  btnPrimary: { flex: 1, padding: '13px', background: '#1A3557', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
  btnSecondary: { flex: 1, padding: '13px', background: '#f3f4f6', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' },
};

function TaskItem({ task, onToggle, onDelete }) {
  const area = AREA_MAP[task.area] || AREA_MAP.etc;
  const borderColor = task.carriedOver ? '#e74c3c' : area.text;
  return (
    <div style={{ ...S.taskItem, borderLeftColor: borderColor }}>
      <button
        onClick={() => onToggle(task.id, task.completed)}
        style={{ ...S.checkBtn, borderColor: task.completed ? area.text : '#d1d5db', background: task.completed ? area.text : 'transparent' }}
      >
        {task.completed && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>}
      </button>
      <div style={S.taskText}>
        <div style={{ ...S.taskTitle, color: task.completed ? '#9ca3af' : '#1f2937', textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </div>
        <div style={S.taskMeta}>
          <span style={{ fontWeight: '600', color: area.text }}>{area.short}</span>
          {task.carriedOver && <span style={{ ...S.badge, background: '#fef2f2', color: '#e74c3c' }}>이월</span>}
          {task.isRecurring && !task.carriedOver && <span style={{ ...S.badge, background: '#f3f4f6', color: '#9ca3af' }}>반복</span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} style={S.delBtn}>✕</button>
    </div>
  );
}

function AddTaskForm({ defaultDate, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('paua');
  const [date, setDate] = useState(defaultDate);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), area, date });
    setTitle('');
  };
  return (
    <form onSubmit={handleSubmit} style={S.form}>
      <div style={S.formTitle}>새 업무 추가</div>
      <input autoFocus type="text" placeholder="업무명을 입력하세요 (필수)" value={title}
        onChange={e => setTitle(e.target.value)} style={S.input} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <select value={area} onChange={e => setArea(e.target.value)} style={S.select}>
          {AREAS.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={S.dateInput} />
      </div>
      <div style={S.btnRow}>
        <button type="submit" style={S.btnPrimary}>추가하기</button>
        <button type="button" onClick={onCancel} style={S.btnSecondary}>취소</button>
      </div>
    </form>
  );
}

export default function TodayTab({ tasks, addTask, toggleTask, deleteTask }) {
  const [showForm, setShowForm] = useState(false);

  // 날짜 오프셋 (0=오늘, -1=어제, +1=내일 ...)
  const [offset, setOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setDate(baseDate.getDate() + offset);

  const todayBase = new Date();
  todayBase.setHours(0, 0, 0, 0);
  const todayStr = localDateStr(todayBase);
  const selectedStr = localDateStr(baseDate);
  const isToday = offset === 0;

  const dayTasks = tasks.filter(t => taskDateStr(t) === selectedStr);
  const done = dayTasks.filter(t => t.completed).length;
  const total = dayTasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const grouped = {};
  dayTasks.forEach(t => { if (!grouped[t.area]) grouped[t.area] = []; grouped[t.area].push(t); });
  const remaining = AREAS.filter(a => (grouped[a.code] || []).some(t => !t.completed));

  const dateLabel = `${baseDate.getMonth() + 1}월 ${baseDate.getDate()}일 ${DAYS_KR[baseDate.getDay()]}요일`;
  const progressLabel = isToday ? '오늘의 진행률' : offset < 0 ? `${Math.abs(offset)}일 전` : `${offset}일 후`;

  return (
    <div style={S.wrap}>
      {/* 히어로 카드 */}
      <div style={S.hero}>
        <div style={S.heroYear}>{baseDate.getFullYear()}년</div>
        <div style={S.heroDateRow}>
          <button style={S.heroNavBtn} onClick={() => { setOffset(o => o - 1); setShowForm(false); }}>◀</button>
          <div style={{ textAlign: 'center' }}>
            <span style={S.heroDate}>{dateLabel}</span>
            {isToday && <span style={S.todayChip}>오늘</span>}
          </div>
          <button style={S.heroNavBtn} onClick={() => { setOffset(o => o + 1); setShowForm(false); }}>▶</button>
        </div>
        <div style={S.heroRow}>
          <span style={S.heroLabel}>{progressLabel}</span>
          <span style={S.heroCount}>{done} / {total}</span>
        </div>
        <div style={S.heroBar}><div style={{ ...S.heroFill, width: `${pct}%` }} /></div>
        <div style={S.heroPct}>{pct}% 완료</div>
      </div>

      {/* 영역 칩 */}
      {remaining.length > 0 && (
        <div style={S.chips}>
          {remaining.map(a => {
            const cnt = (grouped[a.code] || []).filter(t => !t.completed).length;
            return <span key={a.code} style={{ ...S.chip, background: a.bg, color: a.text }}>{a.short} {cnt}</span>;
          })}
        </div>
      )}

      {/* 추가 폼 */}
      {showForm && (
        <AddTaskForm
          defaultDate={selectedStr}
          onAdd={(d) => { addTask(d); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 영역별 목록 */}
      {AREAS.map(area => {
        const items = (grouped[area.code] || []).sort((a, b) => a.completed - b.completed);
        if (!items.length) return null;
        return (
          <div key={area.code} style={{ marginBottom: '16px' }}>
            <div style={S.sectionHeader}>
              <div style={{ ...S.dot, background: area.text }} />
              <span style={S.sectionLabel}>{area.label}</span>
              <span style={S.sectionCnt}>{items.filter(t => t.completed).length}/{items.length}</span>
            </div>
            {items.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
          </div>
        );
      })}

      {total === 0 && !showForm && (
        <div style={S.empty}>
          <div style={S.emptyIcon}>{isToday ? '✨' : '📭'}</div>
          <div style={S.emptyText}>{isToday ? '오늘 등록된 업무가 없습니다' : '이 날 등록된 업무가 없습니다'}</div>
          <div style={S.emptySubText}>아래 + 버튼으로 추가해보세요</div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={S.fab} aria-label="업무 추가">+</button>
      )}
    </div>
  );
}
