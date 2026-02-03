import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            // Fetch all (including inactive/new) for admin
            // Note: API might need to support filtering by status or we fetch all
            const res = await api.get('/events?city=');
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching events', err);
            setLoading(false);
        }
    };

    const handleImport = async (id) => {
        // Optimistic update
        const updatedEvents = events.map(e =>
            e._id === id ? { ...e, status: 'imported' } : e
        );
        setEvents(updatedEvents);

        // In real app, call API to update status
        // await api.post(`/admin/events/${id}/import`);
        alert(`Event ${id} imported! (Mock action)`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-green-100 text-green-800';
            case 'updated': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'imported': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Simple Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <div className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">Events</div>
                    <div className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Leads</div>
                    <div className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Settings</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                    <div className="text-sm text-gray-500">Syncs automatically via Server</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {event.title}
                                        <div className="text-xs text-gray-500 font-normal">{event.venue?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(event.dateTime).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{event.sourceName}</td>
                                    <td className="px-6 py-4 text-right">
                                        {event.status !== 'imported' && (
                                            <button
                                                onClick={() => handleImport(event._id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                                            >
                                                Import
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {events.length === 0 && !loading && (
                        <div className="p-10 text-center text-gray-500">No events found.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
