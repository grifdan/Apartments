const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register", async (req, res) => {
    const newUser = new User({
        Name: req.body.Name,
        email: req.body.email,
        password: req.body.password,
        likedApartments: []
    });

    try {
        await newUser.save();
        res.send('User Registered');
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email, password: password });
        if (user) {
            const temp = {
                Name: user.Name,
                email: user.email,
                isAdmin: user.isAdmin,
                _id: user._id,
                likedApartments: user.likedApartments.map(id => id.toString()) // Приводим к строкам
            }
            res.send(temp);
        } else {
            return res.status(400).json({ message: 'Login Failed' });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.post("/like", async (req, res) => {
    const { userId, roomId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const roomIdStr = roomId.toString();
        const likedApartments = user.likedApartments.map(id => id.toString());
        const index = likedApartments.indexOf(roomIdStr);
        if (index === -1) {
            user.likedApartments.push(roomId);
        } else {
            user.likedApartments.splice(index, 1);
        }
        await user.save();
        res.send(user.likedApartments.map(id => id.toString())); // Приводим к строкам
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.post('/update', async (req, res) => {
  const { userId, Name, phone, preferredLocations, income, savings } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { Name, phone, preferredLocations, income, savings },
      { new: true, runValidators: true }
    );
    res.send(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
