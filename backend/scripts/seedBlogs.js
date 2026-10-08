import mongoose from 'mongoose';
import connectDB from '../db/db-connection.js';
import { BlogPost } from '../models/Blog.models.js';
import { User } from '../models/User.models.js';

const COVER = '/img/login-hero.png'; // placeholder, swap for real photos

const posts = [
  {
    title: 'A First-Timer’s Guide to the Norwegian Fjords',
    category: 'travel-guide',
    destination: 'Norway',
    excerpt: 'When to go, how to move around, and what to pack for the fjords.',
    content:
      'The fjords are best seen between late May and September, when the days are long and the ferries run often.\n\nBase yourself in Bergen or Tromsø, book fjord cruises a few days ahead, and pack waterproof layers even in summer.',
  },
  {
    title: 'Five Days in Kyoto and Tokyo',
    category: 'itinerary',
    destination: 'Japan',
    excerpt: 'A tested five-day route that balances temples, food and neon.',
    content:
      'Spend two days in Tokyo around Shibuya, Shinjuku and Asakusa, then take the bullet train to Kyoto.\n\nStart Kyoto mornings early at Fushimi Inari, and keep your last evening free for Gion.',
  },
  {
    title: 'Eating Your Way Through Istanbul',
    category: 'food',
    destination: 'Turkey',
    excerpt: 'From simit at sunrise to late-night kebabs, a street food tour.',
    content:
      'Begin with a simit and tea by the Bosphorus, then work through the Karaköy and Kadıköy markets.\n\nSave room for baklava, and always ask the vendor what is fresh that hour.',
  },
  {
    title: 'Why Rome Rewards Slow Travellers',
    category: 'culture',
    destination: 'Italy',
    excerpt: 'Skip the checklist and let the city come to you.',
    content:
      'Rome is layered with centuries of history on every corner, and the best moments are rarely on the list.\n\nSit in a small piazza, wander Trastevere after dark, and visit the big sights at opening time.',
  },
  {
    title: 'Bali on a Budget: What We Actually Spent',
    category: 'budget-travel',
    destination: 'Bali',
    excerpt: 'A line-by-line look at a week in Ubud and Seminyak.',
    content:
      'A guesthouse with breakfast, a scooter and local warung meals keep daily costs surprisingly low.\n\nThe real savings come from travelling in the shoulder season and skipping tourist-priced transfers.',
  },
  {
    title: 'The Night I Finally Saw the Northern Lights',
    category: 'personal-experience',
    destination: 'Norway',
    excerpt: 'Three cold nights, one clear sky, and a lesson in patience.',
    content:
      'We chased the aurora for two nights and saw nothing but cloud.\n\nOn the third night the sky cleared at midnight, and the whole horizon started to move.',
  },
];

await connectDB();

const author =
  (await User.findOne({ role: 'admin' })) || (await User.findOne());
if (!author) {
  console.error('No users found. Register an account first, then re-run.');
  await mongoose.disconnect();
  process.exit(1);
}

await BlogPost.deleteMany({});
// create() (not insertMany) so the slug hook runs for each post.
for (const [i, p] of posts.entries()) {
  await BlogPost.create({
    ...p,
    author: author._id,
    coverImage: COVER,
    status: 'published',
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  });
}

console.log(`Seeded ${posts.length} blog posts`);
await mongoose.disconnect();
