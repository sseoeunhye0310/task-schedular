// 반복업무 템플릿 정의
const WEEKLY_TEMPLATES = {
  1: [{ title: '주간 업무 계획 세우기', area: 'paua' }], // 월
  3: [
    { title: '중간 점검 (파우아 진행상황)', area: 'paua' },
    { title: 'CBMC 뉴스레터 중간 점검', area: 'cbmc' },
  ], // 수
  5: [{ title: '완료 업무 정리', area: 'etc' }], // 금
};

const MONTHLY_START_TEMPLATES = [
  { title: '월간 일정 확인', area: 'paua' },
  { title: '후원자 DB 점검', area: 'paua' },
  { title: '재정 자료 확인', area: 'paua' },
  { title: 'CBMC 뉴스레터 일정 확인', area: 'cbmc' },
  { title: '다음 포럼 기획', area: 'cbmc' },
  { title: '교회 교육 일정 확인', area: 'church' },
  { title: '아이들 학습 계획 수립', area: 'kids' },
  { title: '콘텐츠 계획 수립', area: 'hobby' },
];

const MONTHLY_END_TEMPLATES = [
  { title: '업무보고 정리', area: 'paua' },
  { title: '후원자 감사 메시지 점검', area: 'paua' },
  { title: '지회 소식 정리', area: 'cbmc' },
  { title: '회비 정산 확인', area: 'cbmc' },
  { title: '재정 자료 확인', area: 'etc' },
  { title: '다음 달 일정 초안 작성', area: 'etc' },
  { title: '아이들 학습 점검', area: 'kids' },
];

export function getRecurringTasksForDate(date) {
  const day = date.getDate();
  const dow = date.getDay(); // 0=일, 1=월, ... 6=토
  const tasks = [];

  // 주간 반복업무
  const weeklyTasks = WEEKLY_TEMPLATES[dow] || [];
  weeklyTasks.forEach(t => {
    tasks.push({ ...t, recurType: `weekly_${dow}`, isRecurring: true });
  });

  // 월초 반복업무 (1~5일)
  if (day >= 1 && day <= 5) {
    MONTHLY_START_TEMPLATES.forEach(t => {
      tasks.push({ ...t, recurType: 'monthly_start', isRecurring: true });
    });
  }

  // 월말 반복업무 (26~31일)
  if (day >= 26) {
    MONTHLY_END_TEMPLATES.forEach(t => {
      tasks.push({ ...t, recurType: 'monthly_end', isRecurring: true });
    });
  }

  return tasks;
}
