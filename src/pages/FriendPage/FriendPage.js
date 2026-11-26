import React, { useEffect, useRef, useState } from "react";
import api from "../../Api";
import config from "../../Config";
import FriendList from "./FriendList";
import FriendSearch from "./FriendSearch";
import FriendUnfollowModal from "./FriendUnfollowModal";
import { toFriendModel } from "./friendModel";
import "../../styles/FriendPage.css";
import "../../styles/FriendList.css";

const initialSampleFriends = [
  { id: "sample-1", name: "나나", tag: "1234", bio: "안녕하세요! 저는 나나입니다." },
  { id: "sample-2", name: "얀", tag: "2342", bio: "^^" },
  { id: "sample-3", name: "지말", tag: "1214", bio: "ㅎㅎ" },
  { id: "sample-4", name: "코다", tag: "1223", bio: ";ㅁ;" },
  { id: "sample-5", name: "딜런", tag: "1777", bio: "." },
];

const testUser = {
  id: "sample-test",
  name: "팔로우 테스트",
  tag: "0001",
  bio: "팔로우와 언팔로우를 연습할 수 있는 계정입니다.",
};
const sampleUsers = [...initialSampleFriends, testUser];

function FriendPage() {
  const [sampleFriends, setSampleFriends] = useState(initialSampleFriends);
  const [followList, setFollowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const removingRef = useRef(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const followingRef = useRef(false);
  const [followingId, setFollowingId] = useState(null);
  const [followError, setFollowError] = useState("");
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);
  const displayedFriends = [...sampleFriends, ...followList];

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const loadFollowings = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const { data } = await api.get(config.FOLLOW.FOLLOWINGS, {
          signal: controller.signal,
        });
        if (data?.isSuccess === false || !Array.isArray(data?.result)) {
          throw new Error("팔로잉 목록 응답을 확인해 주세요.");
        }
        const friends = data.result.map(toFriendModel);
        if (active) setFollowList(friends);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadFollowings();
    return () => {
      active = false;
      controller.abort();
    };
  }, [loadAttempt]);

  const handleFollow = async (user) => {
    if (
      !user ||
      isModalOpen ||
      followingRef.current ||
      removingRef.current
    ) {
      return;
    }

    if (user.userId == null) {
      setSampleFriends((friends) =>
        friends.some((friend) => friend.id === user.id) ? friends : [...friends, user]
      );
      return;
    }

    if (loading || loadError || followList.some((friend) => friend.id === user.id)) {
      return;
    }

    followingRef.current = true;
    setFollowingId(user.id);
    setFollowError("");

    try {
      const response = await api.post(config.FOLLOW.CREATE, {
        toUserId: user.userId,
      });

      const data = response.data;

      if (
        data?.isSuccess === false ||
        data?.result?.userId == null ||
        String(data.result.userId) !== user.id
      ) {
        throw new Error("팔로우 응답을 확인해 주세요.");
      }

      const newFriend = toFriendModel(data.result);

      setFollowList((prev) => {
        if (prev.some((friend) => friend.id === newFriend.id)) return prev;
        return [...prev, newFriend];
      });

      // 팔로우 가능한 검색 결과도 서버에서 다시 확인합니다.
      setSearchRefreshKey((value) => value + 1);
    } catch {
      setFollowError("팔로우에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      followingRef.current = false;
      setFollowingId(null);
    }
  };

  const handleClickRemove = (friend) => {
    if (removingRef.current || followingRef.current) return;
    setRemoveError("");
    setSelectedFriend(friend);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedFriend || removingRef.current || followingRef.current) return;

    if (selectedFriend.userId == null) {
      setSampleFriends((friends) => friends.filter((friend) => friend.id !== selectedFriend.id));
      handleCloseModal();
      return;
    }

    removingRef.current = true;
    setIsRemoving(true);
    setRemoveError("");
    try {
      const { data } = await api.delete(config.FOLLOW.DELETE, {
        data: { toUserId: selectedFriend.userId },
      });
      if (data?.isSuccess === false) {
        throw new Error("언팔로우 응답을 확인해 주세요.");
      }
      setFollowList((prev) => prev.filter((friend) => friend.id !== selectedFriend.id));
      setIsModalOpen(false);
      setSelectedFriend(null);
      setSearchRefreshKey((value) => value + 1);
    } catch {
      setRemoveError("언팔로우에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      removingRef.current = false;
      setIsRemoving(false);
    }
  };

  const handleCloseModal = () => {
    if (removingRef.current) return;
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  return (
    <div className="friend-page">
      <div className="friend-page__inner">
        <div className="friend-page__grid">
          <FriendList
            friends={displayedFriends}
            onClickRemove={handleClickRemove}
            status={
              loading ? (
                <span role="status">팔로잉 목록을 불러오는 중...</span>
              ) : loadError ? (
                <>
                  <span role="alert">팔로잉 목록을 불러오지 못했습니다.</span>{" "}
                  <button type="button" onClick={() => setLoadAttempt((value) => value + 1)}>
                    다시 시도
                  </button>
                </>
              ) : null
            }
          />
          <FriendSearch
            onFollow={handleFollow}
            followingList={displayedFriends}
            sampleUsers={sampleUsers}
            testUser={testUser}
            followingId={followingId}
            followError={followError}
            followDisabled={isModalOpen || isRemoving}
            apiFollowDisabled={loading || loadError}
            refreshKey={searchRefreshKey}
          />
        </div>
      </div>
      <FriendUnfollowModal
        isOpen={isModalOpen}
        friend={selectedFriend}
        onConfirm={handleConfirmRemove}
        onClose={handleCloseModal}
        isRemoving={isRemoving}
        error={removeError}
      />
    </div>
  );
}

export default FriendPage;
