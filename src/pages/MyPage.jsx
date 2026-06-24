// ============================================
// pages/MyPage.jsx
// 마이 화면. 이번 단계에서는 뼈대만.
// ============================================

import { UserRound } from "lucide-react";

function MyPage({ theme, toggleTheme }) {
  return (
    <div className="page">
      <div className="top">
        <div>
          <div className="greet">내 정보</div>
          <div className="title">마이페이지</div>
        </div>
        <div className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </div>
      </div>

      {/* TODO(다음 단계): 프로필 · 내 루틴 · 추천 루틴 · 메뉴 */}
      <div className="card empty">
        <div className="ico-wrap">
          <UserRound size={28} strokeWidth={2} />
        </div>
        <div className="emp-title">프로필을 설정해 주세요</div>
        <div className="emp-desc">
          프로필 · 내 루틴 · 추천 루틴 · 설정 메뉴가 이곳에 표시됩니다.
        </div>
      </div>
    </div>
  );
}

export default MyPage;
