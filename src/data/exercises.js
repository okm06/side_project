// ============================================
// data/exercises.js
// 앱이 미리 갖고 있는 "고정 운동 목록" (기획 §5-1 ② exercises)
// 지금은 로컬 파일. 나중에 Supabase의 exercises 테이블로 옮기거나 그대로 둬도 됨.
//  - type: "weight"(무게×횟수×세트) | "cardio"(시간·거리)
//  - part: 부위 (유산소는 "유산소")
// 화면 코드는 이 파일만 import 해서 쓴다 → 나중에 출처만 바꾸면 됨.
// ============================================

export const EXERCISES = [
  // 가슴
  { id: "bench-press", name: "벤치프레스", part: "가슴", type: "weight" },
  { id: "incline-bench", name: "인클라인 벤치프레스", part: "가슴", type: "weight" },
  { id: "decline-bench", name: "디클라인 벤치프레스", part: "가슴", type: "weight" },
  { id: "db-bench", name: "덤벨 벤치프레스", part: "가슴", type: "weight" },
  { id: "incline-db", name: "인클라인 덤벨프레스", part: "가슴", type: "weight" },
  { id: "chest-press", name: "체스트 프레스 머신", part: "가슴", type: "weight" },
  { id: "cable-fly", name: "케이블 플라이", part: "가슴", type: "weight" },
  { id: "pec-deck", name: "펙덱 플라이", part: "가슴", type: "weight" },
  { id: "push-up", name: "푸시업", part: "가슴", type: "weight" },

  // 등
  { id: "deadlift", name: "데드리프트", part: "등", type: "weight" },
  { id: "barbell-row", name: "바벨 로우", part: "등", type: "weight" },
  { id: "db-row", name: "덤벨 로우", part: "등", type: "weight" },
  { id: "lat-pulldown", name: "랫풀다운", part: "등", type: "weight" },
  { id: "seated-row", name: "시티드 케이블 로우", part: "등", type: "weight" },
  { id: "pull-up", name: "풀업", part: "등", type: "weight" },
  { id: "t-bar-row", name: "티바 로우", part: "등", type: "weight" },
  { id: "face-pull", name: "페이스풀", part: "등", type: "weight" },

  // 어깨
  { id: "ohp", name: "오버헤드 프레스", part: "어깨", type: "weight" },
  { id: "db-shoulder", name: "덤벨 숄더프레스", part: "어깨", type: "weight" },
  { id: "lateral-raise", name: "사이드 레터럴 레이즈", part: "어깨", type: "weight" },
  { id: "front-raise", name: "프론트 레이즈", part: "어깨", type: "weight" },
  { id: "rear-delt", name: "리어 델트 플라이", part: "어깨", type: "weight" },
  { id: "arnold-press", name: "아놀드 프레스", part: "어깨", type: "weight" },
  { id: "shrug", name: "슈러그", part: "어깨", type: "weight" },

  // 하체
  { id: "squat", name: "스쿼트", part: "하체", type: "weight" },
  { id: "leg-press", name: "레그 프레스", part: "하체", type: "weight" },
  { id: "lunge", name: "런지", part: "하체", type: "weight" },
  { id: "leg-ext", name: "레그 익스텐션", part: "하체", type: "weight" },
  { id: "leg-curl", name: "레그 컬", part: "하체", type: "weight" },
  { id: "romanian-dl", name: "루마니안 데드리프트", part: "하체", type: "weight" },
  { id: "calf-raise", name: "카프 레이즈", part: "하체", type: "weight" },
  { id: "hip-thrust", name: "힙 쓰러스트", part: "하체", type: "weight" },

  // 팔
  { id: "barbell-curl", name: "바벨 컬", part: "팔", type: "weight" },
  { id: "db-curl", name: "덤벨 컬", part: "팔", type: "weight" },
  { id: "hammer-curl", name: "해머 컬", part: "팔", type: "weight" },
  { id: "preacher-curl", name: "프리처 컬", part: "팔", type: "weight" },
  { id: "tricep-pushdown", name: "트라이셉스 푸시다운", part: "팔", type: "weight" },
  { id: "lying-tricep", name: "라잉 트라이셉스 익스텐션", part: "팔", type: "weight" },
  { id: "dips", name: "딥스", part: "팔", type: "weight" },

  // 코어
  { id: "plank", name: "플랭크", part: "코어", type: "weight" },
  { id: "crunch", name: "크런치", part: "코어", type: "weight" },
  { id: "leg-raise", name: "레그 레이즈", part: "코어", type: "weight" },
  { id: "russian-twist", name: "러시안 트위스트", part: "코어", type: "weight" },
  { id: "hanging-leg", name: "행잉 레그레이즈", part: "코어", type: "weight" },

  // 유산소
  { id: "running", name: "러닝", part: "유산소", type: "cardio" },
  { id: "cycling", name: "사이클", part: "유산소", type: "cardio" },
  { id: "rowing", name: "로잉", part: "유산소", type: "cardio" },
  { id: "elliptical", name: "일립티컬", part: "유산소", type: "cardio" },
  { id: "stair", name: "스테어클라이머", part: "유산소", type: "cardio" },
  { id: "jump-rope", name: "줄넘기", part: "유산소", type: "cardio" },
  { id: "walking", name: "걷기", part: "유산소", type: "cardio" },
];

// 빠른 조회용 맵 (id로 운동 찾기)
export const EXERCISE_MAP = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

// "자주/최근 한 운동" (가짜) — 타이핑 없이 탭으로 바로 추가
export const FREQUENT_IDS = ["bench-press", "squat", "lat-pulldown", "running", "ohp", "deadlift"];

// 미리 만든 루틴 (기획 §5-1 ⑤ routines) — 가짜
export const ROUTINES = [
  { id: "r-chest", name: "가슴 루틴", exerciseIds: ["bench-press", "incline-db", "cable-fly", "dips"] },
  { id: "r-back", name: "등·이두", exerciseIds: ["deadlift", "lat-pulldown", "barbell-row", "db-curl"] },
  { id: "r-leg", name: "하체", exerciseIds: ["squat", "leg-press", "lunge", "leg-curl"] },
  { id: "r-shoulder", name: "어깨", exerciseIds: ["ohp", "lateral-raise", "rear-delt"] },
];
