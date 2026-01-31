const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const auth = require('../middleware/auth'); // Protects these routes

// GET all records for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const { search, sortBy } = req.query;
        let query = { userId: req.user.id };

        if (search) {
            query.$or = [
                { category: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOptions = {};
        if (sortBy === 'amount') sortOptions.amount = -1;
        else sortOptions.date = -1;

        const records = await Record.find(query).sort(sortOptions);
        res.json(records);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST a new record
router.post('/', auth, async (req, res) => {
    try {
        const newRecord = new Record({ ...req.body, userId: req.user.id });
        await newRecord.save();
        res.json(newRecord);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE a record
router.delete('/:id', auth, async (req, res) => {
    await Record.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Record deleted" });
});


module.exports = router;