var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var router = express.Router();
var Schema = mongoose.Schema;

var User = require('../models/User');
var Story = require('../models/Story');
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

  console.log('user id for search : ' + req.body.facebook_id);
  User.findOne({'facebook_id': req.body.facebook_id}, function(err, user){
    console.log('user found' + user);
    if(err){
      console.log(err);
      res.json({'status': false, 'message': 'Something went wrong. Try again'});
    }

    if(user == null){
      res.json({status: false, message: 'User not found'});
    }else{

      user.device.device_type = req.body.device_type;
      user.device.device_token = req.body.device_token;
      user.save(function(err){
        if(err){
          throw err;
          res.json({status: false, message: 'Cannot login now. Try again.'});
        }else{

          jwt.sign({"u_id": user._id}, config.secret, {expiresIn: '14d'}, function(err, token){
            if(err){
              console.log(err);
              res.json({status: false, message: "Cannot login now. Try again"});
            }else{
              console.log("login successful. sending response");
              res.json({status: true, user: user, token: token});
            }
          });
        }
      });
    }
  });
});

router.post('/test', function(req, res){
  console.log(req.body);
  res.json(req.body);
});

router.post('/register', function(req, res){

  console.log('registering user ' + req.body.facebook_id);
  User.findOne({'facebook_id': req.body.facebook_id}, function(err, user){
    console.log('user found' + user);
    if(err){
      console.log(err);
      res.json({'status': false, 'message': 'Something went wrong. Try again'});
    }

    if(user != null){
      res.json({status: false, message: 'Already registered. Please try login with Facebook' + user.facebook_id});
    }else{

      var _user = new User();
      console.log('facebook id : ' + req.body.facebook_id);
      _user.facebook_id = req.body.facebook_id;
      _user.first_name = req.body.first_name;
      _user.last_name = req.body.last_name;
      _user.type = 2;
      if(req.body.location != null){
          _user.location.location_name = req.body.location_name;
        }
      _user.profile_pic_url = req.body.profile_pic_url;
      _user.status = 1;
      _user.signup_date = Date.now();
      _user.registration_source = 0;
      _user.device.device_type = req.body.device_type;
      _user.device.device_token = req.body.device_token;

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
              res.json({status: true, user: user, token: token});
            }
          });
        }
      });
    }
  });
});

module.exports = router;
