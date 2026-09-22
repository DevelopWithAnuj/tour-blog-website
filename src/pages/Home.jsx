import axios from 'axios';
import { useEffect, useState } from 'react';

function HomePage() {
  const [tour, setTour] = useState([]);

  useEffect(() => {
    axios
      .get('/api/v1/tours')
      .then((res) => {
        setTour(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  return (
    <>
      <h1>Welcome to Drimora Tour</h1>
      <p>tours: {tour.length}</p>
      {tour.map((tour, index) => (
        <div key={tour.id}>
          <h3>{tour.title}</h3>
          <p>{tour.description}</p>
          <p>{tour.price}</p>

        </div>
      ))}
    </>
  );
}

export default HomePage;
