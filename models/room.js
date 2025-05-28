const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  // name: { type: String, default: 'Не указано' },
  maxcount: { type: Number, default: 0 },
  phonenumber: { type: Number, default: 0 },
  rentperday: { type: Number, default: 0 },
  description: { type: String, default: 'Нет описания' },
  imageurls: { type: [String], default: [] },
  // type: { type: String, default: 'unknown' },
  author: { type: String },
  author_type: { type: String },
  url: { type: String },
  deal_type: { type: String },
  floor: { type: Number },
  floors_count: { type: Number },
  rooms_count: { type: Number },
  total_meters: { type: Number },
  price_per_month: { type: Number },
  commissions: { type: Number },
  price: { type: Number },
  street: { type: String },
  house_number: { type: String }, // Изменили на String
  underground: { type: String },
  location: { type: String },
  coordinates: {
    lat: { type: Number },
    lon: { type: Number },
  },
  residential_complex: { type: String },
}, { timestamps: true });

roomSchema.index({ coordinates: '2dsphere' });

const roomModel = mongoose.model('rooms', roomSchema);

module.exports = roomModel