import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading events...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Upcoming Events</h1>
      {events.length === 0 ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <ul className="space-y-4">
          {events.map(event => (
            <li key={event._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold text-blue-800">{event.title}</div>
                <div className="text-gray-600">{new Date(event.date).toLocaleString()}</div>
                <div className="text-gray-500">{event.location}</div>
              </div>
              <Link to={`/events/${event._id}`} className="mt-2 md:mt-0 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">View Details</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventList; 