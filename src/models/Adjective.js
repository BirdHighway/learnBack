const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// connect to DB
const connection = mongoose.connect(process.env.CONSTRING,
    {useNewUrlParser: true, useUnifiedTopology: true});

const AdjectiveSchema = new Schema({
    eng_text: String,
    eng_audio: String,
    a_m_text: String,
    a_m_audio: String,
    a_f_text: String,
    a_f_audio: String,
    source: String,
    tags: [String]
})

module.exports = mongoose.model('Adjective', AdjectiveSchema);