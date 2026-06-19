import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { getRecurringTasksForDate } from '../utils/recurring';

const pad = n => String(n).padStart(2, '0');
export const localDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// dateStr 필드 우선, 없으면 KST 기준 로컬 변환
export const taskDateStr = t => {
  if (t.dateStr) return t.dateStr;
  if (t.date?.toDate) return localDateStr(t.date.toDate());
  return '';
};

// dateStr 없는 기존 태스크에 일괄 추가 (마이그레이션)
const migrateOldTasks = async (uid, tasks) => {
  const oldTasks = tasks.filter(t => !t.dateStr && t.date?.toDate);
  if (oldTasks.length === 0) return;

  const batch = writeBatch(db);
  oldTasks.forEach(t => {
    const ds = localDateStr(t.date.toDate());
    batch.update(doc(db, 'tasks', t.id), { dateStr: ds });
  });
  await batch.commit();
};

export function useTasks(user) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setTasks([]); setLoading(false); return; }

    setLoading(true);
    setError(null);

    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));
    const unsub = onSnapshot(
      q,
      snap => {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(loaded);
        setLoading(false);
        setError(null);
        // dateStr 없는 기존 태스크 자동 보정 (1회성)
        migrateOldTasks(user.uid, loaded).catch(() => {});
      },
      err => {
        console.error('Firestore 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  // 미완료 업무 이월 + 반복업무 자동 생성
  useEffect(() => {
    if (!user || loading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = localDateStr(today);
    const lastRun = localStorage.getItem(`lastRun_${user.uid}`);

    if (lastRun === todayStr) return;

    (async () => {
      try {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = localDateStr(yesterday);

        // dateStr 기준으로 어제 미완료 업무 이월
        const q = query(
          collection(db, 'tasks'),
          where('uid', '==', user.uid),
          where('completed', '==', false),
          where('dateStr', '==', yesterdayStr)
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await updateDoc(doc(db, 'tasks', d.id), {
            date: Timestamp.fromDate(today),
            dateStr: todayStr,
            carriedOver: true,
          });
        }

        // 반복업무 자동 생성
        const recurTasks = getRecurringTasksForDate(today);
        for (const t of recurTasks) {
          const exists = tasks.some(
            task => task.recurType === t.recurType && task.isRecurring &&
              taskDateStr(task) === todayStr
          );
          if (!exists) {
            await addDoc(collection(db, 'tasks'), {
              uid: user.uid,
              title: t.title,
              area: t.area,
              date: Timestamp.fromDate(today),
              dateStr: todayStr,
              completed: false,
              isRecurring: true,
              recurType: t.recurType,
              createdAt: Timestamp.now(),
            });
          }
        }

        localStorage.setItem(`lastRun_${user.uid}`, todayStr);
      } catch (e) {
        console.error('이월 처리 오류:', e);
      }
    })();
  }, [user, loading]);

  const addTask = async ({ title, area, date }) => {
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 0, 0, 0, 0);
    await addDoc(collection(db, 'tasks'), {
      uid: user.uid,
      title,
      area,
      date: Timestamp.fromDate(dateObj),
      dateStr: date,
      completed: false,
      isRecurring: false,
      recurType: null,
      createdAt: Timestamp.now(),
    });
  };

  const toggleTask = async (id, completed) => {
    await updateDoc(doc(db, 'tasks', id), { completed: !completed });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  return { tasks, loading, error, addTask, toggleTask, deleteTask };
}
