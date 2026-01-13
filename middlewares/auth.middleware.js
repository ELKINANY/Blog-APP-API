const jwt = require("jsonwebtoken");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return next(new apiError("User not found", 404));
      }
      req.user = user;
      next();
    } else {
      return next(new apiError("Not authorized", 401));
    }
  } catch (error) {
    return next(new apiError("Not authorized", 401));
  }
});

const allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new apiError("You are not allowed to access this route", 403));
    }
    next();
  };
};

const ownership = (modelName) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const item = await prisma[modelName].findUnique({ where: { id } });
    if (!item) {
      return next(new apiError(`${modelName} not found`, 404));
    }
    if (item.author_id !== req.user.id && req.user.role !== "admin") {
      return next(new apiError("You are not allowed to modify this item", 403));
    }
    next();
  });
};


module.exports = {
  protect,
  allowedTo,
  ownership,
};
