import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export const BLOG_CATEGORIES = [
  'travel-guide',
  'itinerary',
  'food',
  'culture',
  'budget-travel',
  'personal-experience',
];

export const BLOG_STATUS = ['draft', 'published'];

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 150 },
    slug: { type: String, unique: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: BLOG_CATEGORIES,
      required: true,
      index: true,
    },
    destination: { type: String, trim: true, default: '' },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    status: { type: String, enum: BLOG_STATUS, default: 'draft', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

blogPostSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    // Random suffix keeps slugs unique without a lookup loop.
    this.slug = `${slugify(this.title)}-${crypto.randomBytes(3).toString('hex')}`;
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

blogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
