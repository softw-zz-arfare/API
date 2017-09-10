var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var router = express.Router();
var Schema = mongoose.Schema;

var User = require('../models/User');
var config = require('../helpers/config');

var ValidationErrors = {
  REQUIRED: 'required',
  NOTVALID: 'notvalid',
  /* ... */
};


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('API Endpoint. Functionality not defined for web.');
});

//User login
router.post('/login', function(req, res){

  console.log('user id for search : ' + req.body.email_id);
  User.findOne({'email_id': req.body.email_id}, function(err, user){
    console.log('user found' + user);
    if(err){
      console.log(err);
      res.json({'status': false, 'message': 'Something went wrong. Try again'});
    }

    if(user == null){
      res.json({status: false, message: 'User not found'});
    }else{

      if (user.password === req.body.password) {

        jwt.sign({"u_id": user._id}, config.secret, {expiresIn: '14d'}, function(err, token){
          if(err){
            console.log(err);
            res.json({status: false, message: "Cannot login now. Try again"});
          }else{
            console.log("login successful. sending response");
            res.json({status: true, user: user, token: token});
          }
        });

      }else{
        res.json({status: false, message: 'Password provided is incorrect'});
      }
    }
  });
});

router.post('/test', function(req, res){
  console.log(req.body);
  res.json(req.body);
});

router.post('/register', function(req, res){

  console.log('registering user ' + req.body.email_id);
  User.findOne({'email_id': req.body.email_id}, function(err, user){
    console.log('user found' + user);
    if(err){
      console.log(err);
      res.json({'status': false, 'message': 'Something went wrong. Try again'});
    }

    if(user != null){
      res.json({status: false, message: 'Already registered. Please try login with email id ' + user.email_id});
    }else{

      var _user = new User();
      console.log('email id : ' + req.body.email_id);
      _user.email_id = req.body.email_id;
      _user.first_name = req.body.first_name;
      _user.last_name = req.body.last_name;
      _user.password = req.body.password;

      _user.save(function(err){
        if(err){
          console.log(err);
          var errMessage = '';
          // go through all the errors...
          for (var errName in err.errors) {
            switch(err.errors[errName].type) {
              case ValidationErrors.REQUIRED:
                errMessage = i18n('Field is required');
                break;
              case ValidationErrors.NOTVALID:
                errMessage = i18n('Field is not valid');
                break;
            }
          }
          res.json({status: false, message: 'Something went wrong. Try again', error: errMessage});
        }else{
          jwt.sign({"u_id": _user._id}, config.secret, {expiresIn: '365d'}, function(err, token){
            if(err){
              console.log(err);
              res.json({status: false, message: "Cannot login now. Try again"});
            }else{
              console.log("token : " + token);
              res.json({status: true, user: _user, token: token});
            }
          });
        }
      });
    }
  });
});

module.exports = router;
