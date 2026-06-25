// ============================================
// pages/GraphPage.jsx
// 그래프 화면 — 기획 §6 ③ "운동별 추이로 성장 확인"
//  - 운동 선택(기록 있는 운동만)
//  - 지표 선택: 웨이트=최고무게/볼륨, 유산소=거리/시간
//  - 추이 라인 차트(SVG) + 최고/최근/변화 요약
// ※ sessions(가짜)에서 계산. 나중에 DB로 바뀌어도 화면 로직 그대로.
// ============================================

import { useState } from "react";
import { TrendingUp, PieChart } from "lucide-react";
import { EXERCISE_MAP } from "../data/exercises";
import { getFrequentExercises, getPartBreakdown } from "../data/workoutData";
import { toUnit } from "../data/units";

// 부위별 막대 색 (테마 변수 재사용 — 3색 순환)
const PART_COLORS = {
  가슴: "var(--blue)",
  등: "var(--accent)",
  어깨: "var(--amber)",
  하체: "var(--blue)",
  팔: "var(--accent)",
  코어: "var(--amber)",
  유산소: "var(--amber)",
};

// 지표 정의 (타입별)
const METRICS = {
  weight: [
    { key: "max", label: "최고 무게", unit: "kg" },
    { key: "volume", label: "볼륨", unit: "kg" },
  ],
  cardio: [
    { key: "dist", label: "거리", unit: "km" },
    { key: "time", label: "시간", unit: "분" },
  ],
};

// 한 record에서 지표값 하나 뽑기
function metricValue(rec, metric) {
  if (metric === "max") return Math.max(...rec.sets.map((s) => Number(s.weight) || 0));
  if (metric === "volume")
    return rec.sets.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  if (metric === "dist") return Number(rec.dist) || 0;
  return Number(rec.time) || 0; // time
}

// 선택 운동의 날짜별 추이 [{day, value}, ...] (날짜 오름차순)
// 무게 지표(max/volume)는 표시 단위로 환산. 유산소(dist/time)는 그대로.
function buildSeries(sessions, exId, metric, unit) {
  const isWeightMetric = metric === "max" || metric === "volume";
  return Object.keys(sessions)
    .map(Number)
    .sort((a, b) => a - b)
    .map((d) => {
      const rec = sessions[d].records.find((r) => r.exId === exId);
      if (!rec) return null;
      const v = metricValue(rec, metric);
      return { day: d, value: isWeightMetric ? toUnit(v, unit) : v };
    })
    .filter(Boolean);
}

function GraphPage({ theme, toggleTheme, sessions, unit }) {
  // 기록이 있는 운동들 (많이 한 순)
  const historyIds = getFrequentExercises(sessions, 999);

  // 이번 달 부위별 비중
  const breakdown = getPartBreakdown(sessions);
  const topPct = breakdown[0]?.pct || 0; // 막대 길이를 1등 기준으로 정규화

  const [exId, setExId] = useState(historyIds[0] || null);
  const ex = exId ? EXERCISE_MAP[exId] : null;
  const metricsForType = ex ? METRICS[ex.type] : [];
  const [metric, setMetric] = useState(metricsForType[0]?.key || "max");

  const metricDef = metricsForType.find((m) => m.key === metric) || metricsForType[0];
  const series = ex ? buildSeries(sessions, exId, metric, unit) : [];
  // 무게 지표면 단위를 설정값(kg/lb)으로, 유산소면 지표 고유 단위(km/분)
  const unitLabel =
    ex && ex.type === "weight" ? unit : metricDef?.unit;

  // 운동 바꾸면 지표를 그 타입 기본값으로 초기화
  const onPickExercise = (id) => {
    setExId(id);
    setMetric(METRICS[EXERCISE_MAP[id].type][0].key);
  };

  // 요약값
  const values = series.map((p) => p.value);
  const latest = values.length ? values[values.length - 1] : 0;
  const peak = values.length ? Math.max(...values) : 0;
  const peakDay = series.find((p) => p.value === peak)?.day;
  const change = values.length > 1 ? latest - values[0] : 0;

  return (
    <div className="page">
      <div className="top">
        <div>
          <div className="greet">운동별 추이</div>
          <div className="title">성장 그래프</div>
        </div>
        <div className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </div>
      </div>

      {!ex ? (
        <div className="card empty">
          <div className="ico-wrap">
            <TrendingUp size={26} strokeWidth={2} />
          </div>
          <div className="emp-title">아직 그래프가 없어요</div>
          <div className="emp-desc">운동을 기록하면 종목별 성장 추이가 여기에 그려져요.</div>
        </div>
      ) : (
        <>
          {/* 이번 달 부위별 비중 — 가로 막대 */}
          <div className="card pbreak-card">
            <div className="pbreak-head">
              <PieChart size={16} />
              이번 달 부위별 비중
            </div>
            <div className="pbreak-list">
              {breakdown.map((b) => (
                <div className="pbar" key={b.part}>
                  <div className="pbar-top">
                    <span className="pbar-name">{b.part}</span>
                    <span className="pbar-meta">
                      <b>{b.count}</b>회 · {b.pct}%
                    </span>
                  </div>
                  <div className="pbar-track">
                    <div
                      className="pbar-fill"
                      style={{
                        width: `${topPct ? (b.pct / topPct) * 100 : 0}%`,
                        background: PART_COLORS[b.part] || "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 운동 선택 — 칩으로 한 번 탭 (자주 한 순) */}
          <div className="rec-label">운동 선택</div>
          <div className="part-chips ex-chips">
            {historyIds.map((id) => (
              <button
                key={id}
                className={"part-chip" + (id === exId ? " on" : "")}
                onClick={() => onPickExercise(id)}
              >
                {EXERCISE_MAP[id].name}
              </button>
            ))}
          </div>

          {/* 지표 토글 */}
          <div className="seg">
            {metricsForType.map((m) => (
              <button
                key={m.key}
                className={"seg-btn" + (m.key === metric ? " on" : "")}
                onClick={() => setMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* 차트 */}
          <div className="card chart-card">
            <div className="chart-head">
              <div>
                <div className="chart-metric">
                  {metricDef.label} 추이
                </div>
                <div className="chart-latest">
                  최근 <b>{latest.toLocaleString()}</b>
                  {unitLabel}
                </div>
              </div>
              {values.length > 1 && (
                <div className={"chart-change" + (change >= 0 ? " up" : " down")}>
                  처음 대비 {change >= 0 ? "+" : ""}
                  {change.toLocaleString()}
                  {unitLabel}
                </div>
              )}
            </div>
            <LineChart series={series} unit={unitLabel} />
          </div>

          {/* 요약 */}
          <div className="stat-row">
            <div className="stat">
              <div className="s-top">기록 횟수</div>
              <div className="s-val">
                {series.length}
                <span className="s-unit">회</span>
              </div>
            </div>
            <div className="stat">
              <div className="s-top">최고 기록</div>
              <div className="s-val">
                {peak.toLocaleString()}
                <span className="s-unit">{unitLabel}</span>
              </div>
            </div>
            <div className="stat">
              <div className="s-top">최고일</div>
              <div className="s-val">
                {peakDay ?? "-"}
                <span className="s-unit">일</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── 라인 차트 (SVG) ────────────────────────────
function LineChart({ series, unit }) {
  const W = 300;
  const H = 170;
  const L = 12;
  const R = 12;
  const T = 18;
  const B = 26;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const bottom = T + plotH;

  if (series.length === 0) {
    return <div className="chart-empty">데이터가 없어요</div>;
  }

  const values = series.map((p) => p.value);
  let vmin = Math.min(...values);
  let vmax = Math.max(...values);
  if (vmin === vmax) {
    // 값이 다 같으면 위아래로 여유를 줘서 선이 가운데 오게
    vmin = vmin - 1;
    vmax = vmax + 1;
  }

  const n = series.length;
  const x = (i) => (n === 1 ? L + plotW / 2 : L + (i / (n - 1)) * plotW);
  const y = (v) => bottom - ((v - vmin) / (vmax - vmin)) * plotH;

  const pts = series.map((p, i) => [x(i), y(p.value)]);
  const linePath = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px},${py}`).join(" ");
  const areaPath = `M${pts[0][0]},${bottom} ${pts
    .map(([px, py]) => `L${px},${py}`)
    .join(" ")} L${pts[n - 1][0]},${bottom} Z`;

  // x축 라벨: 점이 많으면 처음/끝만
  const showAll = n <= 8;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} width="100%">
      {/* 가로 보조선 */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          className="chart-grid"
          x1={L}
          x2={W - R}
          y1={T + t * plotH}
          y2={T + t * plotH}
        />
      ))}

      <path className="chart-area" d={areaPath} />
      <path className="chart-line" d={linePath} vectorEffect="non-scaling-stroke" />

      {pts.map(([px, py], i) => (
        <circle
          key={i}
          className={"chart-dot" + (i === n - 1 ? " last" : "")}
          cx={px}
          cy={py}
          r={i === n - 1 ? 4.5 : 3}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* x축 날짜 라벨 */}
      {series.map((p, i) =>
        showAll || i === 0 || i === n - 1 ? (
          <text key={i} className="chart-x" x={x(i)} y={H - 8} textAnchor="middle">
            {p.day}일
          </text>
        ) : null
      )}

      {/* y 최고/최저 */}
      <text className="chart-y" x={L} y={T - 5}>
        {vmax % 1 === 0 ? vmax : vmax.toFixed(1)}
        {unit}
      </text>
    </svg>
  );
}

export default GraphPage;
