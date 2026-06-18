import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const QUARTERS = [
  { q: 1, label: '1분기', period: '1월 ~ 3월', color: '#0C447C', bg: '#E6F1FB' },
  { q: 2, label: '2분기', period: '4월 ~ 6월', color: '#27500A', bg: '#EAF3DE' },
  { q: 3, label: '3분기', period: '7월 ~ 9월', color: '#633806', bg: '#FAEEDA' },
  { q: 4, label: '4분기', period: '10월 ~ 12월', color: '#72243E', bg: '#FBEAF0' },
];

const STATUS = [
  { key: 'planned', label: '예정', bg: '#f3f4f6', color: '#6b7280' },
  { key: 'inprogress', label: '진행중', bg: '#fef3c7', color: '#d97706' },
  { key: 'done', label: '완료', bg: '#d1fae5', color: '#059669' },
];

export default function YearlyPlanTab({ user }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [items, setItems] = useState([]);
  const [qStatus, setQStatus] = useState({});
  const [newTitle, setNewTitle] = useState('');
  const [addingQ, setAddingQ] = useState(null);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, 'yearlyPlans'), where('uid', '==', user.uid), where('year', '==', year)))
      .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    getDocs(query(collection(db, 'yearlyQStatus'), where('uid', '==', user.uid), where('year', '==', year)))
      .then(snap => {
        const s = {};
        snap.docs.forEach(d => { const data = d.data(); s[data.q] = data.status; });
        setQStatus(s);
      });
  }, [user, year]);

  const toggleItem = async (item) => {
    await setDoc(doc(db, 'yearlyPlans', item.id), { ...item, completed: !item.completed });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
  };
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'yearlyPlans', id));
    setItems(prev => prev.filter(i => i.id !== id));
  };
  const addItem = async (q) => {
    if (!newTitle.trim()) return;
    const data = { uid: user.uid, year, q, title: newTitle.trim(), completed: false };
    const ref = await addDoc(collection(db, 'yearlyPlans'), data);
    setItems(prev => [...prev, { id: ref.id, ...data }]);
    setNewTitle(''); setAddingQ(null);
  };
  const setStatus = async (q, status) => {
    const key = `${user.uid}_${year}_${q}`;
    await setDoc(doc(db, 'yearlyQStatus', key), { uid: user.uid, year, q, status });
    setQStatus(prev => ({ ...prev, [q]: status }));
  };

  const navBtn = { width: '38px', height: '38px', borderRadius: '12px', background: '#f3f4f6', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 };

  return (
    <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button style={navBtn} onClick={() => setYear(y => y - 1)}>‹</button>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>{year}년 연간계획</div>
        <button style={navBtn} onClick={() => setYear(y => y + 1)}>›</button>
      </div>

      {QUARTERS.map(({ q, label, period, color, bg }) => {
        const qItems = items.filter(i => i.q === q);
        const status = qStatus[q] || 'planned';
        const statusInfo = STATUS.find(s => s.key === status);
        return (
          <div key={q} style={{ background: bg, borderRadius: '20px', padding: '18px', marginBottom: '12px', boxSizing: 'border-box', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', fontWeight: '700', color }}>{label}</span>
                </div>
                <div style={{ fontSize: '12px', color, opacity: 0.6, marginLeft: '18px' }}>{period}</div>
              </div>
              <select
                value={status}
                onChange={e => setStatus(q, e.target.value)}
                style={{ fontSize: '12px', fontWeight: '700', padding: '5px 10px', borderRadius: '10px', border: 'none', background: statusInfo.bg, color: statusInfo.color, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              >
                {STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            {qItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.65)', borderRadius: '12px', marginBottom: '6px' }}>
                <button
                  onClick={() => toggleItem(item)}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${item.completed ? color : '#d1d5db'}`, background: item.completed ? color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {item.completed && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                </button>
                <span style={{ flex: 1, fontSize: '14px', color: item.completed ? '#9ca3af' : '#1f2937', textDecoration: item.completed ? 'line-through' : 'none', minWidth: 0 }}>
                  {item.title}
                </span>
                <button onClick={() => deleteItem(item.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#d1d5db', flexShrink: 0 }}>✕</button>
              </div>
            ))}

            {addingQ === q ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  autoFocus type="text" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem(q)}
                  placeholder="목표 항목 입력 후 Enter"
                  style={{ flex: 1, padding: '9px 12px', border: 'none', borderRadius: '10px', background: 'rgba(255,255,255,0.7)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', minWidth: 0 }}
                />
                <button onClick={() => addItem(q)} style={{ padding: '9px 14px', background: color, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>추가</button>
                <button onClick={() => { setAddingQ(null); setNewTitle(''); }} style={{ padding: '9px 10px', background: 'transparent', border: 'none', fontSize: '13px', color: '#9ca3af', cursor: 'pointer', flexShrink: 0 }}>취소</button>
              </div>
            ) : (
              <button onClick={() => setAddingQ(q)} style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color, background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                + 항목 추가
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
