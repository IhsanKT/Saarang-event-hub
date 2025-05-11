import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`https://saarang-event-hub.onrender.com/api/events/${id}`);
        if (!res.ok) throw new Error('Event not found');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const isRegistered = () => {
    if (!event || !token) return false;
    // Check if current user is in attendees (by user id in JWT)
    // For now, just check if attendees array includes a userId from token
    // But we don't decode userId from token here, so registration status will be checked after registration/unregistration
    // For a real app, decode userId from token and compare
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return event.attendees.includes(payload.userId);
    } catch {
      return false;
    }
  };

  const handleRegister = async () => {
    setRegError('');
    setRegLoading(true);
    try {
      const res = await fetch(`https://saarang-event-hub.onrender.com/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleUnregister = async () => {
    setRegError('');
    setRegLoading(true);
    try {
      const res = await fetch(`https://saarang-event-hub.onrender.com/api/events/${id}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Unregistration failed');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-10">Loading event...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded shadow p-6">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Events</Link>
      <h1 className="text-3xl font-bold text-blue-700 mt-2 mb-2">{event.title}</h1>
      <div className="text-gray-600 mb-1">{new Date(event.date).toLocaleString()}</div>
      <div className="text-gray-500 mb-4">{event.location}</div>
      <div className="text-gray-700 mb-4">{event.description}</div>
      {token && !isRegistered() && (
        <div className="mb-4">
          <button
            onClick={handleRegister}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            disabled={regLoading}
          >
            {regLoading ? 'Registering...' : 'Register'}
          </button>
          {regError && <div className="text-red-600 text-sm mt-2">{regError}</div>}
        </div>
      )}
      {token && isRegistered() && (
        <div className="mb-4 text-green-700 font-semibold">You are registered for this event.</div>
      )}
      {!token && (
        <div className="mb-4">
          <button
            onClick={handleLoginRedirect}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}

export default EventDetail; 