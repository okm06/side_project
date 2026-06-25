// ============================================
// pages/RecordPage.jsx
// 기록 화면 — 기획 §4·§6-1 "세상에서 제일 빠른 기록"
//  1) 루틴 불러오기 칩 (운동들 한 번에 채움)
//  2) 운동 검색 자동완성 + 자주 한 운동 큰 버튼 (타이핑 없이 탭)
//  3) 고른 운동마다 타입별 입력칸 자동 분기 (웨이트=무게·횟수·세트 / 유산소=시간·거리)
//  4) 오늘 운동 저장
// ※ 운동 목록은 src/data/exercises.js (지금은 로컬 파일, 나중에 DB로 교체)
// ============================================

import { useState } from "react";
import { Search, X, Dumbbell, Timer, Plus, Check, ListPlus } from "lucide-react";
import { EXERCISES, EXERCISE_MAP, FREQUENT_IDS, ROUTINES } from "../data/exercises";
import { getLastRecord, getFrequentExercises } from "../data/workoutData";
import { toUnit, toKg, defaultWeight } from "../data/units";

const WD = ["일", "월", "화", "수", "목", "금", "토"];

// 부위 목록 (운동 DB에서 등장 순서대로 중복 제거)
const PARTS = [...new Set(EXERCISES.map((e) => e.part))];

// "지난 기록"을 사람이 읽는 문구로 (힌트용). 무게는 표시 단위로 변환.
function lastSummary(last, type, unit) {
  if (!last) return null;
  if (type === "weight") {
    const sets = last.sets.map((s) => `${toUnit(s.weight, unit)}×${s.reps}`).join(" · ");
    return `지난번 ${last.day}일 · ${sets}`;
  }
  return `지난번 ${last.day}일 · ${last.dist}km ${last.time}분`;
}

function RecordPage({ theme, toggleTheme, sessions, editDay, onSave, onNavigate, unit }) {
  const now = new Date();
  const today = now.getDate();
  const isEditing = editDay != null; // 수정 모드인가
  const targetDay = isEditing ? editDay : today; // 기록 대상 날
  const targetDate = new Date(now.getFullYear(), now.getMonth(), targetDay);
  const dateLabel = `${now.getMonth() + 1}월 ${targetDay}일 ${WD[targetDate.getDay()]}요일`;

  // 운동 1개를 "기록 중" 카드로 만든다.
  //  - 지난 기록이 있으면 그 값을 기본값으로 채움(숫자만 수정) — 기획 §4 핵심
  const makeEntry = (ex) => {
    const last = getLastRecord(sessions, ex.id, targetDay);
    const base = { uid: ex.id + "-" + Date.now(), ex, last };
    if (ex.type === "weight") {
      // 카드 안에서는 표시 단위로 편집(저장 시 kg로 환산)
      return {
        ...base,
        sets: last
          ? last.sets.map((s) => ({ weight: toUnit(s.weight, unit), reps: s.reps }))
          : [{ weight: defaultWeight(unit), reps: 10 }],
      };
    }
    return { ...base, time: last ? last.time : 30, dist: last ? last.dist : 5 };
  };

  // 저장된 record → 편집용 카드 (수정 모드 초기값)
  const entryFromRecord = (r) => {
    const ex = EXERCISE_MAP[r.exId];
    const last = getLastRecord(sessions, r.exId, targetDay);
    const base = { uid: r.exId + "-" + Math.random().toString(36).slice(2), ex, last };
    return ex.type === "weight"
      ? { ...base, sets: r.sets.map((s) => ({ weight: toUnit(s.weight, unit), reps: s.reps })) }
      : { ...base, time: r.time, dist: r.dist };
  };

  const [query, setQuery] = useState("");
  // 수정 모드면 그 날 기록을 미리 카드로 불러온다 (없으면 빈 목록)
  const [entries, setEntries] = useState(() =>
    isEditing && sessions[editDay] ? sessions[editDay].records.map(entryFromRecord) : []
  );
  const [saved, setSaved] = useState(false); // 저장 완료 토스트
  const [part, setPart] = useState(null); // 선택한 부위(둘러보기). null이면 "자주"

  const isAdded = (id) => entries.some((en) => en.ex.id === id);

  // 자주/최근 한 운동 (실제 기록에서 산출, 없으면 기본 목록으로 대체)
  const freq = getFrequentExercises(sessions, 6);
  const frequentIds = freq.length ? freq : FREQUENT_IDS;

  // 선택한 부위의 운동들 (이미 담은 건 제외)
  const partExercises = part
    ? EXERCISES.filter((e) => e.part === part && !isAdded(e.id))
    : [];

  // 검색 자동완성 후보 (이름에 검색어 포함, 이미 담은 건 제외, 최대 6개)
  const q = query.trim();
  const suggestions = q
    ? EXERCISES.filter(
        (e) => e.name.includes(q) && !entries.some((en) => en.ex.id === e.id)
      ).slice(0, 6)
    : [];

  // 운동 1개 추가 (중복 방지)
  const addExercise = (ex) => {
    if (entries.some((en) => en.ex.id === ex.id)) return;
    setEntries((prev) => [...prev, makeEntry(ex)]);
    setQuery("");
  };

  // 루틴 불러오기 → 포함 운동들 한 번에 추가
  const loadRoutine = (routine) => {
    const toAdd = routine.exerciseIds
      .filter((id) => !entries.some((en) => en.ex.id === id))
      .map((id) => makeEntry(EXERCISE_MAP[id]));
    setEntries((prev) => [...prev, ...toAdd]);
  };

  const removeEntry = (uid) => setEntries((prev) => prev.filter((e) => e.uid !== uid));

  // 입력칸 값 변경 (유산소: 시간·거리)
  const updateEntry = (uid, key, value) => {
    const n = value === "" ? "" : Number(value);
    setEntries((prev) => prev.map((e) => (e.uid === uid ? { ...e, [key]: n } : e)));
  };

  // 세트 추가 — 바로 앞 세트 값을 복사해서 빠르게 (타이핑 줄이기 핵심)
  const addSet = (uid) =>
    setEntries((prev) =>
      prev.map((e) => {
        if (e.uid !== uid) return e;
        const last = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, { ...last }] };
      })
    );

  // 세트 삭제 (최소 1개는 유지)
  const removeSet = (uid, idx) =>
    setEntries((prev) =>
      prev.map((e) =>
        e.uid === uid && e.sets.length > 1
          ? { ...e, sets: e.sets.filter((_, i) => i !== idx) }
          : e
      )
    );

  // 세트별 무게/횟수 변경
  const updateSet = (uid, idx, key, value) => {
    const n = value === "" ? "" : Number(value);
    setEntries((prev) =>
      prev.map((e) =>
        e.uid === uid
          ? { ...e, sets: e.sets.map((s, i) => (i === idx ? { ...s, [key]: n } : s)) }
          : e
      )
    );
  };

  // 저장: 표준 record 형태로 바꿔 App에 올린다 → 홈 달력·요약에 즉시 반영
  //  - 새 기록: 비어있으면 무시. 수정: 비어있으면 그 날 기록 삭제(허용).
  const save = () => {
    if (entries.length === 0 && !isEditing) return;
    const records = entries.map((en) =>
      en.ex.type === "weight"
        ? {
            exId: en.ex.id,
            // 표시 단위로 입력된 무게를 저장용 kg로 환산
            sets: en.sets.map((s) => ({
              weight: toKg(Number(s.weight) || 0, unit),
              reps: Number(s.reps) || 0,
            })),
          }
        : { exId: en.ex.id, time: Number(en.time) || 0, dist: Number(en.dist) || 0 }
    );
    onSave(records);
    setQuery("");
    if (isEditing) {
      onNavigate("home"); // 수정 후 홈으로 돌아가 결과 확인
    } else {
      setEntries([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  return (
    <div className="page">
      <div className="top">
        <div>
          <div className="greet">{dateLabel}</div>
          <div className="title">
            {isEditing ? "기록 수정" : "운동 기록"}
            {isEditing && <span className="edit-badge">수정 중</span>}
          </div>
        </div>
        <div className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </div>
      </div>

      {/* 1) 루틴 불러오기 */}
      <div className="rec-label">
        <ListPlus size={15} /> 루틴 불러오기
      </div>
      <div className="chip-row">
        {ROUTINES.map((r) => (
          <button key={r.id} className="chip" onClick={() => loadRoutine(r)}>
            {r.name}
            <span className="chip-n">{r.exerciseIds.length}</span>
          </button>
        ))}
      </div>

      {/* 2) 운동 검색 */}
      <div className="search-wrap">
        <Search size={18} className="search-ico" />
        <input
          className="search-input"
          placeholder="운동 검색 (예: 벤치프레스)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* 검색 중이면 자동완성 결과 */}
      {q ? (
        <div className="suggest">
          {suggestions.length === 0 ? (
            <div className="suggest-empty">검색 결과가 없어요</div>
          ) : (
            suggestions.map((e) => (
              <button key={e.id} className="suggest-item" onClick={() => addExercise(e)}>
                <span className="suggest-name">{e.name}</span>
                <span className="suggest-part">{e.part}</span>
                <Plus size={16} className="suggest-plus" />
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          {/* 부위 칩: "자주" + 부위별 둘러보기 */}
          <div className="part-chips">
            <button
              className={"part-chip" + (part === null ? " on" : "")}
              onClick={() => setPart(null)}
            >
              ⭐ 자주
            </button>
            {PARTS.map((p) => (
              <button
                key={p}
                className={"part-chip" + (part === p ? " on" : "")}
                onClick={() => setPart(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {part === null ? (
            // 자주/최근 한 운동 (실제 기록에서 산출)
            frequentIds.length === 0 ? (
              <div className="suggest-empty browse-empty">
                기록이 쌓이면 자주 한 운동이 여기 떠요
              </div>
            ) : (
              <div className="freq-row">
                {frequentIds.map((id) => {
                  const e = EXERCISE_MAP[id];
                  return (
                    <button
                      key={id}
                      className={"freq-btn" + (isAdded(id) ? " added" : "")}
                      onClick={() => addExercise(e)}
                    >
                      {e.type === "weight" ? <Dumbbell size={15} /> : <Timer size={15} />}
                      {e.name}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            // 부위별 운동 목록
            <div className="suggest">
              {partExercises.length === 0 ? (
                <div className="suggest-empty">이 부위 운동은 다 담았어요</div>
              ) : (
                partExercises.map((e) => (
                  <button key={e.id} className="suggest-item" onClick={() => addExercise(e)}>
                    <span className="suggest-name">{e.name}</span>
                    <span className="suggest-part">{e.part}</span>
                    <Plus size={16} className="suggest-plus" />
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* 3) 기록 중인 운동 카드들 */}
      {entries.length === 0 ? (
        <div className="card empty rec-empty">
          <div className="ico-wrap">
            <Dumbbell size={26} strokeWidth={2} />
          </div>
          <div className="emp-title">오늘 한 운동을 담아보세요</div>
          <div className="emp-desc">위에서 루틴을 불러오거나 운동을 검색해 추가하면 여기에 쌓여요.</div>
        </div>
      ) : (
        <div className="entry-list">
          {entries.map((en) => (
            <div className="ex-card" key={en.uid}>
              <div className="ex-head">
                <div
                  className="ex-ico"
                  style={{ color: en.ex.type === "weight" ? "var(--blue)" : "var(--amber)" }}
                >
                  {en.ex.type === "weight" ? <Dumbbell size={18} /> : <Timer size={18} />}
                </div>
                <div className="ex-name">
                  {en.ex.name}
                  <span className="rec-part">{en.ex.part}</span>
                </div>
                <button className="ex-del" onClick={() => removeEntry(en.uid)}>
                  <X size={16} />
                </button>
              </div>

              {/* 지난 기록 힌트 (있을 때만) */}
              {en.last && (
                <div className="last-hint">{lastSummary(en.last, en.ex.type, unit)}</div>
              )}

              {/* 타입별 입력칸 자동 분기 */}
              {en.ex.type === "weight" ? (
                // 웨이트: 세트별 줄 (세트마다 무게 다름 가능)
                <div className="set-list">
                  {en.sets.map((s, i) => (
                    <div className="set-row" key={i}>
                      <span className="set-no">{i + 1}</span>
                      <span className="set-box">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={s.weight}
                          onChange={(e) => updateSet(en.uid, i, "weight", e.target.value)}
                        />
                        <span className="set-unit">{unit}</span>
                      </span>
                      <span className="set-x-mark">×</span>
                      <span className="set-box">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={s.reps}
                          onChange={(e) => updateSet(en.uid, i, "reps", e.target.value)}
                        />
                        <span className="set-unit">회</span>
                      </span>
                      <button
                        className="set-del"
                        disabled={en.sets.length === 1}
                        onClick={() => removeSet(en.uid, i)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                  <button className="add-set" onClick={() => addSet(en.uid)}>
                    <Plus size={15} /> 세트 추가
                  </button>

                  {/* 총 세트 · 볼륨(무게×횟수 합) 요약 */}
                  <div className="ex-summary">
                    총 <b>{en.sets.length}</b>세트 · 볼륨{" "}
                    <b>
                      {en.sets
                        .reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
                        .toLocaleString()}
                    </b>
                    {unit}
                  </div>
                </div>
              ) : (
                // 유산소: 시간·거리
                <div className="ex-fields">
                  <Field
                    label="시간"
                    unit="분"
                    value={en.time}
                    onChange={(v) => updateEntry(en.uid, "time", v)}
                  />
                  <Field
                    label="거리"
                    unit="km"
                    value={en.dist}
                    onChange={(v) => updateEntry(en.uid, "dist", v)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4) 저장 버튼 */}
      <button
        className="save-btn"
        disabled={entries.length === 0 && !isEditing}
        onClick={save}
      >
        <Check size={18} strokeWidth={2.6} />
        {isEditing ? "수정 저장" : "오늘 운동 저장"}
        {entries.length > 0 ? ` (${entries.length})` : ""}
      </button>

      {/* 저장 완료 토스트 */}
      {saved && (
        <div className="toast">
          <Check size={16} strokeWidth={3} /> 오늘 운동을 저장했어요
        </div>
      )}
    </div>
  );
}

// 숫자 입력 한 칸 (라벨 + input + 단위)
function Field({ label, unit, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-box">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="field-unit">{unit}</span>
      </span>
    </label>
  );
}

export default RecordPage;
