import { useNavigate } from "react-router-dom";
import deleteIcon from "../../assets/icon/delete.png";
import "../../styles/FriendList.css";


//팔로우 목록에 있는 친구들을 화면에 보여준다
//부모 컴포넌트에서 props로 전달 받음
function FriendList(
  {
    title = "팔로우 목록",
    friends = [],
    onClickRemove,
    emptyText = "팔로우하는 친구가 없습니다.",
    status,
  }
) {
  //페이지 이동을 위한 useNavigate 훅
  const navigate = useNavigate();

  // 친구 목록에서 친구를 클릭하면 해당 친구의 상세 페이지로 이동하는 함수
  // state로 friend 객체도 같이 넘겨서 상세 페이지에서 친구 정보를 사용할 수 있게 함
  const goFriendDetail = (friend) => {
    navigate(`/friends/${friend.id}`, { state: { friend } });
  };

  return (
    <section className="friend-list">
      {/* 부모에게 전달받은 제목을 출력 */}
      <h2 className="friend-list__title">{title}</h2>
      {status && <div className="friend-list__empty">{status}</div>}
      {/* friends 배열의 길이가 0이면 친구가 없는 상태이므로 안내 문구를 보여줌 */}
      {friends.length === 0 ? (
        !status && <div className="friend-list__empty">{emptyText}</div>
      ) : (
        // 친구가 있으면 ul 태그 안에 친구 목록을 출력
        <ul className="friend-list__items">
          {/* map을 사용해서 friends 배열 안의 친구 데이터를 하나씩 li로 변환 */}
          {friends.map((friend) => (
            <li key={friend.id} className="friend-list__item">
              {/* 이 영역을 클릭하면 해당 친구 상세 페이지로 이동함 */}
              <div
                className="friend-list__left"
                role="button"
                tabIndex={0}
                onClick={() => {
                  goFriendDetail(friend);
                }}
                >


                <div className="friend-avatar" aria-hidden="true">
                {/* 친구 프로필 이미지가 있으면 img 태그로 보여줌 없으면 아래 UserIcon을 사용 */}
                  {friend.profileImageUrl ? (
                    <img
                      className="friend-avatar__img"
                      src={friend.profileImageUrl}
                      alt="프로필 사진"
                      />
                  ) : (
                    <UserIcon/>
                  )}
                </div>


                <div className="friend-info">
                  <div className = "friend-info__top">
                    {/* 친구 이름과 태그를 화면에 표시 */}
                    <span className="friend-info__name">{friend.name}</span>
                    <span className="friend-info__tag">#{friend.tag}</span>
                  </div>

                  {/* 소개글이 있으면 소개글을 보여주고, 없으면 기본 문구를 보여줌 */}
                  {friend.bio ?(
                    <div className="friend-info__bio">{friend.bio}</div>
                  ) : (
                    <div className="friend-info__empty">소개글이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 친구 삭제 버튼 */}
              <button
                className="friend-remove-btn"
                type="button"
                aria-label="삭제"
                onClick={(e)=>{
                  // 삭제 버튼이 친구 정보 영역 안에 같이 있기 때문에 
                  // 클릭 이벤트가 부모 div까지 전달되면 상세 페이지로 이동할 수 있음
                  // 그래서 stopPropagation으로 이벤트 전달을 막음
                  e.stopPropagation();
                  // onClickRemove 함수가 존재하면 선택한 friend를 넘겨 실행
                  // 실제 삭제나 모달 열기 같은 처리는 부모 컴포넌트에서 진행됨
                  onClickRemove?.(friend);
                }}
                >
                  <img className="friend-remove-icon" src={deleteIcon} alt="삭제 아이콘" />
                </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// 프로필 이미지가 없는 친구에게 보여줄 기본 사람 모양 아이콘
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

export default FriendList;
