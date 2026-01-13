const router = require("express").Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/posts.controller");
const upload = require("../middlewares/upload.middleware");

const {
  createPostValidation,
  updatePostValidation,
} = require("../utils/validators/postValidator");

const {
  protect,
  allowedTo,
  ownership,
} = require("../middlewares/auth.middleware");

router
  .route("/")
  .post(
    protect,
    allowedTo("admin", "user"),
    upload.single("featured_image"),
    createPostValidation,
    createPost
  )
  .get(protect, getAllPosts);

router.patch("/:id/like", protect, likePost);

router
  .route("/:id")
  .get(protect, getPostById)
  .put(
    protect,
    allowedTo("admin", "user"),
    upload.single("featured_image"),
    updatePostValidation,
    ownership("posts"),
    updatePost
  )
  .delete(protect, ownership("posts"), deletePost);

module.exports = router;
