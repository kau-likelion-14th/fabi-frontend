const express = require("express");

module.exports = function (app) {
  if (process.env.REACT_APP_MOCK_FOLLOW !== "true") return;

  const testUser = {
    userId: 1,
    userName: "테스트#0001",
    introduction: "API 테스트용 사용자",
    profileImageUrl: null,
  };
  let following = false;
  const router = express.Router();

  router.get("/", (req, res) => {
    const page = Number(req.query.page || 0);
    const size = Number(req.query.size || 10);
    const users = following ? [] : [testUser];
    const totalPages = Math.ceil(users.length / size);
    res.json({
      isSuccess: true,
      result: {
        content: users.slice(page * size, (page + 1) * size),
        number: page,
        totalPages,
        last: page + 1 >= totalPages,
      },
    });
  });

  router.get("/followings", (req, res) => {
    res.json({ isSuccess: true, result: following ? [testUser] : [] });
  });

  router.get("/search", (req, res) => {
    const nickname = req.query.nickname || "";
    const page = Number(req.query.page || 0);
    const size = Number(req.query.size || 10);
    const users = !following && testUser.userName.includes(nickname) ? [testUser] : [];
    const totalPages = Math.ceil(users.length / size);
    res.json({
      isSuccess: true,
      result: {
        content: users.slice(page * size, (page + 1) * size),
        number: page,
        totalPages,
        last: page + 1 >= totalPages,
      },
    });
  });

  router.post("/", express.json(), (req, res) => {
    if (req.body.toUserId !== testUser.userId) {
      return res.status(404).json({ isSuccess: false, result: null });
    }
    following = true;
    res.status(201).json({ isSuccess: true, result: testUser });
  });

  router.delete("/", express.json(), (req, res) => {
    if (req.body.toUserId !== testUser.userId) {
      return res.status(404).json({ isSuccess: false, result: null });
    }
    following = false;
    res.json({ isSuccess: true, result: null });
  });

  app.use("/api/follow", router);
};
