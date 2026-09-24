import { bookings } from '../../data/bookings.js';
import { tours } from '../../data/tours.js';

export default function UserDashboardPage() {
  return (
    <section className="dashboard-page">
      <h1>My Bookings</h1>
      {bookings.map((booking) => {
        const tour = tours.find((t) => t.id === booking.tourId);
        return (
          <div key={booking.id}>
            <p>{tour?.destination}</p>
            <p>Status: {booking.status}</p>
            <p>${booking.totalAmount}</p>
          </div>
        );
      })}
    </section>
  );
}
