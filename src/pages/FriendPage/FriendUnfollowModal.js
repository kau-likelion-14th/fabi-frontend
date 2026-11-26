import React, { useEffect } from "react";
import "../../styles/FriendUnfollowModal.css";

// 친구를 팔로우 목록에서 삭제할지 확인하는 모달
function FriendUnfollowModal({ isOpen, friend, onConfirm, onClose, isRemoving, error }) {
  // 모달이 열렸을 때 ESC 키로 닫을 수 있도록 이벤트 설정
  useEffect(() => {
    // 모달이 닫혀 있으면 이벤트를 등록할 필요가 없음
    if (!isOpen) return;

    // 키보드에서 ESC를 누르면 onClose 함수를 실행해서 모달을 닫음
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    // document에 keydown 이벤트 등록
    document.addEventListener("keydown", handleKeyDown);
    // 모달이 닫히거나 컴포넌트가 사라질 때 이벤트를 제거함
    // 이벤트를 제거하지 않으면 모달이 닫힌 뒤에도 ESC 이벤트가 남아 있을 수 있음
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // isOpen이 false면 모달을 화면에 렌더링하지 않음
  if (!isOpen) return null;

  // friend 값이 없을 때 에러가 나지 않도록 빈 문자열로 처리
  const displayName = friend?.name ?? "";
  const displayTag = friend?.tag ? `#${friend.tag}` : "";

  // 모달 바깥의 어두운 배경을 클릭했을 때 모달을 닫는 함수
  const handleOverlayClick = (e) => {
    // e.target과 e.currentTarget이 같을 때만 배경을 클릭한 것
    // 모달 내부를 클릭했을 때는 닫히지 않도록 구분함
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="friend-unfollow-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="friend-unfollow-modal__content"
        role="dialog"
        aria-modal="true"
      >
        <p className="friend-unfollow-modal__text">
          <span className="friend-unfollow-modal__name">{displayName}</span>{" "}
          <span className="friend-unfollow-modal__tag">{displayTag}</span>
          님을 팔로우 목록에서
          <br />
          삭제하시겠습니까?
        </p>

        {error && <p role="alert">{error}</p>}

        <div className="friend-unfollow-modal__actions">
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--yes"
            // 예 버튼을 누르면 부모 컴포넌트에서 넘겨준 삭제 확정 함수 실행
            onClick={onConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? "처리 중..." : "예"}
          </button>

          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--no"
            // 아니오 버튼을 누르면 모달만 닫음
            onClick={onClose}
            disabled={isRemoving}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendUnfollowModal;
