import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { isAdmin, adminToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showAttendees, setShowAttendees] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://saarang-event-hub.onrender.com/api/events');
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
  }, [isAdmin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const url = editId
        ? `https://saarang-event-hub.onrender.com/api/events/${editId}`
        : 'https://saarang-event-hub.onrender.com/api/events';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save event');
      const data = await res.json();
      if (editId) {
        setEvents((prev) => prev.map((ev) => (ev._id === editId ? data : ev)));
      } else {
        setEvents((prev) => [...prev, data]);
      }
      setForm({ title: '', description: '', date: '', location: '' });
      setEditId(null);
      setActiveTab('all');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.slice(0, 16) : '',
      location: event.location,
    });
    setActiveTab('create');
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`https://saarang-event-hub.onrender.com/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleAttendees = (eventId) => {
    setShowAttendees((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  if (!isAdmin) {
    return <div className="max-w-2xl mx-auto mt-8 text-red-600 font-bold">Access denied. Admins only.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Dashboard</h1>
      <nav className="mb-6 flex gap-4 border-b pb-2">
        <button
          className={`px-4 py-2 rounded-t ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
          onClick={() => { setActiveTab('all'); setEditId(null); setForm({ title: '', description: '', date: '', location: '' }); }}
        >
          All Events
        </button>
        <button
          className={`px-4 py-2 rounded-t ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
          onClick={() => { setActiveTab('create'); setEditId(null); setForm({ title: '', description: '', date: '', location: '' }); }}
        >
          Create Event
        </button>
      </nav>
      {activeTab === 'create' && (
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{editId ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                name="title"
                className="w-full border rounded px-3 py-2"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                className="w-full border rounded px-3 py-2"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                className="w-full border rounded px-3 py-2"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={formLoading}
            >
              {formLoading ? (editId ? 'Saving...' : 'Creating...') : (editId ? 'Save Changes' : 'Create Event')}
            </button>
            {editId && (
              <button
                type="button"
                className="ml-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => { setEditId(null); setForm({ title: '', description: '', date: '', location: '' }); }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}
      {activeTab === 'all' && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Events</h2>
          {loading ? (
            <div>Loading events...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <ul className="space-y-4">
              {events.map(event => (
                <li key={event._id} className="border-b pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-blue-800">{event.title}</div>
                    <div className="text-gray-600">{new Date(event.date).toLocaleString()}</div>
                    <div className="text-gray-500">{event.location}</div>
                    <div className="text-sm text-gray-700">Number of registrations: {event.attendees ? event.attendees.length : 0}</div>
                    {event.attendees && event.attendees.length > 0 && (
                      <button
                        className="mt-2 mb-2 bg-blue-200 text-blue-800 px-3 py-1 rounded hover:bg-blue-300 transition"
                        onClick={() => navigate(`/admin/event/${event._id}/registrators`)}
                        type="button"
                      >
                        View the registrants for this event
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 