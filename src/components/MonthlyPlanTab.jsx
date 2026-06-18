import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AREAS } from '../constants/areas';

// 항목 리스트 편집 컴포넌트
function ItemList({ items = [], color, bg, placeholder, onChange }) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    if (!draft.trim()) return;
    onChange([...items, { text: draft.trim(), done: false }]);
    setDraft('');
  };

  const toggleItem = (i) => {
    const next = items.map((item, idx) => idx === i ? { ...item, done: !item.done } : item);
    onChange(next);
  };

  const deleteItem = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <button
            onClick={() => toggleItem(i)}
            style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${item.done ? color : '#d1d5db'}`,
              background: item.done ? color : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {item.done && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>}
          </button>
          <span style={{
            flex: 1, fontSize: '14px', color: item.done ? '#9ca3af' : '#374151',
            textDecoration: item.done ? 'line-through' : 'none', minWidth: 0,
          }}>
            {item.text}
          </span>
          <button
            onClick={() => deleteItem(i)}
            style={{ width: '20px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#d1d5db', flexShrink: 0 }}
          >✕</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          style={{
            flex: 1, padding: '9px 12px', border: 'none', borderRadius: '10px',
            background: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none',
            fontFamily: 'inherit', minWidth: 0,
          }}
        />
        <button
          onClick={addItem}
          style={{
            padding: '9px 14px', background: color, color: '#fff', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
}

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

  const navBtn = {
    width: '38px', height: '38px', borderRadius: '12px', background: '#f3f4f6',
    border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#374151',
    fontFamily: 'inherit', flexShrink: 0,
  };

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
        const goals = plan.goals || [];
        const schedules = plan.schedules || [];
        const goalDone = goals.filter(g => g.done).length;

        return (
          <div key={area.code} style={{ background: area.bg, borderRadius: '20px', padding: '18px', marginBottom: '12px', boxSizing: 'border-box', width: '100%' }}>

            {/* 영역 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: area.text }} />
                <span style={{ fontSize: '15px', fontWeight: '700', color: area.text }}>{area.label}</span>
              </div>
              <span style={{ fontSize: '12px', color: area.text, opacity: 0.7 }}>업무 {done}/{total}</span>
            </div>

            {/* 업무 진행률 바 */}
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', background: area.text, borderRadius: '3px', width: `${pct}%`, transition: 'width .6s' }} />
            </div>

            {/* 이달의 목표 */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: area.text }}>이달의 목표</span>
                {goals.length > 0 && (
                  <span style={{ fontSize: '11px', color: area.text, opacity: 0.7 }}>
                    {goalDone}/{goals.length} 달성
                  </span>
                )}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '14px', padding: '12px' }}>
                <ItemList
                  items={goals}
                  color={area.text}
                  bg={area.bg}
                  placeholder="목표를 입력하고 Enter"
                  onChange={v => savePlan(area.code, 'goals', v)}
                />
              </div>
            </div>

            {/* 주요 일정 */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: area.text, marginBottom: '8px' }}>주요 일정</div>
              <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '14px', padding: '12px' }}>
                <ItemList
                  items={schedules}
                  color={area.text}
                  bg={area.bg}
                  placeholder="일정을 입력하고 Enter"
                  onChange={v => savePlan(area.code, 'schedules', v)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
