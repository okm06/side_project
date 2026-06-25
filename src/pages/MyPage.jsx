// ============================================
// pages/MyPage.jsx
// 마이 화면 — 기획 §6-1 "마이 = 내 정보·설정"
//  1) 프로필 카드 (아바타 + 닉네임 + 누적 통계)
//  2) 내 루틴 / 추천 루틴 (탭하면 기록 화면에서 불러오기)
//  3) 설정 (테마 토글은 실제 작동, 나머지는 자리만 = "준비중")
//  4) 더보기 (나중에 붙일 기능들 — 기획 §9)
// ※ 통계는 sessions(가짜)에서 계산. DB로 바뀌어도 화면 로직 그대로.
// ※ 닉네임/목표 등 "내 정보" 영속화는 DB 붙일 때. 지금은 표시 위주.
// ============================================

import { useState } from "react";
import {
  Dumbbell,
  ChevronRight,
  Target,
  Scale,
  Users,
  Crown,
  Bell,
  Info,
  ListChecks,
} from "lucide-react";
import { EXERCISE_MAP, ROUTINES } from "../data/exercises";
import { toUnit, UNITS } from "../data/units";

// sessions에서 누적 통계 뽑기 (운동한 날 / 누적 볼륨 / 해본 종목 수)
function buildStats(sessions) {
  const days = Object.keys(sessions);
  let volume = 0;
  const exIds = new Set();
  days.forEach((d) => {
    sessions[d].records.forEach((r) => {
      exIds.add(r.exId);
      if (r.sets) {
        volume += r.sets.reduce(
          (a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0),
          0
        );
      }
    });
  });
  return { totalDays: days.length, volume, exCount: exIds.size };
}

function MyPage({
  theme,
  toggleTheme,
  sessions,
  onNavigate,
  weeklyGoal,
  setWeeklyGoal,
  unit,
  setUnit,
}) {
  const stats = buildStats(sessions);
  // 아직 안 만든 기능을 누르면 띄우는 안내 토스트
  const [soon, setSoon] = useState(false);
  const notReady = () => {
    setSoon(true);
    setTimeout(() => setSoon(false), 1600);
  };

  // 루틴 탭 → 기록 화면으로 (거기서 루틴 칩으로 한 번에 불러옴)
  const goRecord = () => onNavigate && onNavigate("rec");

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

      {/* 1) 프로필 카드 */}
      <div className="card profile-card">
        <div className="avatar">새</div>
        <div className="profile-info">
          <div className="profile-name">운동하는 새싹</div>
          <div className="profile-tag">꾸준러 LV.1</div>
          <div className="profile-sub">
            {stats.totalDays > 0
              ? `이번 달 ${stats.totalDays}일 운동했어요`
              : "첫 운동을 기록해 보세요"}
          </div>
        </div>
      </div>

      {/* 누적 통계 3개 */}
      <div className="stat-row">
        <div className="stat">
          <div className="s-top">운동한 날</div>
          <div className="s-val">
            {stats.totalDays}
            <span className="s-unit">일</span>
          </div>
        </div>
        <div className="stat">
          <div className="s-top">누적 볼륨</div>
          <div className="s-val">
            {toUnit(stats.volume, unit).toLocaleString()}
            <span className="s-unit">{unit}</span>
          </div>
        </div>
        <div className="stat">
          <div className="s-top">해본 종목</div>
          <div className="s-val">
            {stats.exCount}
            <span className="s-unit">개</span>
          </div>
        </div>
      </div>

      {/* 2) 내 루틴 */}
      <div className="rec-label">
        <ListChecks size={15} /> 내 루틴
      </div>
      {ROUTINES.map((r) => {
        const names = r.exerciseIds
          .map((id) => EXERCISE_MAP[id]?.name)
          .filter(Boolean)
          .join(" · ");
        return (
          <button key={r.id} className="routine-card" onClick={goRecord}>
            <div className="routine-ico">
              <Dumbbell size={18} />
            </div>
            <div className="routine-body">
              <div className="routine-name">
                {r.name}
                <span className="chip-n">{r.exerciseIds.length}</span>
              </div>
              <div className="routine-ex">{names}</div>
            </div>
            <ChevronRight size={18} className="routine-go" />
          </button>
        );
      })}
      <button className="routine-add" onClick={notReady}>
        + 새 루틴 만들기
      </button>

      {/* 3) 설정 */}
      <div className="rec-label">설정</div>
      <div className="card menu-card">
        {/* 테마: 실제로 작동 */}
        <div className="menu-row static">
          <span className="menu-ico">{theme === "dark" ? "🌙" : "☀️"}</span>
          <span className="menu-label">테마</span>
          <div className="seg theme-seg">
            <button
              className={"seg-btn" + (theme === "dark" ? " on" : "")}
              onClick={() => theme !== "dark" && toggleTheme()}
            >
              다크
            </button>
            <button
              className={"seg-btn" + (theme === "light" ? " on" : "")}
              onClick={() => theme !== "light" && toggleTheme()}
            >
              라이트
            </button>
          </div>
        </div>
        {/* 주간 목표: 스테퍼 (1~7회) → 홈 목표바에 반영 */}
        <div className="menu-row static">
          <span className="menu-ico">
            <Target size={18} />
          </span>
          <span className="menu-label">주간 목표</span>
          <div className="stepper">
            <button
              className="stepper-btn"
              disabled={weeklyGoal <= 1}
              onClick={() => setWeeklyGoal((g) => Math.max(1, g - 1))}
            >
              −
            </button>
            <span className="stepper-val">주 {weeklyGoal}회</span>
            <button
              className="stepper-btn"
              disabled={weeklyGoal >= 7}
              onClick={() => setWeeklyGoal((g) => Math.min(7, g + 1))}
            >
              +
            </button>
          </div>
        </div>
        {/* 무게 단위: kg/lb → 앱 전체 무게 표시·입력에 반영 */}
        <div className="menu-row static">
          <span className="menu-ico">
            <Scale size={18} />
          </span>
          <span className="menu-label">무게 단위</span>
          <div className="seg theme-seg">
            {UNITS.map((u) => (
              <button
                key={u}
                className={"seg-btn" + (unit === u ? " on" : "")}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4) 더보기 — 나중에 붙일 기능들 (기획 §9) */}
      <div className="rec-label">더보기</div>
      <div className="card menu-card">
        <button className="menu-row" onClick={notReady}>
          <span className="menu-ico">
            <Users size={18} />
          </span>
          <span className="menu-label">함께 운동할 사람 찾기</span>
          <span className="menu-soon">준비중</span>
        </button>
        <button className="menu-row" onClick={notReady}>
          <span className="menu-ico">
            <Crown size={18} />
          </span>
          <span className="menu-label">프리미엄</span>
          <span className="menu-soon">준비중</span>
        </button>
        <button className="menu-row" onClick={notReady}>
          <span className="menu-ico">
            <Bell size={18} />
          </span>
          <span className="menu-label">알림 설정</span>
          <span className="menu-soon">준비중</span>
        </button>
        <button className="menu-row" onClick={notReady}>
          <span className="menu-ico">
            <Info size={18} />
          </span>
          <span className="menu-label">앱 정보</span>
          <span className="menu-value">v0.1</span>
        </button>
      </div>

      {soon && <div className="toast">아직 준비 중인 기능이에요 🛠️</div>}
    </div>
  );
}

export default MyPage;
