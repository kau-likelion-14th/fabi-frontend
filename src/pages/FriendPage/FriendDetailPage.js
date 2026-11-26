import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { get } from "../../Api";
import config from "../../Config";
import FriendCalendar from "./FriendCalendar";
import FriendTodo from "./FriendTodo";

import "../../styles/FriendDetailPage.css";

// todo 카테고리별 색상 정보
const Categories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};
// Date 객체를 YYYY-MM-DD 형태로 변환하는 함수
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function useFriendQuery(endpoint, query = "") {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (!endpoint) return undefined;
    let active = true;

    async function load() {
      try {
        const data = await get(endpoint, Object.fromEntries(new URLSearchParams(query)));
        if (data?.isSuccess === false || data?.result == null) {
          throw new Error("친구 상세 조회 실패");
        }
        if (active) setResponse({ query, result: data.result });
      } catch {
        if (active) setResponse({ query, error: true });
      }
    }

    setResponse(null);
    load();
    return () => { active = false; };
  }, [endpoint, query]);

  return response?.query === query ? response : null;
}

function FriendDetailPage() {
  const { id } = useParams();
  return <FriendDetail key={id} id={id} />;
}

function FriendDetail({ id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const passedFriend = location.state?.friend;
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(selectedDate);
  const dateKey = toDateKey(selectedDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const isRealFriend = /^\d+$/.test(id);
  const profile = useFriendQuery(isRealFriend ? config.FOLLOW.PROFILE(id) : null);
  const calendar = useFriendQuery(isRealFriend ? config.FOLLOW.CALENDAR(id) : null, `year=${year}&month=${month}`);
  const dailyTodos = useFriendQuery(isRealFriend ? config.FOLLOW.TODOS(id) : null, `date=${dateKey}`);

  const friend = profile?.result
    ? {
        name: profile.result.username?.split("#")[0],
        bio: profile.result.introduction,
        profileImageUrl: profile.result.profileImageUrl,
      }
    : String(passedFriend?.id) === id ? passedFriend : null;

  const remainingByDate = Object.fromEntries(
    (calendar?.result?.days ?? [])
      .filter(({ hasTodo }) => hasTodo)
      .map(({ date, remaining }) => [date, remaining])
  );
  const todos = (dailyTodos?.result ?? []).map((todo) => ({
    id: todo.todoId,
    text: todo.description,
    category: todo.categoryName,
    completed: todo.completed ?? todo.isCompleted,
  }));

  return (
    <div className="friend-detail-page">
      <div className="friend-detail-page__inner">
        <div className="friend-detail-page__top">
          <button
            type="button"
            className="friend-detail-page__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>

          {/* 친구 프로필 영역 */}
          <div className="friend-detail-page__profile">
            <div className="friend-detail-page__avatar" aria-hidden="true">
              {friend?.profileImageUrl ? (
                <img
                  src={friend.profileImageUrl}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserIcon />
              )}
            </div>

            <div className="friend-detail-page__profile-info">
              <div className="friend-detail-page__name-line">
                {/* 친구 이름 출력 */}
                <span className="friend-detail-page__name">
                  {friend?.name || ((!isRealFriend || profile?.error) ? "친구 정보를 불러오지 못했습니다." : "친구 정보를 불러오는 중입니다.")}
                </span>
              </div>
              <div className="friend-detail-page__bio">
                {friend && (friend.bio || "한 줄 소개")}
              </div>
            </div>
          </div>

        </div>

        {/* 달력과 todo 목록을 나누어 보여줌 */}
        <div className="friend-detail-page__grid">
          <div className="friend-detail-page__calendar">
            <FriendCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onMonthChange={setViewDate}
              remainingByDate={remainingByDate}
            />
            {calendar?.error && <p role="status">캘린더를 불러오지 못했습니다.</p>}
          </div>

          <div className="friend-detail-page__todo">
            <FriendTodo
              title="To do List"
              todos={todos}
              status={dailyTodos?.error ? "error" : dailyTodos || !isRealFriend ? "ready" : "loading"}
              categories={Categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <path
        d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default FriendDetailPage;