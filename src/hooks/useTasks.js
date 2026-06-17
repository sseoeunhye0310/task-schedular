import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { getRecurringTasksForDate } from '../utils/recurring';

export function useTasks(user) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setTasks([]); setLoading(false); return; }

    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // 미완료 업무 이월 + 반복업무 자동 생성
  useEffect(() => {
    if (!user || loading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const lastRun = localStorage.getItem(`lastRun_${user.uid}`);

    if (lastRun === todayStr) return;

    (async () => {
      // 미완료 이월
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = Timestamp.fromDate(yesterday);
      const todayTs = Timestamp.fromDate(today);

      const q = query(
        collection(db, 'tasks'),
        where('uid', '==', user.uid),
        where('completed', '==', false),
        where('date', '>=', yesterdayStart),
        where('date', '<', todayTs)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await updateDoc(doc(db, 'tasks', d.id), {
          date: Timestamp.fromDate(today),
          carriedOver: true,
        });
      }

      // 반복업무 자동 생성 (중복 방지)
      const recurTasks = getRecurringTasksForDate(today);
      for (const t of recurTasks) {
        const exists = tasks.some(
          task => task.recurType === t.recurType && task.isRecurring &&
            task.date?.toDate()?.toISOString().split('T')[0] === todayStr
        );
        if (!exists) {
          await addDoc(collection(db, 'tasks'), {
            uid: user.uid,
            title: t.title,
            area: t.area,
            date: Timestamp.fromDate(today),
            completed: false,
            isRecurring: true,
            recurType: t.recurType,
            createdAt: Timestamp.now(),
          });
        }
      }

      localStorage.setItem(`lastRun_${user.uid}`, todayStr);
    })();
  }, [user, loading]);

  const addTask = async ({ title, area, date }) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    await addDoc(collection(db, 'tasks'), {
      uid: user.uid,
      title,
      area,
      date: Timestamp.fromDate(d),
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

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
