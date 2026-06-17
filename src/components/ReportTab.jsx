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
    <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
      {/* 기간 선택 + PDF 버튼 */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-5 mb-5 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">업무 완료 보고서</h2>
        <p className="text-slate-400 text-sm mb-4">{periodLabel} · {filteredTasks.length}건 완료</p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex bg-slate-600/50 rounded-2xl p-1 flex-1">
            <button
              onClick={() => setPeriod('weekly')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${period === 'weekly' ? 'bg-white text-slate-800' : 'text-slate-300'}`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${period === 'monthly' ? 'bg-white text-slate-800' : 'text-slate-300'}`}
            >
              월간
            </button>
          </div>
          <button
            onClick={handlePDF}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-60 shrink-0"
          >
            {generating ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {/* 영역별 보고 내용 */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-base text-gray-500 font-medium">해당 기간에 완료된 업무가 없습니다</p>
        </div>
      ) : (
        AREAS.map(area => {
          const items = grouped[area.code];
          if (!items || items.length === 0) return null;
          return (
            <div key={area.code} className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: area.text }} />
                <span className="text-base font-bold" style={{ color: area.text }}>{area.label}</span>
                <span className="text-sm text-gray-400 ml-auto">{items.length}건</span>
              </div>
              <div className="space-y-2">
                {items.map(task => (
                  <div key={task.id}
                    className="flex items-center gap-3 py-3 px-4 bg-white rounded-2xl shadow-sm"
                    style={{ borderLeft: `4px solid ${area.text}` }}
                  >
                    <span className="text-gray-300 text-base shrink-0">○</span>
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {task.title} 업무를 진행함.
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {task.date?.toDate()?.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
