// components/TabBar.jsx
// Lucide 아이콘 버전

// 1) 필요한 아이콘들을 불러온다
import { Home, TrendingUp, Plus, User } from "lucide-react";

function TabBar({ activeTab, onTabChange }) {
  // 2) icon 자리에 "이모지 문자열" 대신 "아이콘 컴포넌트"를 담는다.
  //    Icon: Home  ← 이렇게 컴포넌트 자체를 값으로 저장
  const tabs = [
    { id: "home", Icon: Home, label: "홈" },
    { id: "graph", Icon: TrendingUp, label: "성장" },
    { id: "rec", Icon: Plus, label: "기록", isMain: true },
    { id: "my", Icon: User, label: "마이" },
  ];

  return (
    <div className="tabbar">
      {tabs.map((tab) => {
        // 3) 담아둔 컴포넌트를 꺼내서 쓰려면 대문자 변수에 넣어야 한다
        //    (리액트 규칙: 컴포넌트는 대문자로 시작)
        const Icon = tab.Icon;
        return (
          <div
            key={tab.id}
            className={"tab" + (tab.isMain ? " rec-tab" : "") + (activeTab === tab.id ? " on" : "")}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="ico">
              {/* 4) size로 크기, currentColor로 테마 색 자동 적용 */}
              <Icon size={tab.isMain ? 24 : 22} color="currentColor" />
            </div>
            <div className="lb">{tab.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default TabBar;
