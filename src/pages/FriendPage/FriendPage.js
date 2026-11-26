import React from 'react';
import { useEffect, useState } from 'react';
import FriendList from './FriendList';
import FriendSearch from './FriendSearch';
import FriendUnfollowModal from './FriendUnfollowModal';
import { del, get, post } from '../../Api';
import config from '../../Config';
import { toFriendModel } from './friendModel';
import '../../styles/FriendPage.css';
import '../../styles/FriendList.css';

function FriendPage() {
    const [followList, setFollowList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);

    useEffect(() => {
        let active = true;

        async function loadFollowings() {
            try {
                const data = await get(config.FOLLOW.FOLLOWINGS);
                if (data?.isSuccess === false || !Array.isArray(data?.result)) throw new Error();
                if (active) setFollowList(data.result.map(toFriendModel));
            } catch {
                if (active) setError("팔로우 목록을 불러오지 못했습니다.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadFollowings();
        return () => { active = false; };
    }, []);

    const handleFollow = async (user) => {
        if (loading || saving || followList.some(({ id }) => id === user.id)) return;

        setSaving(true);
        setError("");
        try {
            const data = await post(config.FOLLOW.ROOT, { toUserId: user.userId });
            if (data?.isSuccess === false || !data?.result) throw new Error();
            setFollowList((prev) => [...prev, toFriendModel(data.result)]);
        } catch {
            setError("팔로우하지 못했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleClickRemove = (friend) => {
        if (saving) return;
        setSelectedFriend(friend);
        setIsModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedFriend || saving) return;

        setSaving(true);
        setError("");
        try {
            const data = await del(config.FOLLOW.ROOT, { data: { toUserId: selectedFriend.userId } });
            if (data?.isSuccess === false) throw new Error();
            setFollowList((prev) => prev.filter(({ id }) => id !== selectedFriend.id));
            handleCloseModal();
        } catch {
            setError("팔로우를 취소하지 못했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFriend(null);
    };

    return (
        <div className="friend-page">
            <div className="friend-page__inner">
                {error && <p role="status">{error}</p>}
                <div className="friend-page__grid">
                    <FriendList
                        friends={followList}
                        onClickRemove={handleClickRemove}
                        emptyText={loading ? "팔로우 목록을 불러오는 중입니다." : "팔로우하는 친구가 없습니다."}
                    />

                    <FriendSearch
                        onFollow={handleFollow}
                        followingList={followList}
                        followDisabled={loading || saving}
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