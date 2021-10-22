var mongoose = require("mongoose");

var SummarySchema = new mongoose.Schema({
    lecture_name : String,
    date : String,
    id: String,
    start : Number,
    summary: [String]
    }, {
        versionKey : false
    }
);

module.exports = mongoose.model('Summary', SummarySchema);