var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Schema = mongoose.Schema;

var Story = require('../models/Story');
var User = require('../models/User');
var config = require('../helpers/config');

//middleware to check the token from req and generate user_id
router.use(function(req, res, next){
  var token = req.headers['x-access-token'];
  if(token){
    jwt.verify(token, config.secret, function(err, decode){
      if(err){
        console.log(err);
        res.json({status: false, message: 'Authentication failed'});
      }else{
        console.log(decode.u_id);
        User.findOne({"_id": decode.u_id}, function(err, user){
          if(err){
            console.log(err);
            res.json({status: false, message: "Unable to find user. Try re-login", error: err.message});
          }else{
            if(user.user_type == 1){
              req.body.user_id = decode.u_id;
              next();
            }else{
              res.json({status: false, message: "Unable to authorize Moderator"});
            }
          }
        });
      }
    })
  }else{
    res.json({status: false, message:'Authorization token not provided'});
  }
});

//Delete a story - only available for moderators and super admin
router.post('/:story_id/delete', function(req, res){

  Story.findOne({"_id": req.params.story_id}, function(err, story){
    if(err){
      console.log(err);
      res.json({status: false, message: "Cannot delete story now", error: err.message});
    }else{
      if(story == null){
        res.json({status: false, message: "Cannot find story"});
      }else{
        story.is_deleted = true;
        story.moderator_comments = req.body.moderator_comments;
        story.save(function(err){
          if(err){
            console.log(err);
            res.json({status: false, message: "Something went wrong", error: err.message});
          }else{
            res.json({status: true, message: "Story successfully deleted"});
          }
        });
      }
    }
  })
});

//Delete scene from a story - only for moderators
router.post('/:story_id/:scene_id/delete', function(req, res){

  Story.findOne({"_id": req.params.story_id}, function(err, story){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err});
    }else{

      story.scenes.id(req.params.scene_id).remove();
      story.save(function(err){
          if(err){
            console.log(err);
            res.json({status: false, message: "Something went wrong", error: err.message});
          }else{
            res.json({status: true, message: "Scene deleted successfully!"});
          }
      });
    }
  });
});

//Suspend a user - only for moderators
router.post('/:user_id/suspend', function(req, res){

  User.findOne({"_id": req.params.user_id}, function(err, user){
    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err.message});
    }else{
      if(user == null){
        res.json({status: false, message: "User not found"});
      }else{
        user.state = 2;
        user.save(function(err){
          if(err){
            console.log(err);
            res.json({status: false, message: "Something went wrong", error: err.message});
          }else{
            res.json({status: true, message: "User suspended successfully!"});
          }
        });
      }
    }
  });
});

module.exports = router;
