import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AREAS } from '../constants/areas';

export default function MonthlyPlanTab({ user, tasks }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [plans, setPlans] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'monthlyPlans'),
      where('uid', '==', user.uid),
      where('year', '==', year),
      where('month', '==', month)
    );
    getDocs(q).then(snap => {
      const p = {};
      snap.docs.forEach(d => { const data = d.data(); p[data.area] = { ...data, docId: d.id }; });
      setPlans(p);
    });
  }, [user, year, month]);

  const savePlan = async (area, field, value) => {
    const key = `${user.uid}_${year}_${month}_${area}`;
    const ref = doc(db, 'monthlyPlans', key);
    const existing = plans[area] || {};
    const updated = { ...existing, uid: user.uid, year, month, area, [field]: value };
    await setDoc(ref, updated, { merge: true });
    setPlans(prev => ({ ...prev, [area]: updated }));
  };

  const getProgress = (areaCode) => {
    const areaMonthTasks = tasks.filter(t => {
      const d = t.date?.toDate();
      if (!d) return false;
      return t.area === areaCode && d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    const total = areaMonthTasks.length;
    const done = areaMonthTasks.filter(t => t.completed).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  return (
    <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
      {/* 연월 선택 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth}
          className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition-colors">
          ‹
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">{year}년</p>
          <p className="text-2xl font-bold text-gray-800">{month}월 계획</p>
        </div>
        <button onClick={nextMonth}
          className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition-colors">
          ›
        </button>
      </div>

      {AREAS.map(area => {
        const plan = plans[area.code] || {};
        const { total, done, pct } = getProgress(area.code);
        return (
          <div key={area.code} className="rounded-3xl p-5 mb-4 shadow-sm" style={{ background: area.bg }}>
            {/* 영역 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: area.text }} />
                <span className="text-base font-bold" style={{ color: area.text }}>{area.label}</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-500 font-medium">달성</span>
                <div
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{ background: plan.achieved ? area.text : '#d1d5db' }}
                  onClick={() => savePlan(area.code, 'achieved', !plan.achieved)}
                >
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                    style={{ left: plan.achieved ? '22px' : '2px' }} />
                </div>
              </label>
            </div>

            {/* 진행률 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: area.text }} />
              </div>
              <span className="text-sm font-bold shrink-0" style={{ color: area.text }}>
                {done}/{total} ({pct}%)
              </span>
            </div>

            {/* 목표/일정 입력 */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: area.text }}>이달의 목표</label>
                <textarea
                  value={plan.goal || ''}
                  onChange={e => savePlan(area.code, 'goal', e.target.value)}
                  placeholder="이달의 목표를 입력하세요"
                  rows={2}
                  className="w-full text-sm px-4 py-3 rounded-xl border-0 bg-white/70 outline-none resize-none focus:bg-white transition-colors"
                  style={{ color: '#374151' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: area.text }}>주요 일정</label>
                <textarea
                  value={plan.schedule || ''}
                  onChange={e => savePlan(area.code, 'schedule', e.target.value)}
                  placeholder="주요 일정을 입력하세요"
                  rows={2}
                  className="w-full text-sm px-4 py-3 rounded-xl border-0 bg-white/70 outline-none resize-none focus:bg-white transition-colors"
                  style={{ color: '#374151' }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
