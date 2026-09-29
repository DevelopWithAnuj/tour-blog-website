import mongoose, { Schema } from 'mongoose';

export const TOUR_CATEGORIES = [
  'adventure',
  'beach',
  'premium',
  'city',
  'nature',
  'culture',
];

const itineraryDaySchema = new Schema(
  { day: Number, title: String, description: String },
  { _id: false }
);
const tourSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true },
    category: {
      type: String,
      enum: TOUR_CATEGORIES,
      required: true,
      index: true,
    },
    image: { type: String, default: '' }, //cover img
    images: [String], //gallery
    itinerary: [itineraryDaySchema],
    inclusions: [String],
    exclusions: [String],
    availableDates: [Date],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tourSchema.index({ title: 'text', destination: 'text', location: 'text' });

export const Tour = mongoose.model('Tour', tourSchema)
