// ============================================
// App.jsx
// 앱 전체의 "틀". 여기서 현재 어떤 탭인지를 기억하고,
// 그 값에 따라 알맞은 페이지를 보여준다.
// ============================================

import { useState } from "react";   // ← "바뀌는 값(state)"을 쓰기 위한 리액트 도구
import { Signal, Wifi, BatteryFull } from "lucide-react"; // 상태바 장식 아이콘
import { buildInitialSessions, estimateDuration } from "./data/workoutData";
import "./App.css";

// 페이지 4개를 불러온다 (아직 속은 거의 비어있음)
import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import GraphPage from "./pages/GraphPage";
import MyPage from "./pages/MyPage";

// 하단 탭바
import TabBar from "./components/TabBar";
// 달력에서 날짜를 누르면 올라오는 운동 상세 시트
import DaySheet from "./components/DaySheet";

function App() {
  // ───────────────────────────────────────────
  // [핵심 1] 현재 탭을 state로 관리한다.
  // activeTab : 지금 값 ('home' / 'graph' / 'rec' / 'my')
  // setActiveTab : 이 값을 바꾸는 함수
  // 처음 시작값은 'home'
  // ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("home");

  // ───────────────────────────────────────────
  // [핵심 2] 테마(다크/라이트)도 state로.
  // ───────────────────────────────────────────
  const [theme, setTheme] = useState("dark");

  // 달력에서 누른 날짜(일). null이면 시트 닫힘.
  const [detailDay, setDetailDay] = useState(null);

  // 수정 중인 날(일). null이면 "오늘 새로 기록" 모드, 숫자면 그 날을 수정.
  const [editDay, setEditDay] = useState(null);

  // ───────────────────────────────────────────
  // [핵심 4] 운동 기록(세션)을 앱 전체가 공유하는 state로.
  //   - 기록 화면이 여기에 저장하면 → 홈 달력·요약·상세가 바로 반영됨
  //   - 지금은 메모리(가짜). 나중에 이 state를 DB와 동기화하면 끝.
  // ───────────────────────────────────────────
  const [sessions, setSessions] = useState(() => buildInitialSessions());

  // ───────────────────────────────────────────
  // [핵심 5] 사용자 설정 — 마이페이지에서 바꾸면 앱 전체에 반영.
  //   - weeklyGoal: 홈 주간 목표바
  //   - unit: 무게 단위(kg/lb). 저장은 kg, 표시/입력만 변환.
  //   지금은 메모리(새로고침 시 기본값). 영속화는 sessions와 함께 나중에.
  // ───────────────────────────────────────────
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [unit, setUnit] = useState("kg");

  // 저장 처리: 수정 모드면 그 날에 "덮어쓰기", 아니면 오늘에 "이어붙이기"
  const handleSave = (records) => {
    if (!records) return;
    if (editDay != null) {
      // 수정: 그 날 기록을 통째로 교체 (다 지웠으면 그 날 세션 삭제)
      setSessions((prev) => {
        const next = { ...prev };
        if (records.length === 0) delete next[editDay];
        else next[editDay] = { records, duration: estimateDuration(records) };
        return next;
      });
    } else {
      // 새 기록: 오늘 세션에 합친다
      if (records.length === 0) return;
      const today = new Date().getDate();
      setSessions((prev) => {
        const existing = prev[today]?.records || [];
        const merged = [...existing, ...records];
        return { ...prev, [today]: { records: merged, duration: estimateDuration(merged) } };
      });
    }
  };

  // 탭 이동. '기록' 탭으로 갈 땐 수정 모드를 풀어 "오늘 새 기록"으로 시작.
  const navigate = (tab) => {
    if (tab === "rec") setEditDay(null);
    setActiveTab(tab);
  };

  // 특정 날 기록 수정 시작: 그 날을 기록 화면에 불러온다
  const startEdit = (day) => {
    setEditDay(day);
    setDetailDay(null);
    setActiveTab("rec");
  };

  // 테마를 뒤집는 함수
  const toggleTheme = () => {
    // 지금이 dark면 light로, 아니면 dark로
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ───────────────────────────────────────────
  // [핵심 3] activeTab 값에 따라 어떤 페이지를 보여줄지 고른다.
  // 직접 화면을 숨기고 보이는 게 아니라,
  // "지금 탭이 뭐냐"에 따라 알맞은 컴포넌트만 그린다.
  // ───────────────────────────────────────────
  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            theme={theme}
            toggleTheme={toggleTheme}
            onNavigate={navigate}
            onOpenDay={setDetailDay}
            sessions={sessions}
            weeklyGoal={weeklyGoal}
          />
        );
      case "rec":
        return (
          <RecordPage
            key={editDay ?? "new"}
            theme={theme}
            toggleTheme={toggleTheme}
            sessions={sessions}
            editDay={editDay}
            onSave={handleSave}
            onNavigate={navigate}
            unit={unit}
          />
        );
      case "graph":
        return (
          <GraphPage
            theme={theme}
            toggleTheme={toggleTheme}
            sessions={sessions}
            unit={unit}
          />
        );
      case "my":
        return (
          <MyPage
            theme={theme}
            toggleTheme={toggleTheme}
            sessions={sessions}
            onNavigate={navigate}
            weeklyGoal={weeklyGoal}
            setWeeklyGoal={setWeeklyGoal}
            unit={unit}
            setUnit={setUnit}
          />
        );
      default:
        return <HomePage theme={theme} toggleTheme={toggleTheme} />;
    }
  };

  return (
    // data-theme 속성에 theme 값을 넣으면, CSS가 그 값에 맞는 색을 쓴다.
    // (App.css에서 [data-theme="light"] 부분이 이때 작동)
    <div className="phone" data-theme={theme}>
      {/* 상태바 (시간, 배터리 같은 장식) */}
      <div className="statusbar">
        <span>9:41</span>
        <span className="sys">
          <Signal size={16} strokeWidth={2.4} />
          <Wifi size={16} strokeWidth={2.4} />
          <BatteryFull size={22} strokeWidth={2} />
        </span>
      </div>

      {/* 스크롤되는 본문: 현재 탭에 맞는 페이지가 들어감 */}
      <div className="screen">{renderPage()}</div>

      {/* 하단 탭바.
          - activeTab : 지금 어떤 탭인지 알려줌 (어떤 탭을 강조할지 판단용)
          - onTabChange : 탭을 누르면 실행할 함수를 넘겨줌 (props로 전달)
          이게 바로 "부모 → 자식" 으로 함수를 넘기는 방식. */}
      <TabBar activeTab={activeTab} onTabChange={navigate} />

      {/* 운동 상세 시트: detailDay가 있을 때만 올라온다 */}
      <DaySheet
        day={detailDay}
        sessions={sessions}
        unit={unit}
        onClose={() => setDetailDay(null)}
        onEdit={startEdit}
      />
    </div>
  );
}

export default App;
