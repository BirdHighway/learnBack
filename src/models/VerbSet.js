const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connection = mongoose.connect(process.env.CONSTRING,
    {useNewUrlParser: true, useUnifiedTopology: true});

const TenseSchema = new Schema({
    tense: {type: String, default: '', trim: true},
    he: {type: String, default: '', trim: true},
    i: {type: String, default: '', trim: true},
    she: {type: String, default: '', trim: true},
    they: {type: String, default: '', trim: true},
    we: {type: String, default: '', trim: true},
    you_female: {type: String, default: '', trim: true},
    you_male: {type: String, default: '', trim: true},
    you_plural: {type: String, default: '', trim: true}
})

const VerbSetSchema = new Schema({
    eng_text: {type: String, default: '', trim: true},
    eng_audio: {type: String, default: '', trim: true},
    a_audio_base: {type: String, default: '', trim: true},
    status: {type: String, default: '', trim: true},
    a_pres_text: TenseSchema,
    a_past_text: TenseSchema
})

module.exports = mongoose.model('VerbSet', VerbSetSchema);