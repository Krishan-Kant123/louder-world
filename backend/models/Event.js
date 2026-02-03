const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  venue: {
    name: { type: String, default: 'TBA' },
    address: { type: String }
  },
  description: {
    type: String
  },
  category: {
    type: [String],
    default: []
  },
  imageURL: {
    type: String
  },
  sourceName: {
    type: String,
    required: true
  },
  originalURL: {
    type: String,
    required: true,
    unique: true // Deduplication key
  },
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  lastScrapedAt: {
    type: Date,
    default: Date.now
  },
  importedAt: {
    type: Date
  },
  importedBy: {
    type: String // User ID if Auth enabled
  },
  importNotes: {
    type: String
  }
}, { timestamps: true });

// Index for efficient queries
EventSchema.index({ status: 1 });
EventSchema.index({ dateTime: 1 });
EventSchema.index({ 'venue.name': 'text', title: 'text' }); // Search

module.exports = mongoose.model('Event', EventSchema);
