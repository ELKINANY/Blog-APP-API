const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const slugify = require("../utils/slugify");
const {
  uploadToCloudinary,
  removeFromCloudinary,
  getPublicIdFromUrl,
} = require("../utils/cloudinary");
const fs = require("fs");

const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, categories, excerpt, status } = req.body;
  let featured_image = null;

  if (categories && categories.length > 0) {
    const categoriesArray = Array.isArray(categories)
      ? categories
      : [categories];
    const foundCategories = await prisma.categories.findMany({
      where: { id: { in: categoriesArray } },
    });
    if (foundCategories.length !== categoriesArray.length) {
      return next(new apiError("One or more categories not found", 404));
    }
  }

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.path, "posts");
    featured_image = uploadResult.secure_url;
    // Remove local file
    fs.unlinkSync(req.file.path);
  }

  const generatedSlug = `${slugify(title)}-${Date.now()}`;

  const newPost = await prisma.posts.create({
    data: {
      title,
      content,
      excerpt,
      status: status || "draft",
      slug: generatedSlug,
      featured_image,
      author_id: req.user.id,
      post_categories: categories?.length
        ? {
            create: (Array.isArray(categories) ? categories : [categories]).map(
              (id) => ({ category_id: id })
            ),
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
      users: {
        select: { name: true, avatar: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
  res.status(200).json(posts);
});

const getPostById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Increment views and fetch post
  const post = await prisma.posts.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
    include: {
      post_categories: {
        include: { categories: true },
      },
      users: {
        select: { name: true, avatar: true },
      },
    },
  });

  if (!post) return next(new apiError("Post not found", 404));

  res.status(200).json(post);
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, content, categories, excerpt, status } = req.body;

  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return next(new apiError("Post not found", 404));

  let featured_image = post.featured_image;

  if (req.file) {
    // Delete old image if it exists
    if (post.featured_image) {
      const publicId = getPublicIdFromUrl(post.featured_image);
      if (publicId) await removeFromCloudinary(publicId);
    }

    const uploadResult = await uploadToCloudinary(req.file.path, "posts");
    featured_image = uploadResult.secure_url;
    fs.unlinkSync(req.file.path);
  }

  const updatedPost = await prisma.posts.update({
    where: { id },
    data: {
      title,
      content,
      excerpt,
      status,
      slug: title ? `${slugify(title)}-${Date.now()}` : undefined,
      featured_image,
      post_categories: categories
        ? {
            deleteMany: {},
            create: (Array.isArray(categories) ? categories : [categories]).map(
              (categoryId) => ({
                category_id: categoryId,
              })
            ),
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

const likePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return next(new apiError("Post not found", 404));

  const updatedPost = await prisma.posts.update({
    where: { id },
    data: {
      likes: { increment: 1 },
    },
  });

  res.status(200).json({ likes: updatedPost.likes });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return next(new apiError("Post not found", 404));

  // Delete image from Cloudinary
  if (post.featured_image) {
    const publicId = getPublicIdFromUrl(post.featured_image);
    if (publicId) await removeFromCloudinary(publicId);
  }

  await prisma.posts.delete({ where: { id } });

  res.status(200).json({ message: "Post deleted successfully" });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
};
