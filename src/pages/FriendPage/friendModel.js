export function toFriendModel({ userId, userName, profileImageUrl, introduction }) {
  const [name, tag = ""] = (userName ?? "").split("#");
  return { id: String(userId), userId, name, tag, bio: introduction, profileImageUrl };
}
