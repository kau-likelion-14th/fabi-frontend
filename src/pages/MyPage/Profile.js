import React from 'react';
import { useRef, useState } from "react";
import "../../styles/MyPage.css";
import profileImg from "../../assets/img/lion.jpg";

function Profile() {
  const fileInputRef = useRef(null);

  const handleClickEditIcon = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  };


  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileImageUrl] = useState("");

  const displayImageSrc = previewUrl || profileImageUrl || profileImg;

  const handleSaveProfile = () => {
    alert("프로필이 저장되었습니다!");
  };

  const handleSongSearch = () => {
    alert("노래 검색");
  };

  return (
    <section className="profile-section">
      <div className="profile-top">
        <div className="profile-image-box">
          <img src={displayImageSrc} alt="프로필" className="profile-img" />
          
          <button
            type="button"
            className="edit-profile-btn"
            onClick={handleClickEditIcon}
          >
            🖉
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden-file-input"
            onChange={handleFileChange}
          />
        </div>

        <div className="nickname">Likelion#1253</div>

        <button className="save-btn" onClick={handleSaveProfile}>
          프로필 저장
        </button>
      </div>

      <div className="profile-inform">
        <div className="profile-text">
        <div>한 줄 소개</div>
        <input
          type="text"
          placeholder="안녕하세요"
        />
        </div>

        <div>좋아하는 노래</div>
        <div className="profile-song">
          <span>🎵</span>
          <input
            type="text"
            placeholder="내꺼하자 - 인피니트"
          />
          <button
            type="button"
            className="search-btn"
            onClick={handleSongSearch}
          >
            🔍
          </button>
        </div>
      </div>
    </section>
  );
}

export default Profile;