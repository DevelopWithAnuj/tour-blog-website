import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { HttpStatus } from '../utils/constants.js';
import { BLOG_CATEGORIES, BlogPost } from '../models/Blog.models.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const AUTHOR_FIELDS = 'fullName username avatar.url';

const getPosts = asyncHandler(async (req, res) => {
  const { category, q } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 30);

  const filter = { status: 'published' };

  // String() blocks operator objects like ?category[$ne]=x
  if (category) filter.category = String(category);

  if (q) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    filter.$or = [{ title: rx }, { excerpt: rx }, { destination: rx }];
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content')
      .populate('author', AUTHOR_FIELDS),
    BlogPost.countDocuments(filter),
  ]);

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { posts, total, page, pages: Math.ceil(total / limit) },
        'Posts fetch succefully'
      )
    );
});

const getBlogCategories = asyncHandler(async (req, res) => {
  const counts = await BlogPost.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const categories = BLOG_CATEGORIES.map((name) => ({
    name,
    count: countMap[name] || 0,
  }));

  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {categories}, "Categories fetched"))
});

const getPostBySlug =asyncHandler(async(req,res) => {
    const post = await BlogPost.findOne({
        slug: String(req.params.slug),
        status: 'published',
    }).populate('author', AUTHOR_FIELDS)

    if(!post) throw new ApiError(HttpStatus.NOT_FOUND, 'Post not found')

    const related = await BlogPost.find({
        status: 'published',
        category:post.category,
        _id: {$ne: post._id},
    }).sort({publishedAt:-1}).limit(3).select('-content').populate('author', AUTHOR_FIELDS)

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {related, post}, 'Post fetched'));
})


export {getPosts, getBlogCategories, getPostBySlug}
