export const AREAS = [
  { code: 'paua', label: '파우아교육협력재단', bg: '#E6F1FB', text: '#0C447C', short: '파우아' },
  { code: 'cbmc', label: 'CBMC', bg: '#FAEEDA', text: '#633806', short: 'CBMC' },
  { code: 'church', label: '면목교회', bg: '#EEEDFE', text: '#3C3489', short: '교회' },
  { code: 'kids', label: '서연서하', bg: '#EAF3DE', text: '#27500A', short: '서연서하' },
  { code: 'hobby', label: '취미', bg: '#FBEAF0', text: '#72243E', short: '취미' },
  { code: 'etc', label: '기타', bg: '#F1EFE8', text: '#444441', short: '기타' },
];

export const AREA_MAP = Object.fromEntries(AREAS.map(a => [a.code, a]));
