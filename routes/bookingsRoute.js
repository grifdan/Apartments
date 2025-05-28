const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const { v4: uuidv4 } = require('uuid');

router.post("/bookroom", async (req, res) => {
  const { room, userid, totalamount } = req.body;

  try {
    if (!room || !room.name || !room._id || !userid || totalamount == null) {
      return res.status(400).json({ error: "Missing required fields: room.name, room._id, userid, or totalamount" });
    }

    const newBooking = new Booking({
      room: room.name,
      roomid: room._id,
      userid,
      totalamount: Number(totalamount), // totalamount — число
      transactionId: uuidv4(), 
    });

    await newBooking.save();
    res.send("Успешное бронирование. В ближайшее время с вами свяжутся");
  } catch (error) {
    console.error("Ошибка бронирования:", error);
    return res.status(400).json({ error: error.message });
  }
});

router.post("/getbookingsbyuserid", async (req, res) => {
  const { userid } = req.body;

  try {
    const bookings = await Booking.find({ userid });
    res.send(bookings);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete("/cancelbooking", async (req, res) => {
  const { bookingId } = req.body;

  try {
    if (!bookingId) {
      return res.status(400).json({ error: "Missing bookingId" });
    }

    const result = await Booking.deleteOne({ _id: bookingId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.send("Booking cancelled successfully");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;