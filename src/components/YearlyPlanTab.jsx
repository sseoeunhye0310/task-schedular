import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const QUARTERS = [
  { q: 1, label: '1분기', period: '1월 ~ 3월', color: '#3b82f6', bg: '#eff6ff' },
  { q: 2, label: '2분기', period: '4월 ~ 6월', color: '#10b981', bg: '#ecfdf5' },
  { q: 3, label: '3분기', period: '7월 ~ 9월', color: '#f59e0b', bg: '#fffbeb' },
  { q: 4, label: '4분기', period: '10월 ~ 12월', color: '#ef4444', bg: '#fef2f2' },
];

const STATUS_OPTIONS = [
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
    setNewTitle('');
    setAddingQ(null);
  };

  const setStatus = async (q, status) => {
    const key = `${user.uid}_${year}_${q}`;
    await setDoc(doc(db, 'yearlyQStatus', key), { uid: user.uid, year, q, status });
    setQStatus(prev => ({ ...prev, [q]: status }));
  };

  return (
    <div className="px-4 pt-5 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setYear(y => y - 1)}
          className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl font-bold">
          ‹
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{year}년 연간계획</p>
        </div>
        <button onClick={() => setYear(y => y + 1)}
          className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-xl font-bold">
          ›
        </button>
      </div>

      {QUARTERS.map(({ q, label, period, color, bg }) => {
        const qItems = items.filter(i => i.q === q);
        const status = qStatus[q] || 'planned';
        const statusInfo = STATUS_OPTIONS.find(s => s.key === status);
        const doneCount = qItems.filter(i => i.completed).length;

        return (
          <div key={q} className="rounded-3xl p-5 mb-4 shadow-sm" style={{ background: bg }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-lg font-bold text-gray-800">{label}</span>
                </div>
                <p className="text-sm text-gray-400 ml-5">{period}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{doneCount}/{qItems.length}</span>
                <select
                  value={status}
                  onChange={e => setStatus(q, e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border-0 font-bold cursor-pointer"
                  style={{ background: statusInfo.bg, color: statusInfo.color }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {qItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 px-4 bg-white/70 rounded-2xl">
                  <button
                    onClick={() => toggleItem(item)}
                    className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: item.completed ? color : '#d1d5db',
                      background: item.completed ? color : 'transparent',
                    }}
                  >
                    {item.completed && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                  <span className="flex-1 text-sm text-gray-700 font-medium"
                    style={{ textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.5 : 1 }}>
                    {item.title}
                  </span>
                  <button onClick={() => deleteItem(item.id)}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {addingQ === q ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem(q)}
                  placeholder="목표 항목 입력 후 Enter"
                  className="flex-1 text-sm border-0 rounded-xl px-4 py-2.5 outline-none bg-white/70"
                />
                <button onClick={() => addItem(q)}
                  className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
                  style={{ background: color }}>
                  추가
                </button>
                <button onClick={() => { setAddingQ(null); setNewTitle(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600 px-2">
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingQ(q)}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-white/60 hover:bg-white/90 transition-colors"
                style={{ color }}
              >
                <span className="text-lg">+</span> 항목 추가
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
