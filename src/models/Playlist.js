const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// connect to DB
const connection = mongoose.connect(process.env.CONSTRING,
    {useNewUrlParser: true, useUnifiedTopology: true});

const PlaylistSchema = new Schema({
    created: {type: Date, default: Date.now},
    name: {type: String, default: '', trim: true},
    order: {type: Number, default: 999}
})

module.exports = mongoose.model('Playlist', PlaylistSchema);