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
    // Make fetchEvent available for handleRegister
    EventDetail.fetchEvent = fetchEvent;
  }, [id]);

  const isRegistered = () => {
    if (!event || !token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Attendees:', event.attendees);
      console.log('UserId:', payload.userId);
      // Try to handle both array of objects and array of strings
      const attendeeIds = event.attendees.map(a => a._id || a);
      return attendeeIds.includes(payload.userId);
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
      if (!res.ok) {
        // If already registered, fetch latest event data to update UI
        await EventDetail.fetchEvent();
        throw new Error('Registration failed');
      }
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center mt-10 p-4 bg-red-50 text-red-600 rounded-lg">
      <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {error}
    </div>
  );
  
  if (!event) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-indigo-50">
        <div className="p-4 sm:p-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 mt-4 mb-3">{event.title}</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.date).toLocaleString()}
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
          </div>

          <div className="prose prose-indigo max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {token && !isRegistered() && (
            <div className="mb-4">
              <button
                onClick={handleRegister}
                className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={regLoading}
              >
                {regLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : 'Register'}
              </button>
              {regError && <div className="text-red-600 text-sm mt-2">{regError}</div>}
            </div>
          )}

          {token && isRegistered() && (
            <div className="mb-4">
              <div className="inline-flex items-center text-green-600 font-semibold">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                You are registered for this event
              </div>
            </div>
          )}

          {!token && (
            <div className="mb-4">
              <button
                onClick={handleLoginRedirect}
                className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetail; 
