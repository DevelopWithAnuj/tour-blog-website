import mongoose from 'mongoose';
import { BlogPost } from '../models/Blog.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';

const WRITABLE = [
  'title',
  'category',
  'destination',
  'excerpt',
  'content',
  'coverImage',
  'images',
];
const EDITABLE = ['draft', 'pending', 'rejected'];
const MAX_OPEN_SUBMISSIONS = 5;

const pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]])
  );

const findOwnPost = async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Story not found');
  }

  const post = await BlogPost.findOne({
    _id: req.params.id,
    author: req.user._id,
  });
  if (!post) throw new ApiError(HttpStatus.NOT_FOUND, 'Story not found');
  return post;
};

const respond = (res, status, post, message) =>
  res.status(status).json(new ApiResponse(status, { post }, message));

const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({ author: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(100)
    .select('-content');
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, { posts }, 'Your stories fetched'));
});

const getMyPost = asyncHandler(async (req, res) => {
  respond(res, HttpStatus.OK, await findOwnPost(req), 'Story fetched');
});

const createMyPost = asyncHandler(async (req, res) => {
  const open = await BlogPost.countDocuments({
    author: req.user._id,
    status: { $in: ['draft', 'pending'] },
  });
  if (open >= MAX_OPEN_SUBMISSIONS) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      `You can have up to ${MAX_OPEN_SUBMISSIONS} drafts or stories in review at once.`
    );
  }
  const status = req.body.status === 'draft' ? 'draft' : 'pending';
  const post = await BlogPost.create({
    ...pick(req.body, WRITABLE),
    author: req.user._id,
    status,
  });
  respond(
    res,
    HttpStatus.CREATED,
    post,
    status === 'pending' ? 'Story submitted for review' : 'Draft saved'
  );
});

const updateMyPost = asyncHandler(async (req, res) => {
  const post = await findOwnPost(req);
  if (!EDITABLE.includes(post.status)) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Published stories cannot be edited. Contact support to request a change.'
    );
  }

  post.set(pick(req.body, WRITABLE));
  post.status = req.body.status ?? post.status;
  await post.save();
  respond(
    res,
    HttpStatus.OK,
    post,
    post.status === 'pending' ? 'Story submitted for review' : 'Draft saved'
  );
});

const submitMyPost = asyncHandler(async (req, res) => {
  const post = await findOwnPost(req);
  if (!['draft', 'rejected'].includes(post.status)) {
    throw new ApiError(HttpStatus.CONFLICT, 'This story cannot be submitted');
  }
  if (post.content.length < 100) {
    throw new ApiError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Write at least 100 characters before submitting for review'
    );
  }
  post.status = 'pending';
  await post.save();
  respond(res, HttpStatus.OK, post, 'Story submitted for review');
});

const deleteMyPost = asyncHandler(async (req, res) => {
  const post = await findOwnPost(req);
  if (post.status === 'published') {
    throw new ApiError(
      HttpStatus.CONFLICT,
      'Published stories cannot be deleted here. Contact support.'
    );
  }
  await post.deleteOne();
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'Story deleted'));
});

export {getMyPost, getMyPosts, createMyPost, updateMyPost, submitMyPost, deleteMyPost}
