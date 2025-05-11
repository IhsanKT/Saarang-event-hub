import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRegistrators() {
  const { id } = useParams();
  const { adminToken, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAdmin]);

  if (!isAdmin) {
    return <div className="max-w-2xl mx-auto mt-8 text-red-600 font-bold">Access denied. Admins only.</div>;
  }
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded shadow p-6">
      <button
        className="mb-4 bg-blue-200 text-blue-800 px-3 py-1 rounded hover:bg-blue-300 transition"
        onClick={() => navigate('/admin')}
      >
        &larr; Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Registrations for: {event.title}</h1>
      {event.attendees && event.attendees.length > 0 ? (
        <ul className="list-disc ml-6">
          {event.attendees.map(user => (
            <li key={user._id} className="mb-1">
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500">No registrators for this event.</div>
      )}
    </div>
  );
}

export default AdminRegistrators; 