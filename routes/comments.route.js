const router = require("express").Router();

const {
  createComment,
  getCommentsByPostId,
  deleteComment,
  updateComment,
  approveComment,
} = require("../controllers/comments.controller");

const {
  createCommentValidator,
  updateCommentValidator,
} = require("../utils/validators/comments.validator");

const { protect, allowedTo } = require("../middlewares/auth.middleware");

router.post("/", protect, createCommentValidator, createComment);
router.get("/post/:postId", getCommentsByPostId);
router.put("/:id", protect, updateCommentValidator, updateComment);
router.put("/:id/approve", protect, allowedTo("admin"), approveComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
