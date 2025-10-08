const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, categories } = req.body;
  if (categories && categories.length > 0) {
    const foundCategories = await prisma.categories.findMany({
      where: { id: { in: categories } },
    });
    if (foundCategories.length !== categories.length) {
      return next(new apiError("One or more categories not found", 404));
    }
  }
  const newPost = await prisma.posts.create({
    data: {
      title,
      content,
      author_id: req.user.id,
      post_categories: categories?.length
  ? {
      create: categories.map((id) => ({ category_id: id })),
    }
  : undefined,
    },
    include: {
      post_categories: {
        include: { categories: true },
      },
    },
  });
  res.status(201).json(newPost);
});

const getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await prisma.posts.findMany({
    include: {
      post_categories: {
        include: { categories: true },
      },
    },
  });
  res.status(200).json(posts);
});

const getPostById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await prisma.posts.findUnique({
    where: { id },
    include: {
      post_categories: {
        include: { categories: true },
      },
    },
  });

  if (!post) return next(new apiError("Post not found", 404));

  res.status(200).json(post);
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, categories } = req.body;

  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return next(new apiError("Post not found", 404));

  const updatedPost = await prisma.posts.update({
    where: { id },
    data: {
      title,
      content,
      post_categories: categories
        ? {
            deleteMany: {},
            create: categories.map((categoryId) => ({
              category_id: categoryId,
            })),
          }
        : undefined,
    },
    include: {
      post_categories: {
        include: { categories: true },
      },
    },
  });
  res.status(200).json(updatedPost);
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return next(new apiError("Post not found", 404));

  await prisma.posts.delete({ where: { id } });

  res.status(200).json({ message: "Post deleted successfully" });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
