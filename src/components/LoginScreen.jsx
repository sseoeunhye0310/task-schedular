import { signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      alert('로그인 실패: ' + e.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '360px', background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>

        {/* 상단 헤더 영역 */}
        <div style={{ background: '#E6F1FB', padding: '48px 32px 36px', textAlign: 'center', borderBottom: '1px solid #B5D4F4' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: '#0C447C', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px'
          }}>
            📅
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0C447C', margin: '0 0 6px' }}>업무 스케줄러</h1>
          <p style={{ fontSize: '14px', color: '#185FA5', margin: 0 }}>은하수 님의 업무를 스마트하게</p>
        </div>

        {/* 기능 소개 + 로그인 버튼 */}
        <div style={{ padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🗂️', text: '6개 영역 색상 분류 관리' },
              { icon: '🔁', text: '반복업무 자동 생성' },
              { icon: '📄', text: '완료 업무 PDF 보고서 출력' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', width: '26px', textAlign: 'center' }}>{icon}</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '15px', background: '#0C447C',
                border: 'none', borderRadius: '14px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '10px',
                cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#fff',
                fontFamily: 'inherit'
              }}
            >
              <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '18px', height: '18px' }} />
              Google 계정으로 시작하기
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              로그인하면 모든 기기에서 동기화됩니다
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
