import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      alert('로그인 실패: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #dbeafe 50%, #ede9fe 100%)' }}>
      <div className="bg-white rounded-3xl p-12 shadow-2xl text-center w-full max-w-sm mx-6">
        <div className="text-7xl mb-5">📅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">업무 스케줄러</h1>
        <p className="text-base text-gray-400 mb-10">은하수 님 전용</p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl py-4 px-5 text-base font-semibold hover:border-blue-300 hover:shadow-lg transition-all active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Google 계정으로 시작하기
        </button>
      </div>
    </div>
  );
}
