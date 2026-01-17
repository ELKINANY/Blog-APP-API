const router = require("express").Router();
const {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getMe,
} = require("../controllers/auth.controller");

const { requireAuth } = require("../middlewares/requireAuth.middleware")

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyResetCodeValidation,
  resetPasswordValidation,
} = require("../utils/validators/auth.validator");

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/verify-reset-code", verifyResetCodeValidation, verifyResetCode);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.get("/me", requireAuth, getMe);

module.exports = router;
