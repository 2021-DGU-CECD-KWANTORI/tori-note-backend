var mongoose = require("mongoose");

var ScriptSchema = new mongoose.Schema({
    lecture_name : String,
    date : String,
    id: String,
    start : Number,
    content: String},
    {
        versionKey : false
});

module.exports = mongoose.model('Script', ScriptSchema);