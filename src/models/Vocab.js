const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// connect to DB
const connection = mongoose.connect(process.env.CONSTRING,
    {useNewUrlParser: true, useUnifiedTopology: true});

const NounSchema = new Schema({
    a_sing_text: {type: String, default: '', trim: true},
    a_sing_audio: {type: String, default: '', trim: true},
    a_pl_text: {type: String, default: '', trim: true},
    a_pl_audio: {type: String, default: '', trim: true}
})

const AdjSchema = new Schema({
    a_masc_text: {type: String, default: '', trim: true},
    a_masc_audio: {type: String, default: '', trim: true},
    a_fem_text: {type: String, default: '', trim: true},
    a_fem_audio: {type: String, default: '', trim: true},
    a_pl_text: {type: String, default: '', trim: true},
    a_pl_audio: {type: String, default: '', trim: true}
})

const VerbSchema = new Schema({
    a_past_3sm_audio: {type: String, default: '', trim: true},
    a_past_3sm_text: {type: String, default: '', trim: true},
    a_pres_3sm_audio: {type: String, default: '', trim: true},
    a_pres_3sm_text: {type: String, default: '', trim: true}
})

const WordSchema = new Schema({
    a_word_text: {type: String, default: '', trim: true},
    a_word_audio: {type: String, default: '', trim: true},
    a_word_text_2: {type: String, default: '', trim: true},
    a_word_audio_2: {type: String, default: '', trim: true},
    a_word_text_3: {type: String, default: '', trim: true},
    a_word_audio_3: {type: String, default: '', trim: true}
})

const Membership = new Schema({
    playlist_id: {type: String, default: '', trim: true},
    playlist_name: {type: String, default: '', trim: true},
    order: {type: Number, default: 999}
})


const VocabSchema = new Schema({
    type: {type: String, default: '', trim: true},
    created: {type: Date, default: Date.now},
    eng_text: {type: String, default: '', trim: true},
    eng_audio: {type: String, default: '', trim: true},
    lastPracticed: {type: Date, default: "1970-01-01T00:00:00.000Z"},
    everPracticed: {type: Boolean, default: false},
    lastPracticedB: {type: Date, default: "1970-01-01T00:00:00.000Z"},
    everPracticedB: {type: Boolean, default: false},
    mastered: {type: Boolean, default: false},
    dialect: {type: String, default: '', trim: true},
    source: {type: String, default: '', trim: true},
    tags: [String],
    playlist: Membership,
    data_noun: NounSchema,
    data_verb: VerbSchema,
    data_adj: AdjSchema,
    data_other: WordSchema
})

module.exports = mongoose.model('Vocab', VocabSchema);