import jsPDF from 'jspdf';
import { AREA_MAP } from '../constants/areas';

export async function generatePDF(tasks, period, periodLabel) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 한국어 지원을 위해 기본 폰트 사용 (html2canvas 방식)
  const { default: html2canvas } = await import('html2canvas');

  // 보고서 HTML 엘리먼트를 임시로 생성
  const container = document.createElement('div');
  container.style.cssText = `
    width: 794px; padding: 40px; background: white;
    font-family: 'Noto Sans KR', sans-serif; color: #222;
    position: fixed; top: -9999px; left: -9999px;
  `;

  const grouped = {};
  tasks.forEach(t => {
    if (!grouped[t.area]) grouped[t.area] = [];
    grouped[t.area].push(t);
  });

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;

  container.innerHTML = `
    <h1 style="font-size:24px;font-weight:700;color:#1A3557;margin-bottom:4px;">업무 완료 보고서</h1>
    <p style="color:#888;font-size:13px;margin-bottom:24px;">기간: ${periodLabel} | 출력일: ${dateStr}</p>
    ${Object.entries(grouped).map(([area, items]) => {
      const areaInfo = AREA_MAP[area] || { label: area, bg: '#eee', text: '#333' };
      return `
        <div style="margin-bottom:20px;">
          <div style="display:inline-block;background:${areaInfo.bg};color:${areaInfo.text};
            padding:4px 12px;border-radius:20px;font-weight:700;font-size:13px;margin-bottom:10px;">
            ${areaInfo.label}
          </div>
          <ul style="list-style:none;padding:0;">
            ${items.map(t => `<li style="padding:5px 0;font-size:14px;border-bottom:1px solid #f0f0f0;">
              ○ ${t.title} 업무를 진행함.
            </li>`).join('')}
          </ul>
        </div>
      `;
    }).join('')}
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    const pageHeight = 297;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    if (imgHeight > pageHeight) {
      let remainingHeight = imgHeight - pageHeight;
      while (remainingHeight > 0) {
        position -= pageHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }
    }

    doc.save(`업무보고서_${periodLabel}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
