// ============================================
// pages/HomePage.jsx
// 홈(메인) 화면 — 기획 §6-1 구성
//  1) 인사 + 날짜 + 테마 토글
//  2) 오늘 요약/기록하기 (주인공) — 운동했으면 요약, 아니면 큰 버튼 (데이터로 자동 분기)
//  3) 이번 주 목표 진행바
//  4) 짧은 통계 3개
//  5) 이번 달 달력 (운동한 날 표시 + "이번 달 N회")
// ※ 지금은 전부 "가짜 데이터". 나중에 DB(sessions/records)와 연결.
// ============================================

import { Plus, Flame, CalendarCheck, Dumbbell, ChevronRight, Check } from "lucide-react";
import { expandRecord } from "../data/workoutData";

// ── 이번 달 달력 칸들을 만든다 ─────────────────────────
//    앞쪽 빈칸(1일이 무슨 요일인지) + 1일~말일
function buildCalendar(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=일 … 6=토
  const lastDate = new Date(year, month + 1, 0).getDate(); // 이번 달 말일

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  return cells;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 이번 주 목표 (가짜) — 나중에 사용자 설정값으로
const WEEKLY_GOAL = 4;
const WEEKLY_DONE = 3;

function HomePage({ theme, toggleTheme, onNavigate, onOpenDay, sessions }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  // 오늘 날짜 문구 (예: 6월 24일 수요일)
  const dateLabel = `${month + 1}월 ${today}일 ${WEEKDAYS[now.getDay()]}요일`;

  // 운동한 날들(이번 달) — 세션 맵의 키
  const workoutDays = Object.keys(sessions).map(Number);
  const monthlyCount = workoutDays.length;

  // 오늘 운동했나? → 히어로 상태 분기
  const todaySession = sessions[today];
  const didWorkout = !!todaySession;

  // 오늘 요약 문구 (운동한 경우)
  let todaySummary = "";
  if (todaySession) {
    const firstWeight = todaySession.records
      .map(expandRecord)
      .find((r) => r.type === "weight");
    const mainPart = firstWeight ? firstWeight.part : "유산소";
    todaySummary = `${mainPart} · ${todaySession.records.length}종목 · ${todaySession.duration}분`;
  }

  const cells = buildCalendar(year, month);
  const goalPct = Math.min(100, Math.round((WEEKLY_DONE / WEEKLY_GOAL) * 100));

  return (
    <div className="page">
      {/* 헤더: 날짜 + 인사 + 테마 토글 */}
      <div className="top">
        <div>
          <div className="greet">{dateLabel}</div>
          <div className="title">오늘도 운동 💪</div>
        </div>
        <div className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </div>
      </div>

      {/* 2) 오늘 요약 / 기록하기 (주인공) — 데이터로 자동 분기 */}
      {didWorkout ? (
        // 운동한 날 → 요약 (누르면 상세 시트)
        <button className="hero done" onClick={() => onOpenDay && onOpenDay(today)}>
          <div className="hero-left">
            <div className="hero-label">오늘</div>
            <div className="hero-title">운동 완료!</div>
            <div className="hero-sub">{todaySummary}</div>
          </div>
          <div className="hero-cta">
            <Check size={28} strokeWidth={3} />
          </div>
        </button>
      ) : (
        // 아직 안 한 날 → 큰 기록 버튼 (누르면 기록 탭)
        <button className="hero" onClick={() => onNavigate && onNavigate("rec")}>
          <div className="hero-left">
            <div className="hero-label">오늘</div>
            <div className="hero-title">아직 운동 전이에요</div>
            <div className="hero-sub">탭 한 번으로 오늘 운동을 시작해요</div>
          </div>
          <div className="hero-cta">
            <Plus size={26} strokeWidth={2.6} />
          </div>
        </button>
      )}

      {/* 3) 이번 주 목표 진행바 */}
      <div className="goal card">
        <div className="goal-top">
          <span className="goal-label">이번 주 목표</span>
          <span className="goal-num">
            {WEEKLY_DONE} / {WEEKLY_GOAL}회
          </span>
        </div>
        <div className="goal-bar">
          <div className="goal-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="goal-msg">
          {WEEKLY_DONE >= WEEKLY_GOAL
            ? "이번 주 목표 달성! 🎉"
            : `목표까지 ${WEEKLY_GOAL - WEEKLY_DONE}번 남았어요`}
        </div>
      </div>

      {/* 4) 짧은 통계 3개 */}
      <div className="stat-row">
        <div className="stat">
          <div className="s-top">
            <Flame size={14} style={{ color: "var(--amber)" }} />
            연속
          </div>
          <div className="s-val">
            4<span className="s-unit">일</span>
          </div>
        </div>
        <div className="stat">
          <div className="s-top">
            <CalendarCheck size={14} style={{ color: "var(--accent)" }} />
            이번 달
          </div>
          <div className="s-val">
            {monthlyCount}
            <span className="s-unit">회</span>
          </div>
        </div>
        <div className="stat">
          <div className="s-top">
            <Dumbbell size={14} style={{ color: "var(--blue)" }} />
            누적
          </div>
          <div className="s-val">
            48<span className="s-unit">회</span>
          </div>
        </div>
      </div>

      {/* 5) 이번 달 달력 */}
      <div className="card">
        <div className="cal-head">
          <div className="cal-month">
            {year}년 {month + 1}월
          </div>
          <div className="cal-count">이번 달 {monthlyCount}회</div>
        </div>

        <div className="cal-grid cal-week">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>
              {w}
            </span>
          ))}
        </div>

        <div className="cal-grid cal-days">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="cal-day" />;
            const isWorkout = !!sessions[d];
            const isToday = d === today;
            const cls =
              "cal-day tappable" +
              (isWorkout ? " workout" : "") +
              (isToday ? " today" : "");
            return (
              <div key={d} className={cls} onClick={() => onOpenDay && onOpenDay(d)}>
                <span className="n">{d}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 그래프 맛보기로 가는 작은 줄 */}
      <button className="row-link" onClick={() => onNavigate && onNavigate("graph")}>
        <span>이번 달 성장 그래프 보기</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default HomePage;
