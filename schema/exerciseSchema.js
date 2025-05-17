const mongoose = require('mongoose');
const { Types } = mongoose;

const excerciceSchema = new mongoose.Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now() }
});
const excerciceModel = mongoose.model('Excercice', excerciceSchema);

module.exports = { excerciceSchema, excerciceModel };