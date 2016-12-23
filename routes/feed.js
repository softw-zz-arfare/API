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

//get all feeds with pagination
router.post('/all/:page_number', function(req, res){

  Feed.paginate({}, {page: req.params.page_number, limit: 20, sort: {time: -1}}, function(err, results){
    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong"});
    }else{
      res.json({status: true, results: results});
    }
  });
});

//Get feed of stories followed by user
router.post('/followed/:page_number', function(req, res){

  User.findOne({"_id": req.body.user_id}, function(err, user){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err.message});
    }else{
      Feed.paginate({"story_id": { $in : user.following}}, {page: req.params.page_number, limit: 20, sort: {time: -1}}, function(err, results){
        if(err){
          console.log(err);
          res.json({status: false, message: "Something went wrong"});
        }else{
          res.json({status: true, results: results});
        }
      });
    }
  });
});

module.exports = router;
