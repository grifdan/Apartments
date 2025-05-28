const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  room: {
    type: String,
    required: true
  }, 

  roomid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'rooms', required: true 
  },

  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', required: true 
  },

  totalamount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "booked"
  }
}, {
  timestamps: true,
});

const bookingmodel = mongoose.model('bookings', bookingSchema);

module.exports = bookingmodel;