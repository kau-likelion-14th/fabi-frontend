import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../../Api";
import config from "../../Config";
import { toFriendModel } from "./friendModel";
import "../../styles/FriendSearch.css";
import searchIcon from "../../assets/icon/search.png";


// 친구를 검색하고 팔로우할 수 있는 컴포넌트
function FriendSearch({
  title = "팔로우 요청",
  placeholder = "이름/태그로 검색",
  onFollow,
  followingList = [],
  followDisabled = false,
}) {
  const navigate = useNavigate();
  // 검색창에 입력한 값을 저장하는 state
  // 사용자가 input에 글자를 입력할 때마다 query 값이 바뀜
  const [query, setQuery] = useState("");

  // 이미 팔로우한 친구인지 확인하기 위해 followingList에서 id만 뽑아서 Set으로 만듦
  // followingList가 바뀔 때만 다시 계산되도록 useMemo를 사용함
  const followingIdSet = useMemo(() => {
    return new Set(followingList.map((x) => x.id));
  }, [followingList]);

  const [search, setSearch] = useState(null);
  const nickname = query.trim();
  const currentSearch = search?.nickname === nickname ? search : null;
  const results = currentSearch?.users ?? [];

  useEffect(() => {
    if (!nickname) return undefined;
    let active = true;

    async function loadResults() {
      try {
        const data = await get(config.FOLLOW.SEARCH, { nickname });
        if (data?.isSuccess === false || !Array.isArray(data?.result?.content)) {
          throw new Error();
        }
        if (active) setSearch({ nickname, users: data.result.content.map(toFriendModel) });
      } catch {
        if (active) setSearch({ nickname, error: true });
      }
    }

    setSearch(null);
    const timer = setTimeout(loadResults, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [nickname]);

  // 검색 결과에서 친구 정보를 클릭했을 때 상세 페이지로 이동
  // 선택한 친구 정보를 state로 같이 넘겨 상세 페이지에서 사용할 수 있게 함
  const goFriendDetail = (friend) => {
    navigate(`/friends/${friend.id}`, { state: { friend } });
  };

  return (
    <section className="friend-search">
      <h2 className="friend-search__title">{title}</h2>

      <div className="friend-search__input-box">
        <span className="friend-search__icon" aria-hidden="true">
          <img
            src={searchIcon}
            alt="검색"
            className="friend-search__icon-img"
          />
        </span>

        <input
          className="friend-search__input"
          value={query}
          // input 값이 바뀔 때마다 query state를 새 값으로 변경
          // state가 바뀌면 컴포넌트가 다시 렌더링되고 검색 결과도 다시 계산됨
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {!nickname ? null : !currentSearch ? (
        <div className="friend-search__empty" role="status">검색 중입니다.</div>
      ) : currentSearch.error ? (
        <div className="friend-search__empty" role="status">검색 결과를 불러오지 못했습니다.</div>
      ) : results.length === 0 ? (
        <div className="friend-search__empty">검색 결과가 없습니다.</div>
      ) : (
        <ul className="friend-search__list">
          {/* 검색 결과 배열을 map으로 돌면서 사용자 목록을 화면에 출력 */}
          {results.map((user) => {
            // 현재 검색된 유저가 이미 팔로우 중인지 확인
            // 팔로우 중이면 버튼을 비활성화하고 "팔로잉"으로 표시
            const isFollowing = followingIdSet.has(user.id);

            return (
              <li key={user.id} className="friend-search__item">
                <div
                  className="friend-search__left"
                  role="button"
                  tabIndex={0}
                  onClick={() => goFriendDetail(user)}
                  onKeyDown={(e) => {
                    // Enter나 Space를 눌러도 이동되게 처리
                    if (e.key === "Enter" || e.key === " ") goFriendDetail(user);
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt=""
                        className="friend-avatar__img"
                      />
                    ) : (
                      <UserIcon />
                    )}
                  </div>

                  <div className="friend-info">
                    <div className="friend-info__top">
                      <span className="friend-info__name">{user.name}</span>
                      <span className="friend-info__tag">#{user.tag}</span>
                    </div>

                    <div className="friend-info__bio">
                      {user.bio || "한 줄 소개"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`friend-follow-btn ${
                    isFollowing ? "is-disabled" : ""
                  }`}
                  onClick={(e) => {
                    // 팔로우 버튼 클릭 시 사용자 정보 클릭 이벤트까지 같이 실행되지 않도록 막음
                    e.stopPropagation();
                    // 부모 컴포넌트에서 전달받은 팔로우 함수를 실행
                    // 선택한 user 객체를 넘겨서 부모 쪽에서 팔로우 목록에 추가할 수 있음
                    onFollow?.(user);
                  }}
                  disabled={isFollowing || followDisabled}
                >
                  {/* 이미 팔로우 중이면 팔로잉, 아니면 팔로우 표시 */}
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// 프로필 이미지가 없을 때 보여줄 기본 아이콘
function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export default FriendSearch;