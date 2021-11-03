var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://tori:1234@localhost:27017/tori')
    .then(()=>console.log('connected Successfully'))
    .catch((err)=>console.error(err));

var streamRouter = require('./routes/streamRouter');
var scriptRouter = require('./routes/scriptRouter');
var timelineRouter = require('./routes/timelineRouter');
var storageRouter = require('./routes/storageRouter');
var keywordRouter = require('./routes/keywordRouter');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/stream', streamRouter);
app.use('/script', scriptRouter);
app.use('/timeline', timelineRouter);
app.use('/storage', storageRouter);
app.use('/keyword', keywordRouter);

module.exports = app;