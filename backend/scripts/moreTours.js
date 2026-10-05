// Extra tours for the seed script. Covers every category in TOUR_CATEGORIES.
// Tours marked PLACEHOLDER use a temporary image: drop your own photos into
// public/img/tours/<Country>/ and update the paths.
const PLACEHOLDER = '/img/login-hero.png';

export const moreTours = [
  {
    title: 'Bali Beach & Temple Escape',
    destination: 'Bali',
    location: 'Ubud & Seminyak, Indonesia',
    description:
      'Slow mornings on the sand, rice terrace walks and sunset temples.',
    price: 98000,
    duration: '6 days / 5 nights',
    category: 'beach',
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Seminyak',
        description: 'Hotel check-in and a beach sunset.',
      },
      {
        day: 3,
        title: 'Ubud day',
        description: 'Tegallalang rice terraces and the monkey forest.',
      },
      {
        day: 5,
        title: 'Uluwatu',
        description: 'Cliff temple and a seaside dinner.',
      },
    ],
    inclusions: [
      'Hotel stay',
      'Daily breakfast',
      'Airport transfers',
      'Private driver for day trips',
    ],
    exclusions: ['Flights', 'Visa on arrival fee', 'Lunches and dinners'],
    faq: [
      {
        question: 'When is the best time to visit?',
        answer:
          'April to October is the dry season, with clear skies and calmer seas.',
      },
      {
        question: 'Is the tour suitable for families?',
        answer:
          'Yes. Days are paced slowly, and we can add child-friendly activities on request.',
      },
    ],
  },
  {
    title: 'Maldives Overwater Retreat',
    destination: 'Maldives',
    location: 'North Malé Atoll, Maldives',
    description:
      'Private overwater villa, reef snorkelling and dinners on the sand.',
    price: 295000,
    duration: '5 days / 4 nights',
    category: 'luxury',
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    itinerary: [
      {
        day: 1,
        title: 'Speedboat to the resort',
        description: 'Welcome drink and villa check-in.',
      },
      {
        day: 3,
        title: 'Reef and sandbank',
        description: 'Guided snorkelling and a picnic on a sandbank.',
      },
    ],
    inclusions: [
      'Overwater villa',
      'Full board',
      'Speedboat transfers',
      'Snorkelling gear',
    ],
    exclusions: ['Flights', 'Spa treatments', 'Alcoholic drinks'],
    faq: [
      {
        question: 'Are meals included?',
        answer:
          'Yes, breakfast, lunch and dinner are included. Drinks outside the meal plan are extra.',
      },
      {
        question: 'Is it good for honeymoons?',
        answer:
          'It is built for couples, and we can arrange a private dinner or flowers on request.',
      },
    ],
  },
  {
    title: 'Swiss Alps Trail Week',
    destination: 'Switzerland',
    location: 'Interlaken & Zermatt, Switzerland',
    description:
      'Guided mountain hikes, glacier views and scenic rail journeys.',
    price: 210000,
    duration: '7 days / 6 nights',
    category: 'adventure',
    image: PLACEHOLDER,
    images: [PLACEHOLDER],
    itinerary: [
      {
        day: 1,
        title: 'Arrive in Interlaken',
        description: 'Lake walk and gear check.',
      },
      {
        day: 3,
        title: 'Jungfrau region',
        description: 'Cable car and a ridge hike with a guide.',
      },
      {
        day: 5,
        title: 'Zermatt',
        description: 'Glacier Express ride and Matterhorn viewpoint.',
      },
    ],
    inclusions: [
      'Mountain lodge stay',
      'Breakfast',
      'Swiss Travel Pass',
      'Certified hiking guide',
    ],
    exclusions: ['Flights', 'Schengen visa fee', 'Hiking boots'],
    faq: [
      {
        question: 'How fit do I need to be?',
        answer:
          'Moderate fitness is enough. Most hikes are 4 to 6 hours with easy options each day.',
      },
      {
        question: 'What should I pack?',
        answer:
          'Broken-in hiking boots, layers and a rain jacket. We send a full list after booking.',
      },
    ],
  },
  {
    title: 'Rome Ancient Highlights',
    destination: 'Italy',
    location: 'Rome, Italy',
    description: 'The Colosseum, the Vatican and long dinners in Trastevere.',
    price: 135000,
    duration: '5 days / 4 nights',
    category: 'culture',
    image: '/img/tours/Japan/rome.jpg',
    images: ['/img/tours/Japan/rome.jpg'],
    itinerary: [
      {
        day: 1,
        title: 'Old Rome walk',
        description: 'Pantheon, Trevi Fountain and Piazza Navona.',
      },
      {
        day: 2,
        title: 'Ancient Rome',
        description: 'Skip-the-line Colosseum and Roman Forum.',
      },
      {
        day: 3,
        title: 'Vatican City',
        description: 'Museums, Sistine Chapel and St. Peter’s.',
      },
    ],
    inclusions: [
      'Hotel stay',
      'Breakfast',
      'Skip-the-line tickets',
      'Local guide',
    ],
    exclusions: ['Flights', 'Schengen visa fee', 'City tourist tax'],
    faq: [
      {
        question: 'Are entry tickets included?',
        answer:
          'Yes, the Colosseum, Forum and Vatican Museums are all covered.',
      },
      {
        question: 'Is there a dress code?',
        answer:
          'Shoulders and knees must be covered inside the Vatican and churches.',
      },
    ],
  },
  {
    title: 'Istanbul & Cappadocia',
    destination: 'Turkey',
    location: 'Istanbul & Cappadocia, Turkey',
    description:
      'Bazaars and mosques in Istanbul, then balloons over the valleys.',
    price: 125000,
    duration: '6 days / 5 nights',
    category: 'city',
    image: '/img/tours/Japan/turkey.jpg',
    images: ['/img/tours/Japan/turkey.jpg'],
    itinerary: [
      {
        day: 1,
        title: 'Istanbul old city',
        description: 'Hagia Sophia, Blue Mosque and the Grand Bazaar.',
      },
      {
        day: 3,
        title: 'Fly to Cappadocia',
        description: 'Cave hotel check-in and valley sunset.',
      },
      {
        day: 4,
        title: 'Balloon morning',
        description: 'Sunrise balloon flight, weather permitting.',
      },
    ],
    inclusions: [
      'Hotel and cave stay',
      'Breakfast',
      'Internal flight',
      'Guided city tour',
    ],
    exclusions: [
      'International flights',
      'Balloon flight (optional add-on)',
      'Dinners',
    ],
    faq: [
      {
        question: 'Is the balloon flight guaranteed?',
        answer:
          'Flights depend on wind. If it is cancelled, you are refunded or rebooked for the next morning.',
      },
      {
        question: 'Do I need a visa?',
        answer:
          'Many nationalities need an e-visa. Check the current rules for your passport before travelling.',
      },
    ],
  },
  {
    title: 'Thailand Jungle & Islands',
    destination: 'Thailand',
    location: 'Chiang Mai & Krabi, Thailand',
    description:
      'Elephant sanctuaries and mountain trails, then limestone islands by longtail boat.',
    price: 89000,
    duration: '7 days / 6 nights',
    category: 'nature',
    image: '/img/tours/Japan/thland-bg.avif',
    images: ['/img/tours/Japan/thland-bg.avif'],
    itinerary: [
      {
        day: 1,
        title: 'Chiang Mai',
        description: 'Old city temples and a night market.',
      },
      {
        day: 3,
        title: 'Ethical elephant sanctuary',
        description: 'Feed and walk with rescued elephants.',
      },
      {
        day: 5,
        title: 'Krabi islands',
        description: 'Longtail boat to four islands with snorkelling.',
      },
    ],
    inclusions: [
      'Hotel stay',
      'Breakfast',
      'Domestic flight',
      'Island boat trip',
    ],
    exclusions: [
      'International flights',
      'Lunches and dinners',
      'Park entry fees',
    ],
    faq: [
      {
        question: 'Is the elephant visit ethical?',
        answer:
          'Yes. We only work with sanctuaries that do not offer riding or shows.',
      },
      {
        question: 'What is the weather like?',
        answer:
          'November to March is the driest period. Expect showers from June to October.',
      },
    ],
  },
];
