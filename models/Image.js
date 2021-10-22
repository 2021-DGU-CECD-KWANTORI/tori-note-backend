var mongoose = require("mongoose");

var ImageSchema = new mongoose.Schema({
    lecture_name : String,
    date : String,
    id: String,
    start : Number,
    image: String},
    {
        versionKey : false
});

module.exports = mongoose.model('Image', ImageSchema);