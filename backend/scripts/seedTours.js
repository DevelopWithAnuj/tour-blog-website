import mongoose from 'mongoose';
import connectDB from '../db/db-connection.js';
import { Tour } from '../models/Tour.models.js';

const tours = [
  {
    title: 'Fjords & Northern Lights',
    destination: 'Norway',
    location: 'Tromse, Norway',
    description: 'Chase the aurora and cruise through dramatic Arctic fjords.',
    price: 145000,
    duration: '6 days / 5 nights',
    category: 'nature',
    image: '/img/tours/Norway/images 6.jfif',
    images: [
      '/img/tours/Norway/images 10.jfif',
      '/img/tours/Norway/images 15.jfif',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Tromsø',
        description: 'Airport transfer and welcome dinner.',
      },
      {
        day: 2,
        title: 'Fjord cruise',
        description: 'Full-day cruise with lunch onboard.',
      },
      {
        day: 3,
        title: 'Aurora hunt',
        description: 'Night trip away from city lights.',
      },
    ],
    inclusions: [
      'Hostel stay',
      'Breakfast',
      'Airport transfers',
      'Guided tours',
    ],
    exclusions: ['Flights', 'Travel insurance', 'Personal expenses'],
  },
  {
    title: 'Big Apple Explorer',
    destination: 'New York',
    location: 'New York, USA',
    description:
      'Skyline views, Broadway nights, and the best food in the city.',
    price: 185000,
    duration: '5 days / 4 nights',
    category: 'city',
    image: '/img/tours/New-York/images18.jfif',
    images: [
      '/img/tours/New-York/images14.jfif',
      '/img/tours/New-York/images6.jfif',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Manhattan orientation',
        description: 'Times Square and Central Park.',
      },
      {
        day: 2,
        title: 'Statue of Liberty',
        description: 'Ferry, Ellis Island, Brooklyn Bridge sunset.',
      },
    ],
    inclusions: ['Hotel stay', 'Metro pass', 'Broadway ticket'],
    exclusions: ['Flights', 'Visa fees', 'Meals not listed'],
  },
  {
    title: 'Kyoto & Tokyo Classic',
    destination: 'Japan',
    location: 'Tokyo & Kyoto, Japan',
    description: 'Temples, tea houses and neon streets in one trip.',
    price: 165000,
    duration: '7 days / 6 nights',
    category: 'culture',
    image: '/img/tours/Japan/turkey.jpg',
    images: ['/img/tours/Japan/thland-bg.avif', '/img/tours/Japan/rome.jpg'],
    itinerary: [
      {
        day: 1,
        title: 'Tokyo arrival',
        description: 'Shibuya and Shinjuku night walk.',
      },
      {
        day: 4,
        title: 'Bullet train to Kyoto',
        description: 'Fushimi Inari and Gion district.',
      },
    ],
    inclusions: ['Hotel stay', 'JR rail pass', 'Tea ceremony'],
    exclusions: ['Flights', 'Lunches', 'Insurance'],
  },
];

await connectDB();
await Tour.deleteMany({});
await Tour.insertMany(tours);
console.log(`Seeded ${tours.length} tours`);
await mongoose.disconnect();
