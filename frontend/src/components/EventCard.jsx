import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';

const EventCard = ({ event, onGetTickets }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                    src={event.imageURL || 'https://via.placeholder.com/400x200?text=Event+Image'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {event.status === 'updated' && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Updated
                    </span>
                )}
                {event.status === 'new' && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        New
                    </span>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-blue-600 font-semibold mb-2">
                    <span className="bg-blue-50 px-2 py-1 rounded-md">{event.sourceName}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {event.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>{new Date(event.dateTime).toLocaleString('en-AU', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="truncate">{event.venue?.name || 'Sydney, Australia'}</span>
                    </div>
                </div>

                <button
                    onClick={() => onGetTickets(event)}
                    className="w-full mt-auto bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 group"
                >
                    <FaTicketAlt className="transition-transform group-hover:rotate-12" />
                    Get Tickets
                </button>
            </div>
        </motion.div>
    );
};

export default EventCard;
