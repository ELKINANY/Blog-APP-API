const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiError = require("../utils/apiError");
const sendEmail = require("../utils/sendMail");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

/**
 * Register a new user
 * @route POST /api/auth/register
 * @Method POST
 * @access public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });
  if (existingUser) {
    return next(new apiError("Email already in use", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  await sendEmail({
    to: newUser.email,
    subject: "Welcome to Our Service",
    text: `Hello ${newUser.name}, \n\nThank you for registering at our service! We're excited to have you on board.\n\nBest regards,\nThe Team`,
  });
  res.status(201).json({ data: newUser, token });
});

/**
 * Login a user
 * @route POST /api/auth/login
 * @Method POST
 * @access public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findUnique({
    where: { email },
  });
  if (!user) {
    return next(new apiError("Invalid credentials", 401));
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new apiError("Invalid credentials", 401));
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ data: user, token });
});

/**
 * Forgot Password
 * @route POST /api/auth/forgot-password
 * @Method POST
 * @access public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return next(new apiError("There is no user with that email", 404));
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  const resetCodeExpiry = Date.now() + 10 * 60 * 1000;
  await prisma.users.update({
    where: { email },
    data: {
      passwordresetcode: hashedResetCode,
      passwordresetexpires: new Date(resetCodeExpiry),
      passwordresetverified: false,
    },
  });
  await sendEmail({
    to: user.email,
    subject: "Password Reset",
    text: `Hello ${user.name}, \n\nYou requested a password reset. Use the following code to reset your password: ${resetCode}\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Team`,
  });
  res.status(200).json({ message: "Reset code sent to email" });
});


/**
 * Verify Reset Code
 * @route POST /api/auth/verify-reset-code
 * @Method POST
 * @access public
 */
const verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return next(new apiError("There is no user with that email", 404));
  }
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  if (user.passwordresetcode !== hashedResetCode) {
    return next(new apiError("Invalid reset code", 400));
  }
  if (user.passwordresetexpires < new Date()) {
    return next(new apiError("Reset code has expired", 400));
  }
  await prisma.users.update({
    where: { email },
    data: { passwordresetverified: true  },
  });
  res.status(200).json({ message: "Reset code verified" });
});

/**
 * Reset Password
 * @route POST /api/auth/reset-password
 * @Method POST
 * @access public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return next(new apiError("There is no user with that email", 404));
  }
  if (!user.passwordresetverified) {
    return next(new apiError("Reset code not verified", 400));
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { email },
    data: {
      password: hashedPassword,
      passwordresetcode: null,
      passwordresetexpires: null,
      passwordresetverified: false,
    },
  });
  res.status(200).json({ message: "Password has been reset" });
});

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
