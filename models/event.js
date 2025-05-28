const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  userId: { type: String, default: 'anonymous' }, // ID юзера или 'anonymous'
  sessionId: { type: String, required: true }, // Уникальный ID сессии
  eventType: { type: String, required: true }, // 'view', 'filter', 'click'
  eventData: { type: Object, required: true }, // Данные события
  timestamp: { type: Date, default: Date.now },
});

const eventModel = mongoose.model('events', eventSchema);

module.exports = eventModel;