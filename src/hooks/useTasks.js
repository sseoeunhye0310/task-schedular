import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { getRecurringTasksForDate } from '../utils/recurring';

const pad = n => String(n).padStart(2, '0');
// 로컬 날짜 문자열 "YYYY-MM-DD"
export const localDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// task의 날짜 문자열 반환 (dateStr 필드 우선, 없으면 로컬 변환)
export const taskDateStr = t => t.dateStr || (t.date?.toDate ? localDateStr(t.date.toDate()) : '');

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
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
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
        // 어제 날짜 문자열
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = localDateStr(yesterday);

        // dateStr 필드로 어제 미완료 업무 찾기
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

        // 반복업무 자동 생성 (중복 방지)
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
    // date: "2026-06-19" 문자열 그대로 저장 (타임존 독립)
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 0, 0, 0, 0);
    await addDoc(collection(db, 'tasks'), {
      uid: user.uid,
      title,
      area,
      date: Timestamp.fromDate(dateObj),
      dateStr: date,          // "YYYY-MM-DD" 문자열로도 저장
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
