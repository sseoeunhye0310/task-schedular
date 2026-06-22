import { useState } from 'react';
import { AREAS } from '../constants/areas';
import { taskDateStr } from '../hooks/useTasks';
import { generatePDF } from '../utils/pdf';

function getWeekRange(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 이번 주 월요일
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function getMonthRange(offset) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + offset;
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function weekLabel(start, end) {
  const sM = start.getMonth() + 1, sD = start.getDate();
  const eM = end.getMonth() + 1, eD = end.getDate();
  if (sM === eM) return `${sM}월 ${sD}일 ~ ${eD}일`;
  return `${sM}월 ${sD}일 ~ ${eM}월 ${eD}일`;
}

function monthLabel(start) {
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월`;
}

export default function ReportTab({ tasks }) {
  const [period, setPeriod] = useState('weekly');
  const [offset, setOffset] = useState(0);
  const [generating, setGenerating] = useState(false);

  const { start, end } = period === 'weekly' ? getWeekRange(offset) : getMonthRange(offset);

  const label = period === 'weekly' ? weekLabel(start, end) : monthLabel(start);
  const isCurrentPeriod = offset === 0;

  const filteredTasks = tasks.filter(t => {
    const ds = taskDateStr(t);
    if (!ds) return false;
    if (!t.completed) return false;
    const d = new Date(ds + 'T00:00:00');
    return d >= start && d <= end;
  });

  const grouped = {};
  filteredTasks.forEach(t => {
    if (!grouped[t.area]) grouped[t.area] = [];
    grouped[t.area].push(t);
  });

  const handlePDF = async () => {
    if (filteredTasks.length === 0) { alert('완료된 업무가 없습니다.'); return; }
    setGenerating(true);
    try {
      await generatePDF(filteredTasks, period, label);
    } finally {
      setGenerating(false);
    }
  };

  const navBtn = (dir) => ({
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.15)', border: 'none',
    color: '#fff', fontSize: '18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>
      {/* 헤더 카드 */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937, #374151)', borderRadius: '20px', padding: '20px', marginBottom: '18px', color: '#fff' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>업무 완료 보고서</div>

        {/* 주간/월간 토글 */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px', marginBottom: '14px' }}>
          {['weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => { setPeriod(p); setOffset(0); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: period === p ? '#fff' : 'transparent',
                color: period === p ? '#1f2937' : '#9ca3af',
              }}>
              {p === 'weekly' ? '주간' : '월간'}
            </button>
          ))}
        </div>

        {/* 기간 네비게이션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <button style={navBtn()} onClick={() => setOffset(o => o - 1)}>◀</button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>{label}</div>
            {isCurrentPeriod && (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                {period === 'weekly' ? '이번 주' : '이번 달'}
              </div>
            )}
            {offset < 0 && (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                {period === 'weekly' ? `${Math.abs(offset)}주 전` : `${Math.abs(offset)}달 전`}
              </div>
            )}
          </div>
          <button style={{ ...navBtn(), opacity: offset >= 0 ? 0.3 : 1, cursor: offset >= 0 ? 'default' : 'pointer' }}
            onClick={() => offset < 0 && setOffset(o => o + 1)}>▶</button>
        </div>

        {/* 요약 + PDF */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>{filteredTasks.length}건 완료</div>
          <button onClick={handlePDF} disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
              background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: generating ? 0.7 : 1,
            }}>
            {generating ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {/* 영역별 내용 */}
      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: '500' }}>해당 기간에 완료된 업무가 없습니다</p>
        </div>
      ) : (
        AREAS.map(area => {
          const items = grouped[area.code];
          if (!items || items.length === 0) return null;
          return (
            <div key={area.code} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: area.text, flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: '700', color: area.text }}>{area.label}</span>
                <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: 'auto' }}>{items.length}건</span>
              </div>
              {items.map(task => (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 14px', background: '#fff', borderRadius: '14px',
                  marginBottom: '6px', borderLeft: `4px solid ${area.text}`,
                  boxSizing: 'border-box', width: '100%',
                }}>
                  <span style={{ color: '#d1d5db', fontSize: '14px', flexShrink: 0 }}>○</span>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#374151', minWidth: 0 }}>
                    {task.title} 업무를 진행함.
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
                    {taskDateStr(task).slice(5).replace('-', '/')}
                  </span>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
