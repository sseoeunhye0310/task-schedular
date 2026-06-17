import { useState } from 'react';
import { AREAS, AREA_MAP } from '../constants/areas';

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

function TaskItem({ task, onToggle, onDelete }) {
  const area = AREA_MAP[task.area] || AREA_MAP.etc;
  return (
    <div
      className="flex items-center gap-3 py-3.5 px-4 rounded-2xl mb-2.5 shadow-sm"
      style={{
        background: '#fff',
        borderLeft: task.carriedOver ? '5px solid #e74c3c' : `5px solid ${area.text}`,
      }}
    >
      <button
        onClick={() => onToggle(task.id, task.completed)}
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
          className="text-base font-medium truncate"
          style={{
            color: task.completed ? '#9ca3af' : '#1f2937',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-semibold" style={{ color: area.text }}>{area.short}</span>
          {task.carriedOver && (
            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">어제 미완료</span>
          )}
          {task.isRecurring && !task.carriedOver && (
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">반복</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-base"
      >✕</button>
    </div>
  );
}

function AddTaskForm({ onAdd, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('paua');
  const [date, setDate] = useState(today);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), area, date });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-4">
      <p className="text-base font-bold text-gray-700 mb-3">새 업무 추가</p>
      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="text"
          placeholder="업무명을 입력하세요 (필수)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border-2 border-gray-100 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-400 bg-gray-50"
        />
        <div className="flex gap-2">
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            className="border-2 border-gray-100 rounded-xl px-3 py-3 text-sm outline-none flex-1 bg-gray-50"
          >
            {AREAS.map(a => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border-2 border-gray-100 rounded-xl px-3 py-3 text-sm outline-none bg-gray-50"
          />
        </div>
        <div className="flex gap-2 mt-1">
          <button type="submit"
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-blue-700 active:scale-95 transition-all">
            추가하기
          </button>
          <button type="button" onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-base font-semibold hover:bg-gray-200 active:scale-95 transition-all">
            취소
          </button>
        </div>
      </div>
    </form>
  );
}

export default function TodayTab({ tasks, addTask, toggleTask, deleteTask }) {
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const todayTasks = tasks.filter(t => {
    const d = t.date?.toDate();
    if (!d) return false;
    return d.toISOString().split('T')[0] === todayStr;
  });

  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const grouped = {};
  todayTasks.forEach(t => {
    if (!grouped[t.area]) grouped[t.area] = [];
    grouped[t.area].push(t);
  });

  const remaining = AREAS.map(a => ({
    ...a,
    count: (grouped[a.code] || []).filter(t => !t.completed).length,
  })).filter(a => a.count > 0);

  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${DAYS_KR[today.getDay()]}요일`;

  return (
    <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
      {/* 날짜 + 진행 현황 카드 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-5 mb-5 text-white shadow-lg">
        <p className="text-blue-200 text-sm font-medium mb-1">{today.getFullYear()}년</p>
        <h2 className="text-2xl font-bold mb-4">{dateLabel}</h2>

        <div className="flex items-end justify-between mb-2">
          <span className="text-blue-100 text-sm">오늘의 진행률</span>
          <span className="text-xl font-bold">{completedCount} / {totalCount}</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-blue-200 text-xs mt-1.5 text-right">{pct}% 완료</p>
      </div>

      {/* 남은 영역 칩 */}
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {remaining.map(a => (
            <span
              key={a.code}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full"
              style={{ background: a.bg, color: a.text }}
            >
              {a.short} {a.count}
            </span>
          ))}
        </div>
      )}

      {/* 할일 추가 폼 */}
      {showForm && (
        <AddTaskForm
          onAdd={(data) => { addTask(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* 영역별 할 일 목록 */}
      {AREAS.map(area => {
        const areaItems = (grouped[area.code] || []).sort((a, b) => a.completed - b.completed);
        if (areaItems.length === 0) return null;
        return (
          <div key={area.code} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-3 h-3 rounded-full" style={{ background: area.text }} />
              <span className="text-sm font-bold text-gray-700">{area.label}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {areaItems.filter(t => t.completed).length}/{areaItems.length}
              </span>
            </div>
            {areaItems.map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        );
      })}

      {todayTasks.length === 0 && !showForm && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">✨</p>
          <p className="text-base text-gray-500 font-medium">오늘 등록된 업무가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">아래 + 버튼으로 추가해보세요</p>
        </div>
      )}

      {/* 플로팅 추가 버튼 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-5 w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl text-3xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
          style={{ boxShadow: '0 8px 24px rgba(59,130,246,0.5)' }}
        >
          +
        </button>
      )}
    </div>
  );
}
