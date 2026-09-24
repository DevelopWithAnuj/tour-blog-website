import { useParams } from 'react-router-dom';
import { tours } from '../../data/tours';

export default function TourDetailsPage() {
  const { id } = useParams();
  const tour = tours.find((t) => t.id === Number(id));

  if (!tour) {
    return <section className='tour-details-page'>Tour not found.</section>
  }
  return (
    <section className="tour-details-page">
      <h1>{tour.destination}</h1>
      <p>{tour.location}</p>
      <p>{tour.description}</p>
      <p>
        ${tour.price} · {tour.duration}
      </p>
    </section>
  );
}
