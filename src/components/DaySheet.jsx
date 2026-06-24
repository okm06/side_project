// ============================================
// components/DaySheet.jsx
// 달력에서 날짜를 누르면 아래에서 올라오는 "운동 상세" 시트.
// (기획 §6 4번째 화면 — 메뉴엔 없고 달력에서 진입)
//  - day === null 이면 닫힘
//  - 운동한 날이면 그 날 기록을, 아니면 빈 상태 + 기록하기 버튼
//  - 손잡이(또는 헤더)를 잡고 아래로 끌면 닫힘 (drag-to-dismiss)
// ============================================

import { useState, useRef, useEffect } from "react";
import { X, Dumbbell, Timer, Plus, Pencil } from "lucide-react";
import { expandRecord } from "../data/workoutData";

const WD = ["일", "월", "화", "수", "목", "금", "토"];
const CLOSE_THRESHOLD = 110; // 이만큼 내리면 닫힘

function DaySheet({ day, sessions, onClose, onEdit }) {
  // 끌어내린 거리(px)와 드래그 중 여부
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  // 시트가 새로 열릴 때(날짜 바뀔 때) 드래그 상태 초기화
  useEffect(() => {
    setDragY(0);
    setDragging(false);
  }, [day]);

  if (day === null || day === undefined) return null;

  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day);
  const weekday = WD[date.getDay()];
  const session = sessions[day];
  const records = session ? session.records.map(expandRecord) : [];

  // ── 드래그 핸들러 ──────────────────────────────
  const onPointerDown = (e) => {
    setDragging(true);
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY.current;
    // 아래로는 그대로, 위로는 살짝 저항감만
    setDragY(dy > 0 ? dy : dy * 0.25);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) {
      onClose(); // 충분히 내렸으면 닫기
    } else {
      setDragY(0); // 아니면 제자리로
    }
  };

  // 끌고 있을 때만 위치를 직접 제어 (그 외엔 CSS 등장 애니메이션에 맡김)
  const sheetStyle =
    dragging || dragY !== 0
      ? {
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
        }
      : undefined;
  // 내릴수록 배경도 옅어지게
  const wrapStyle =
    dragging || dragY !== 0
      ? { opacity: Math.max(0.15, 1 - dragY / 500) }
      : undefined;

  return (
    <div className="sheet-wrap" style={wrapStyle} onClick={onClose}>
      <div className="sheet" style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        {/* 잡아끄는 영역: 손잡이 + 헤더 */}
        <div
          className="sheet-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet-handle" />

          <div className="sheet-head">
            <div>
              <div className="sheet-date">
                {now.getMonth() + 1}월 {day}일 ({weekday})
              </div>
              <div className="sheet-sub">
                {session ? `${session.records.length}종목 · ${session.duration}분` : "기록 없음"}
              </div>
            </div>
            <button
              className="sheet-x"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {session ? (
          <>
            <div className="rec-list">
              {records.map((r, i) => (
                <div className="rec-item" key={i}>
                  <div
                    className="rec-ico"
                    style={{ color: r.type === "weight" ? "var(--blue)" : "var(--amber)" }}
                  >
                    {r.type === "weight" ? <Dumbbell size={18} /> : <Timer size={18} />}
                  </div>
                  <div className="rec-main">
                    <div className="rec-name">
                      {r.name}
                      <span className="rec-part">
                        {r.type === "weight" ? r.part : "유산소"}
                      </span>
                    </div>
                    <div className="rec-detail">
                      {r.type === "weight"
                        ? r.sets.map((s) => `${s.weight}kg×${s.reps}`).join(" · ")
                        : `${r.dist}km · ${r.time}분`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="sheet-edit" onClick={() => onEdit(day)}>
              <Pencil size={16} /> 이 날 기록 수정
            </button>
          </>
        ) : (
          <div className="sheet-empty">
            <p>이 날은 운동 기록이 없어요.</p>
            <button className="sheet-cta" onClick={() => onEdit(day)}>
              <Plus size={18} /> 이 날 운동 기록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaySheet;
