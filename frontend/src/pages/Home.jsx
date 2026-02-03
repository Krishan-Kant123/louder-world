import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { motion } from 'framer-motion';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]); // Add state for filtering
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [search, setSearch] = useState(''); // New state for search query

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data);
                setFilteredEvents(res.data); // Initialize filtered events
                setLoading(false);
            } catch (err) {
                console.error("Error fetching events", err);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearch(query);
        const filtered = events.filter(ev =>
            ev.title.toLowerCase().includes(query) ||
            ev.venue.name.toLowerCase().includes(query)
        );
        setFilteredEvents(filtered);
    };

    const handleGetTickets = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleSubmitLead = async (e) => {
        e.preventDefault();
        if (!email || !consent) return alert('Please provide email and consent.');

        try {
            await api.post('/leads', {
                email,
                eventId: selectedEvent._id,
                consent
            });

            // Redirect to original URL
            window.open(selectedEvent.originalURL, '_blank');
            setModalOpen(false);
            setEmail('');
            setConsent(false);
        } catch (err) {
            alert('Error saving info, redirecting anyway...');
            window.open(selectedEvent.originalURL, '_blank');
            setModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Hero Section */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-black tracking-tighter text-gray-900">SYD<span className="text-blue-600">EVENTS</span></h1>
                    <nav className="flex gap-4">
                        <a href="/admin/login" className="text-sm font-medium hover:text-blue-600 transition-colors">Admin Login</a>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Discover What's On in Sydney</h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-6">
                        Curated events from top sources. Updated automatically every day.
                    </p>
                    <input
                        type="text"
                        placeholder="Search events or venues..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full max-w-md px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map(event => (
                            <EventCard key={event._id} event={event} onGetTickets={handleGetTickets} />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative"
                    >
                        <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                        <h3 className="text-2xl font-bold mb-2">Get Tickets</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            You are being redirected to {selectedEvent?.sourceName}. <br />
                            Enter your email to unlock the link.
                        </p>

                        <form onSubmit={handleSubmitLead} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    required
                                    checked={consent}
                                    onChange={e => setConsent(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="consent" className="text-xs text-gray-500">
                                    I agree to receive updates about future events. (Required)
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                Continue to Tickets
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Home;
