import { useState } from 'react';
import { AREAS } from '../constants/areas';
import { generatePDF } from '../utils/pdf';

export default function ReportTab({ tasks }) {
  const [period, setPeriod] = useState('weekly');
  const [generating, setGenerating] = useState(false);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const getPeriodRange = () => {
    if (period === 'weekly') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() + 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    } else {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: today };
    }
  };

  const { start, end } = getPeriodRange();

  const filteredTasks = tasks.filter(t => {
    const d = t.date?.toDate();
    if (!d) return false;
    return t.completed && d >= start && d <= end;
  });

  const grouped = {};
  filteredTasks.forEach(t => {
    if (!grouped[t.area]) grouped[t.area] = [];
    grouped[t.area].push(t);
  });

  const periodLabel = period === 'weekly'
    ? `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getDate()}일`
    : `${today.getFullYear()}년 ${today.getMonth() + 1}월`;

  const handlePDF = async () => {
    if (filteredTasks.length === 0) { alert('완료된 업무가 없습니다.'); return; }
    setGenerating(true);
    try {
      await generatePDF(filteredTasks, period, periodLabel);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>
      {/* 헤더 카드 */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937, #374151)', borderRadius: '20px', padding: '20px', marginBottom: '18px', color: '#fff' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>업무 완료 보고서</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
          {periodLabel} · {filteredTasks.length}건 완료
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* 기간 토글 */}
          <div style={{ flex: 1, display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '4px' }}>
            {['weekly', 'monthly'].map((p, i) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  background: period === p ? '#fff' : 'transparent',
                  color: period === p ? '#1f2937' : '#9ca3af',
                }}
              >
                {p === 'weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>
          {/* PDF 버튼 */}
          <button
            onClick={handlePDF}
            disabled={generating}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px',
              background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '14px',
              fontSize: '14px', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', flexShrink: 0, opacity: generating ? 0.7 : 1,
            }}
          >
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
                    {task.date?.toDate()?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
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
