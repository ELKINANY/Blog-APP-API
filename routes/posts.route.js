const router = require("express").Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/posts.controller");
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
  .post(createPostValidation, protect, allowedTo("admin", "user"), createPost)
  .get(protect, getAllPosts);

router
  .route("/:id")
  .get(protect, getPostById)
  .put(
    protect,
    allowedTo("admin", "user"),
    updatePostValidation,
    ownership("posts"),
    updatePost
  )
  .delete(protect, ownership("posts"), deletePost);

module.exports = router;
