var mongoose = require("mongoose");

var KeywordSchema = new mongoose.Schema({
    lecture_name : String,
    date : String,
    id: String,
    keyword: [String]
    }, {
        versionKey : false
    }
);

module.exports = mongoose.model('Keyword', KeywordSchema);