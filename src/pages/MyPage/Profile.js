import React, { useRef, useState, useEffect } from "react";
import { get, put, uploadProfile } from "../../Api";
import config from "../../Config";
import profilemusic from "../../assets/icon/search.png";

const profileImg = "https://via.placeholder.com/120";

const Profile = () => {
  const fileInputRef = useRef(null);

  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState(null);
  const [song, setSong] = useState("");

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

  const handleSave = async () => {
    if (isSaving || intro === null) return;
    setIsSaving(true);

    try {
      const response = await put(config.PROFILE.INTRO, { introduce: intro });
      if (!response?.isSuccess) throw new Error(response?.message);

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
        setIntro(result.introduction ?? "");
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
        <button type="button" className="profile-edit" onClick={handleSave} disabled={isSaving || intro === null}>
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
                value={`🎵 ${song}`}
                onChange={(e) => setSong(e.target.value.replace(/^🎵 ?/, ""))}
              />
            </div>
            <img
              src={profilemusic}
              alt="프로필 노래 수정 아이콘"
              className="profile-search-icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
