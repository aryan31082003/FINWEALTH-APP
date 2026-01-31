const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload profile picture
router.post('/profile-pic', auth, upload.single('photo'), async (req, res) => {
    const imagePath = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.id, {
        profilePic: imagePath
    });

    res.json({ profilePic: imagePath });
});

// Update total salary / expense
router.put('/totals', auth, async (req, res) => {
    const { totalIncome, totalExpense } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { totalIncome, totalExpense },
        { new: true }
    );

    res.json({
        totalIncome: updatedUser.totalIncome,
        totalExpense: updatedUser.totalExpense
    });
});


// Get logged-in user profile
router.get('/me', auth, async (req, res) => {
    //const user = await User.findById(req.user.id).select('username profilePic');
    const user = await User.findById(req.user.id).select('username profilePic totalIncome totalExpense');
    res.json(user);
});

module.exports = router;
