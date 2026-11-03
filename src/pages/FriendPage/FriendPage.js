import React, { useEffect, useRef, useState } from "react";
import api from "../../Api";
import config from "../../Config";
import FriendList from "./FriendList";
import FriendSearch from "./FriendSearch";
import FriendUnfollowModal from "./FriendUnfollowModal";
import { toFriendModel } from "./friendModel";
import "../../styles/FriendPage.css";
import "../../styles/FriendList.css";

function FriendPage() {
  const [followList, setFollowList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const removingRef = useRef(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const followingRef = useRef(false);
  const [followingId, setFollowingId] = useState(null);
  const [followError, setFollowError] = useState("");
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const loadFollowings = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.get(config.FOLLOW.FOLLOWINGS, {
          signal: controller.signal,
        });
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
  }, []);

  const handleFollow = async (user) => {
    if (
      !user ||
      loading ||
      loadError ||
      isModalOpen ||
      followingRef.current ||
      removingRef.current ||
      followList.some((friend) => friend.id === user.id)
    ) {
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
    setSelectedFriend(friend);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedFriend || removingRef.current || followingRef.current) return;
    removingRef.current = true;
    setIsRemoving(true);
    try {
      const { data } = await api.delete(config.FOLLOW.DELETE, {
        data: { toUserId: selectedFriend.userId },
      });
      if (data?.isSuccess === false) {
        return;
      }
      setFollowList((prev) => prev.filter((friend) => friend.id !== selectedFriend.id));
      setIsModalOpen(false);
      setSelectedFriend(null);
      setSearchRefreshKey((value) => value + 1);
    } catch {
      return;
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
            friends={followList}
            onClickRemove={handleClickRemove}
            emptyText="팔로우하는 친구가 없습니다."
          />
          <FriendSearch
            onFollow={handleFollow}
            followingList={followList}
            followingId={followingId}
            followError={followError}
            followDisabled={loading || Boolean(loadError) || isModalOpen || isRemoving}
            refreshKey={searchRefreshKey}
          />
        </div>
      </div>
      <FriendUnfollowModal
        isOpen={isModalOpen}
        friend={selectedFriend}
        onConfirm={handleConfirmRemove}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default FriendPage;
