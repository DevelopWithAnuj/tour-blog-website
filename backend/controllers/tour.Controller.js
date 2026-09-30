import { asyncHandler } from '../utils/async-handler.js';
import { Tour, TOUR_CATEGORIES } from '../models/Tour.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../utils/constants.js';
import mongoose from 'mongoose';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
};

const getTours = asyncHandler(async (req, res) => {
  const { category, q, minPrice, maxPrice, sort = 'newest' } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);

  const filter = { isActive: true };

  // String blocks operator objects like ?category[$ne]=x
  if (category) filter.category = String(category);

  if (q) {
    const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
    filter.$or = [{ title: rx }, { destination: rx }, { location: rx }];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [tours, total] = await Promise.all([
    Tour.find(filter)
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-itinerary -inclusions -exclusions -faq -availableDates'),
    Tour.countDocuments(filter),
  ]);

  res.status(HttpStatus.OK).json(
  new ApiResponse(
    HttpStatus.OK,
    { tours, total, page, pages: Math.ceil(total / limit) },
    'Tours fetched successfully'
  ))
});

const getTourCategories = asyncHandler(async (req, res) => {
  const counts = await Tour.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]))
  const categories = TOUR_CATEGORIES.map((name) => ({
    name, count : countMap[name] || 0,
  }))

  res
  .status(HttpStatus.OK)
  .json(new ApiResponse(HttpStatus.OK, {categories}, 'Categories fetched'))
});

const getTourById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Tour not found');
  }

  const tour = await Tour.findOne({ _id: req.params.id, isActive: true });
  if (!tour) throw new ApiError(HttpStatus.NOT_FOUND, 'Tour not found');

  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, { tour }, 'Tour fetched'));
});

export {
  getTours,
  getTourCategories,
  getTourById
}
