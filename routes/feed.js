var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var paginate = require('mongoose-paginate');
var router = express.Router();
var Schema = mongoose.Schema;

var User = require('../models/User');
var config = require('../helpers/config');
var Feed = require('../models/Feed');

//middleware to check the token from req and generate user_id
router.use(function(req, res, next){
  var token = req.headers['x-access-token'];
  if(token){
    jwt.verify(token, config.secret, function(err, decode){
      if(err){
        console.log(err);
        res.json({status: false, message: 'Authentication failed', error_code: 9002});
      }else{
        console.log(decode.u_id);
        req.body.user_id = decode.u_id;
        next();
      }
    })
  }else{
    res.json({status: false, message:'Authorization token not provided', error_code: 9001});
  }
});

router.post("/find", function(req, res){

  res.json({status: true, message: "You are an Authorized user and here is your data"});

});

module.exports = router;
