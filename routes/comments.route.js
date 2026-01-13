const router = require("express").Router();

const {
  createComment,
  getCommentsByPostId,
  deleteComment,
  updateComment,
} = require("../controllers/comments.controller");

const {
  createCommentValidator,
  updateCommentValidator,
} = require("../utils/validators/comments.validator");

const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, createCommentValidator, createComment);
router.get("/post/:postId", getCommentsByPostId);
router.put("/:id", protect, updateCommentValidator, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
