export const AREAS = [
  { code: 'paua', label: '파우아교육협력재단', bg: '#E6F1FB', text: '#0C447C', short: '파우아' },
  { code: 'cbmc', label: 'CBMC', bg: '#D9F2E3', text: '#1E6B3E', short: 'CBMC' },
  { code: 'church', label: '면목교회', bg: '#EEEDFE', text: '#3C3489', short: '교회' },
  { code: 'kids', label: '서연서하', bg: '#FFF9D6', text: '#7A6200', short: '서연서하' },
  { code: 'hobby', label: '취미', bg: '#FFE4EE', text: '#A0294E', short: '취미' },
  { code: 'etc', label: '기타', bg: '#EDEDEE', text: '#555558', short: '기타' },
];

export const AREA_MAP = Object.fromEntries(AREAS.map(a => [a.code, a]));
