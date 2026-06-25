// ============================================
// data/units.js
// 무게 단위(kg/lb) 변환. 저장은 항상 kg(표준), 화면 표시/입력만 단위 변환.
//  - 마이페이지 설정에서 unit을 바꾸면 앱 전체 무게 표시가 따라감
//  - DB 붙여도 저장값은 kg → 단위는 화면단 표현일 뿐
// ============================================

export const UNITS = ["kg", "lb"];
const LB_PER_KG = 2.20462;

// 저장값(kg) → 표시 단위 숫자 (소수 1자리)
export function toUnit(kg, unit) {
  if (unit === "lb") return Math.round(kg * LB_PER_KG * 10) / 10;
  return kg;
}

// 입력값(표시 단위) → 저장값(kg) (소수 1자리)
export function toKg(val, unit) {
  if (unit === "lb") return Math.round((val / LB_PER_KG) * 10) / 10;
  return val;
}

// 단위별 기본 무게(가벼운 시작값) — 새 세트 추가 시 자연스러운 라운드값
export function defaultWeight(unit) {
  return unit === "lb" ? 45 : 20;
}
