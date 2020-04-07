const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// connect to DB
const connection = mongoose.connect(process.env.CONSTRING,
    {useNewUrlParser: true, useUnifiedTopology: true});
    
const NounSchema = new Schema({
    eng_text: String,
    eng_audio: String,
    a_sing_text: String,
    a_sing_audio: String,
    a_pl_text: String,
    a_pl_audio: String,
    source: String,
    tags: [String]
})

module.exports = mongoose.model('Noun', NounSchema);