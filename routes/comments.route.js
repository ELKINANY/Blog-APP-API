const router = require('express').Router();

const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require('../controllers/comments.controller');

const {
  createCommentValidator,
  updateCommentValidator,
} = require('../utils/validators/commentsValidator');

const { protect } = require('../middlewares/auth.middleware');

router.post(
  '/',
  protect,
  createCommentValidator,
  createComment
);
router.get(
  '/post/:postId',
  checkPostIdValidator,
  getCommentsByPost
);
router.put(
  '/:id',
  protect,
  updateCommentValidator,
  updateComment
);
router.delete(
  '/:id',
  protect,
  deleteComment
);

module.exports = router;