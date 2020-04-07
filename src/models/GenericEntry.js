const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenericEntrySchema = new Schema({
    prompt_text: String,
    prompt_audio: String,
    response_text: String,
    response_audio: String,
    source: String,
    tags: [String]
})

module.exports = mongoose.model('GenericEntry', GenericEntrySchema);