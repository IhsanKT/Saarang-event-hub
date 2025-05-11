import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function MyRegistrations() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unregLoading, setUnregLoading] = useState({});

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://saarang-event-hub.onrender.com/api/users/registrations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch registrations');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [token]);

  const handleUnregister = async (eventId) => {
    setUnregLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      const res = await fetch(`https://saarang-event-hub.onrender.com/api/events/${eventId}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Unregistration failed');
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (err) {
      alert(err.message);
    } finally {
      setUnregLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  if (!token) {
    return <div className="max-w-2xl mx-auto mt-8 text-blue-700">Login to view your registrations.</div>;
  }
  if (loading) return <div className="text-center mt-10">Loading your registrations...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">My Registrations</h1>
      {events.length === 0 ? (
        <div className="text-gray-500">You have not registered for any events.</div>
      ) : (
        <ul className="space-y-4">
          {events.map(event => (
            <li key={event._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold text-blue-800">{event.title}</div>
                <div className="text-gray-600">{new Date(event.date).toLocaleString()}</div>
                <div className="text-gray-500">{event.location}</div>
              </div>
              <button
                onClick={() => handleUnregister(event._id)}
                className="mt-2 md:mt-0 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                disabled={!!unregLoading[event._id]}
              >
                {unregLoading[event._id] ? 'Unregistering...' : 'Unregister'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyRegistrations; 