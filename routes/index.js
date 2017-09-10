var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var router = express.Router();

var User = require('../models/User');
var Feed = require('../models/Feed');

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { message: 'Welcome to MEAN Auth Sample'});

});

module.exports = router;
