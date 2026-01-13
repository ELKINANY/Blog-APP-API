const router = require("express").Router();
const {
  updateProfile,
  uploadAvatar,
} = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
