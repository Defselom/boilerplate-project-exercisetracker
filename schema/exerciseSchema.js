const mongoose = require('mongoose');


const excerciceSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String },
    duration: { type: Number },
    date: { type: Date, default: Date.now() }
});
const existeModel = mongoose.model('Excercice', excerciceSchema);

module.exports = { excerciceSchema, existeModel };