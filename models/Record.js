const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Income', 'Expense'], required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Record', RecordSchema);