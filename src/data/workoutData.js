// ============================================
// data/workoutData.js
// "운동 기록(세션)" 데이터 계층. 지금은 전부 가짜(메모리).
// 나중에 이 파일만 Supabase(sessions/records)로 갈아끼우면 화면은 그대로.
//
// 표준 기록(record) 형태 — 운동ID(exId) 기준:
//   웨이트 → { exId, sets: [{ weight, reps }, ...] }   (세트마다 무게 다름 가능)
//   유산소 → { exId, time, dist }
// 세션(session) → { records: [...], duration }
// ============================================

import { EXERCISE_MAP } from "./exercises";

// 작성 헬퍼
const w = (exId, setPairs) => ({
  exId,
  sets: setPairs.map(([weight, reps]) => ({ weight, reps })),
});
const c = (exId, time, dist) => ({ exId, time, dist });

// ── 과거 운동 기록 시드 (이번 달, 날(일) → 그 날 한 운동들) ──
const SEED = {
  2: [w("bench-press", [[60, 12], [70, 10], [75, 8]]), w("incline-db", [[22, 12], [24, 10]]), w("cable-fly", [[14, 15], [14, 15]]), w("dips", [[0, 12], [0, 10]])],
  3: [w("deadlift", [[100, 8], [110, 5]]), w("lat-pulldown", [[50, 12], [55, 10]]), w("barbell-row", [[60, 10], [65, 8]]), w("db-curl", [[14, 12], [16, 10]])],
  6: [w("squat", [[80, 10], [90, 8], [100, 5]]), w("leg-press", [[140, 12], [160, 10]]), w("lunge", [[20, 12], [20, 12]]), w("leg-curl", [[40, 12], [45, 10]])],
  9: [w("ohp", [[40, 10], [42, 8]]), w("lateral-raise", [[10, 15], [12, 12]]), w("rear-delt", [[12, 15], [12, 15]]), c("cycling", 20, 8.0)],
  10: [w("bench-press", [[65, 12], [72, 10], [80, 6]]), w("chest-press", [[50, 12], [55, 10]]), w("pec-deck", [[40, 15], [45, 12]])],
  13: [w("pull-up", [[0, 10], [0, 8], [0, 6]]), w("seated-row", [[55, 12], [60, 10]]), w("t-bar-row", [[40, 12], [45, 10]]), w("hammer-curl", [[14, 12], [16, 10]])],
  16: [w("squat", [[85, 10], [95, 8], [105, 5]]), w("romanian-dl", [[80, 10], [90, 8]]), w("leg-ext", [[50, 15], [55, 12]]), w("calf-raise", [[60, 20], [60, 20]])],
  17: [c("running", 30, 5.2), w("plank", [[0, 60]]), w("crunch", [[0, 20], [0, 20], [0, 20]])],
  20: [w("bench-press", [[70, 10], [75, 8], [82, 5]]), w("incline-db", [[24, 12], [26, 10]]), w("cable-fly", [[15, 15], [16, 12]])],
  23: [w("ohp", [[42, 10], [45, 8]]), w("lateral-raise", [[12, 15], [12, 15]]), w("front-raise", [[10, 12], [10, 12]]), w("shrug", [[60, 15], [70, 12]])],
  24: [w("deadlift", [[110, 8], [120, 5], [130, 3]]), w("lat-pulldown", [[55, 12], [60, 10]]), w("barbell-row", [[65, 10], [70, 8]])],
};

// 한 세션의 대략적인 운동 시간(분) 추정 — 유산소 시간 + 웨이트 세트당 4분
export function estimateDuration(records) {
  let m = 0;
  records.forEach((r) => {
    if (EXERCISE_MAP[r.exId]?.type === "cardio") m += r.time || 0;
    else m += (r.sets?.length || 0) * 4;
  });
  return m;
}

// 앱 시작 시 쓸 초기 세션 맵 { day: { records, duration } }
export function buildInitialSessions() {
  const out = {};
  for (const day in SEED) {
    const records = SEED[day];
    out[day] = { records, duration: estimateDuration(records) };
  }
  return out;
}

// 표준 record에 운동 이름/부위/타입을 붙여서 "화면용"으로 펼친다
export function expandRecord(r) {
  const ex = EXERCISE_MAP[r.exId] || { name: r.exId, part: "", type: "weight" };
  return { ...r, name: ex.name, part: ex.part, type: ex.type };
}

// 실제 기록에서 "자주/최근 한 운동" 자동 산출 (많이 한 순 → 최근 순).
//  → 기록 화면의 "자주 한 운동" 버튼에 사용 (고정 목록 대신 진짜 데이터)
export function getFrequentExercises(sessions, limit = 6) {
  const stat = {}; // exId → { count, lastDay }
  for (const day in sessions) {
    const d = Number(day);
    sessions[day].records.forEach((r) => {
      if (!stat[r.exId]) stat[r.exId] = { count: 0, lastDay: 0 };
      stat[r.exId].count += 1;
      stat[r.exId].lastDay = Math.max(stat[r.exId].lastDay, d);
    });
  }
  return Object.keys(stat)
    .sort((a, b) =>
      stat[b].count !== stat[a].count
        ? stat[b].count - stat[a].count
        : stat[b].lastDay - stat[a].lastDay
    )
    .slice(0, limit);
}

// ── 통계 계산 (홈·마이에서 공용) ───────────────────────
// 전부 sessions(가짜)에서 즉석 계산 → DB로 바뀌어도 화면 로직 그대로.
// ※ prototype은 "이번 달" 데이터만 다룸(세션 키 = 그 달의 '일').

// 연속 운동 일수: 오늘부터 거슬러 셈. 오늘 안 했으면 어제부터 시작(끊긴 건 아님).
export function getStreak(sessions, refDay = new Date().getDate()) {
  let day = refDay;
  if (!sessions[day]) day -= 1; // 오늘 아직 안 했으면 어제부터
  let streak = 0;
  while (day >= 1 && sessions[day]) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

// 이번 주(일~토) 운동 횟수 — 홈 주간 목표 진행바에 사용
export function getWeekCount(sessions, ref = new Date()) {
  const weekStart = ref.getDate() - ref.getDay(); // 이번 주 일요일의 '일'
  const weekEnd = weekStart + 6;
  return Object.keys(sessions)
    .map(Number)
    .filter((d) => d >= weekStart && d <= weekEnd).length;
}

// 누적 운동 시간(분) — 각 세션 duration 합
export function getTotalMinutes(sessions) {
  return Object.values(sessions).reduce((a, s) => a + (s.duration || 0), 0);
}

// 부위별 비중(이번 달) — 운동 종목 등장 횟수 기준. [{part, count, pct}] 내림차순.
export function getPartBreakdown(sessions) {
  const counts = {};
  let total = 0;
  Object.values(sessions).forEach((s) =>
    s.records.forEach((r) => {
      const part = EXERCISE_MAP[r.exId]?.part || "기타";
      counts[part] = (counts[part] || 0) + 1;
      total += 1;
    })
  );
  return Object.entries(counts)
    .map(([part, count]) => ({
      part,
      count,
      pct: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// 특정 운동의 "지난 기록" 찾기 (beforeDay 이전에서 가장 최근). 없으면 null.
// → 기록 화면에서 기본값 자동 채움 + "지난번 …" 힌트에 사용
export function getLastRecord(sessions, exId, beforeDay) {
  const days = Object.keys(sessions)
    .map(Number)
    .filter((d) => d < beforeDay)
    .sort((a, b) => b - a);
  for (const d of days) {
    const rec = sessions[d].records.find((r) => r.exId === exId);
    if (rec) return { ...rec, day: d };
  }
  return null;
}
