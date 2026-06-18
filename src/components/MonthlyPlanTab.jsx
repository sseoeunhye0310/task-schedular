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
    getDocs(query(collection(db, 'monthlyPlans'),
      where('uid', '==', user.uid), where('year', '==', year), where('month', '==', month)
    )).then(snap => {
      const p = {};
      snap.docs.forEach(d => { const data = d.data(); p[data.area] = data; });
      setPlans(p);
    });
  }, [user, year, month]);

  const savePlan = async (area, field, value) => {
    const key = `${user.uid}_${year}_${month}_${area}`;
    const existing = plans[area] || {};
    const updated = { ...existing, uid: user.uid, year, month, area, [field]: value };
    await setDoc(doc(db, 'monthlyPlans', key), updated, { merge: true });
    setPlans(prev => ({ ...prev, [area]: updated }));
  };

  const getProgress = (areaCode) => {
    const ts = tasks.filter(t => {
      const d = t.date?.toDate();
      return d && t.area === areaCode && d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    const done = ts.filter(t => t.completed).length;
    return { total: ts.length, done, pct: ts.length > 0 ? Math.round((done / ts.length) * 100) : 0 };
  };

  const navBtn = { width: '38px', height: '38px', borderRadius: '12px', background: '#f3f4f6', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontFamily: 'inherit', flexShrink: 0 };

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>

      {/* 연월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button style={navBtn} onClick={() => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>{year}년</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{month}월 계획</div>
        </div>
        <button style={navBtn} onClick={() => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); }}>›</button>
      </div>

      {AREAS.map(area => {
        const plan = plans[area.code] || {};
        const { total, done, pct } = getProgress(area.code);
        return (
          <div key={area.code} style={{ background: area.bg, borderRadius: '20px', padding: '18px', marginBottom: '12px', boxSizing: 'border-box', width: '100%' }}>

            {/* 영역 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: area.text }} />
                <span style={{ fontSize: '15px', fontWeight: '700', color: area.text }}>{area.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: area.text, opacity: 0.7 }}>{done}/{total}</span>
                {/* 토글 스위치 */}
                <div
                  onClick={() => savePlan(area.code, 'achieved', !plan.achieved)}
                  style={{
                    width: '42px', height: '24px', borderRadius: '12px', position: 'relative',
                    background: plan.achieved ? area.text : '#d1d5db', cursor: 'pointer', flexShrink: 0, transition: 'background .2s',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: plan.achieved ? '20px' : '2px', transition: 'left .2s',
                  }} />
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ height: '100%', background: area.text, borderRadius: '3px', width: `${pct}%`, transition: 'width .6s' }} />
            </div>

            {/* 입력 영역 */}
            {['goal', 'schedule'].map((field, i) => (
              <div key={field} style={{ marginBottom: i === 0 ? '10px' : 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: area.text, marginBottom: '6px' }}>
                  {field === 'goal' ? '이달의 목표' : '주요 일정'}
                </div>
                <textarea
                  value={plan[field] || ''}
                  onChange={e => savePlan(area.code, field, e.target.value)}
                  placeholder={field === 'goal' ? '이달의 목표를 입력하세요' : '주요 일정을 입력하세요'}
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 12px', border: 'none',
                    borderRadius: '12px', background: 'rgba(255,255,255,0.7)',
                    fontSize: '14px', color: '#374151', outline: 'none', resize: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
                  }}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
