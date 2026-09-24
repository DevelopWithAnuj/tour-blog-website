import axios from 'axios';
import { useEffect, useState } from 'react';
import requestLogger from '../utils/requestLogger.js';

function HomePage() {
  const [tour, setTour] = useState([]);

  useEffect(() => {
    const startTime = Date.now();
    const url = '/api/v1/tours';

    axios
      .get(url)
      .then((res) => {
        requestLogger.logFetch(url, startTime);
        setTour(res.data);
      })
      .catch((err) => {
        requestLogger.logFetch(url, startTime);
        console.log(err);
      });
  }, []);

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
