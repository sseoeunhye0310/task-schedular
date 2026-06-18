import { useState } from 'react';
import { AREAS, AREA_MAP } from '../constants/areas';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = n => String(n).padStart(2, '0');
const localDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function CalendarTab({ tasks, addTask, toggleTask, deleteTask }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(localDateStr(now));

  const todayStr = localDateStr(now);

  // 이번 달 첫날/마지막날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=일
  const totalDays = lastDay.getDate();

  // 날짜별 태스크 색상 맵
  const dotMap = {};
  tasks.forEach(t => {
    const d = t.date?.toDate();
    if (!d) return;
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const ds = localDateStr(d);
    if (!dotMap[ds]) dotMap[ds] = new Set();
    dotMap[ds].add(t.area);
  });

  // 선택된 날의 태스크
  const selectedTasks = tasks
    .filter(t => { const d = t.date?.toDate(); return d && localDateStr(d) === selectedDate; })
    .sort((a, b) => a.completed - b.completed);

  const navBtn = {
    width: '36px', height: '36px', borderRadius: '10px', background: '#f3f4f6',
    border: 'none', fontSize: '20px', cursor: 'pointer', color: '#374151',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0,
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // 캘린더 셀 배열 (앞쪽 빈칸 포함)
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button style={navBtn} onClick={prevMonth}>‹</button>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
          {year}년 {month + 1}월
        </div>
        <button style={navBtn} onClick={nextMonth}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '12px', fontWeight: '700', paddingBottom: '6px',
            color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#9ca3af',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '20px' }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const ds = `${year}-${pad(month + 1)}-${pad(day)}`;
          const isToday = ds === todayStr;
          const isSel = ds === selectedDate;
          const dots = dotMap[ds] ? [...dotMap[ds]] : [];
          const dow = (startDow + day - 1) % 7;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(ds)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 2px', borderRadius: '10px', border: 'none',
                background: isSel ? '#1A3557' : isToday ? '#E6F1FB' : 'transparent',
                cursor: 'pointer', fontFamily: 'inherit', minHeight: '52px',
              }}
            >
              <span style={{
                fontSize: '14px', fontWeight: isSel || isToday ? '700' : '400',
                color: isSel ? '#fff' : isToday ? '#0C447C' : dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6' : '#1f2937',
                marginBottom: '3px',
              }}>
                {day}
              </span>
              {/* 컬러 도트 (최대 3개) */}
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {dots.slice(0, 3).map(area => (
                  <div key={area} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isSel ? 'rgba(255,255,255,0.7)' : AREA_MAP[area]?.text || '#9ca3af',
                    flexShrink: 0,
                  }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 날 업무 목록 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
            {parseInt(selectedDate.split('-')[1])}월 {parseInt(selectedDate.split('-')[2])}일 업무
          </div>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>{selectedTasks.length}건</span>
        </div>

        {selectedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '14px' }}>
            이 날 등록된 업무가 없습니다
          </div>
        ) : (
          selectedTasks.map(task => {
            const area = AREA_MAP[task.area] || AREA_MAP.etc;
            return (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px', background: '#fff', borderRadius: '14px',
                marginBottom: '7px', borderLeft: `4px solid ${area.text}`,
                boxSizing: 'border-box', width: '100%',
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
                    fontSize: '15px', fontWeight: '500',
                    color: task.completed ? '#9ca3af' : '#1f2937',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: area.text, fontWeight: '600', marginTop: '2px' }}>
                    {area.short}
                    {task.isRecurring && <span style={{ color: '#9ca3af', fontWeight: '400' }}> · 반복</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '15px', color: '#d1d5db', flexShrink: 0 }}
                >✕</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
