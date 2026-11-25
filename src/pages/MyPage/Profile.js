import React, { useRef, useState, useEffect } from "react";
import { get, put, post, uploadProfile } from "../../Api";
import config from "../../Config";
import profilemusic from "../../assets/icon/search.png";

const profileImg = "https://via.placeholder.com/120";

const Profile = () => {
  const fileInputRef = useRef(null);

  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState(null);
  const [song, setSong] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClickEditIcon = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (isSaving || intro === null) return;
    setIsSaving(true);

    try {
      const response = await put(config.PROFILE.INTRO, { introduce: intro });
      if (!response?.isSuccess) throw new Error(response?.message);

      await handleSaveSong();

      if (selectedImageFile) {
        const imageResponse = await uploadProfile(config.PROFILE.IMAGE, {
          imageFile: selectedImageFile,
        });
        if (!imageResponse?.isSuccess) throw new Error(imageResponse?.message);

        setProfileImageUrl(imageResponse.result.profileImageUrl);
        setSelectedImageFile(null);
        setPreviewUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      alert("프로필이 저장되었습니다.");
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchProfileData = async () => {
      try {
        const response = await get(config.PROFILE.GET);
        const result = response?.result;

        if (!active || !result) return;

        setNickname(result.username ?? "");
        setIntro(result.introduction ?? result.introduce ?? "");
        setProfileImageUrl(result.profileImageUrl ?? null);

        const songResponse = await get(config.YOUTUBE.ME);
        if (!active) return;

        if (
          songResponse?.isSuccess === false ||
          !Array.isArray(songResponse?.result)
        ) {
          throw new Error("저장된 노래 조회 실패");
        }

        const songs = [...songResponse.result].sort(
          (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)
        );

        const latest = songs[0];
        setSong(latest ? `${latest.title} - ${latest.artist}` : "");
      } catch (error) {
        if (active) console.error("프로필 조회 실패:", error);
      }
    };

    fetchProfileData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayImageSrc = previewUrl || profileImageUrl || profileImg;

  const handleSave = async () => {
    try {
      const response = await get(config.PROFILE.IMAGE, { introduce: intro });
      console.log("저장될 프로필 이미지: ", response);

      if (selectedImageFile) {
        await uploadProfile(
          config.PROFILE.IMAGE,
          { imageFile: selectedImageFile },
          {imageField: "image"}
      );
    }

    const savedProfile = await get(config.PROFILE.GET);
    if (savedProfile?.isSuccess === false || !savedProfile?.result) {
      throw new Error(savedProfile?.message || "프로필 조회 실패");
    }
    setProfileImageUrl(savedProfile.result.profileImageUrl ?? null);

    setPreviewUrl(null);
    setSelectedImageFile(null);

      alert("프로필 이미지가 저장되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 저장 실패:", error);
      alert("프로필 이미지 저장에 실패했습니다.");
    }
  };

  const handleSearchSong = async () => {
    if (!song.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      const response = await get(config.YOUTUBE.SEARCH, { q: song.trim() });

      console.log("노래 검색 결과", response);

      const results = response?.result ?? [];

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("노래 검색 실패:", error);
      alert("노래 검색에 실패했습니다.");
    }
  };

  const handleSelectSong = (picked) => {
    setSelectedSong(picked);
    setSong(`${picked.title} - ${picked.artist}`);
    setShowSearchResults(false);
  };

  const handleSaveSong = async () => {
    if (!selectedSong) return;

    try {
      const response = await post(config.YOUTUBE.SAVE, {
        songId: selectedSong.videoId,
        title: selectedSong.title,
        artist: selectedSong.artist,
      });
      if (!response?.isSuccess) {
        throw new Error(response?.message || "노래 저장 실패");
      }

      console.log("노래 저장 성공:");

      setSelectedSong(null);
    } catch (error) {
      console.error("노래 저장 실패:", error);
      throw error;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-section">
        <div className="profile-image">
          <img src={displayImageSrc} alt="프로필 이미지" className="profile-img" />
          <button
            type="button"
            className="profile-img-edit"
            aria-label="프로필 이미지 수정"
            onClick={handleClickEditIcon}
            disabled={isSaving}
          >
            ✎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/*"
            disabled={isSaving}
          />
        </div>
        <div className="profile-name">{nickname}</div>
        <button type="button" className="profile-edit" onClick={handleSaveProfile} disabled={isSaving || intro === null}>
          프로필 저장
        </button>
      </div>
      <div className="profile-info">
        <div className="profile-details">
          <label htmlFor="profile-intro" className="profile-title">한 줄 소개</label>
          <div className="profile-content-box">
            <div className="profile-content">
              <input
                id="profile-intro"
                className="profile-content-input"
                value={intro ?? ""}
                onChange={(e) => setIntro(e.target.value)}
                disabled={intro === null || isSaving}
              />
            </div>
          </div>
        </div>
        <div className="profile-details">
          <label htmlFor="profile-song" className="profile-title">좋아하는 노래</label>
          <div className="profile-content-box">
            <div className="profile-content">
              <input
                id="profile-song"
                className="profile-content-input"
                disabled={isSaving}
                value={`${song}`}
                placeholder="좋아하는 노래를 검색해보세요."
                onChange={(e) => {
                  setSong(e.target.value);
                  setSelectedSong(null);
                  setShowSearchResults(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSong();
                  }
                }}
              />
            </div>
            <img
              src={profilemusic}
              alt="프로필 노래 수정 아이콘"
              className="profile-search-icon"
              onClick={handleSearchSong}
              style={{ cursor: "pointer" }}
            />
          </div>

          {showSearchResults && (
            <div className="song-search-results">
              {searchResults.length === 0 ? (
                <p>검색 결과가 없습니다.</p>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.videoId}
                    className="song-search-item"
                    onClick={() => { if (!isSaving) handleSelectSong(item); }}
                    >
                    {item.title} - {item.artist}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
