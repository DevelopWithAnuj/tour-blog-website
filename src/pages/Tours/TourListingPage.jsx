import { Link } from 'react-router-dom';
import {tours} from '../../data/tours.js'

export default function TourListingPage() {
  return (
    <section className="tour-listing-page">
      <h1>Our Tours</h1>
      <div className="tour-grid">
        {tours.map((tour) => (
          <Link key={tour.id} to={`/tours/${tour.id}`} className="tour-card">
            <h3>{tour.destination}</h3>
            <p>{tour.location}</p>
            <p>{tour.price} · {tour.duration}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
